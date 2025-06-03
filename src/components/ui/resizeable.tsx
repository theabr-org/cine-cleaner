import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import type { Redaction } from '../../utils/store';
import { cn } from './cn';
import { cva, VariantProps } from 'class-variance-authority';
import { match, P } from 'ts-pattern';

const resizeableVariants = cva('absolute cursor-move', {
  variants: {
    previewMode: {
      true: 'border-none',
      false: 'border-2 border-red-500 bg-red-500/50',
    },
    backgroundColor: {
      black: 'bg-[#000000]',
      white: 'bg-[#ffffff]',
    },
  },
  compoundVariants: [
    {
      previewMode: false,
      class: 'border-2 border-red-500 bg-red-500/50',
    },
    {
      previewMode: true,
      backgroundColor: 'white',
      className: 'bg-[#ffffff]',
    },
    {
      previewMode: true,
      backgroundColor: 'black',
      className: 'bg-[#000000]',
    },
  ],
  defaultVariants: {
    previewMode: false,
    backgroundColor: 'black',
  },
});
type Position = { x: number; y: number };
type Dimensions = { width: number; height: number };

type ResizableProps = VariantProps<typeof resizeableVariants> & {
  redaction: Redaction;
  onPositionChange: (position: Position) => void;
  onDimensionChange: (dimensions: Dimensions, position: Position) => void;
  onRemove: () => void;
  bounds: { width: number; height: number };
};

type ResizeDirection =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight';

export const Resizeable: Component<ResizableProps> = props => {
  const [isDragging, setIsDragging] = createSignal(false);
  const [isResizing, setIsResizing] = createSignal(false);
  const [resizeDirection, setResizeDirection] =
    createSignal<ResizeDirection | null>(null);
  const [position, setPosition] = createSignal<Position>({
    x: props.redaction.x,
    y: props.redaction.y,
  });
  const [dimensions, setDimensions] = createSignal<Dimensions>({
    width: props.redaction.width,
    height: props.redaction.height,
  });
  const [currentPosition, setCurrentPosition] = createSignal<Position>({
    x: props.redaction.x,
    y: props.redaction.y,
  });

  const [onBoundary, setOnBoundary] = createSignal<ResizeDirection | null>(
    null
  );

  createEffect(() => {
    // redactions can be resized when the screen is resized, this ensures that
    // the resizeable is always in sync with the redaction
    setPosition({
      x: props.redaction.x,
      y: props.redaction.y,
    });
    setDimensions({
      width: props.redaction.width,
      height: props.redaction.height,
    });
  });

  let elementRef: HTMLDivElement | undefined;

  // constrains the position of the resizeable to the bounds of the video element
  const constrainPosition = (pos: Position): Position => {
    const { width, height } = dimensions();
    const { width: boundsWidth, height: boundsHeight } = props.bounds;
    const deltaX = boundsWidth - width;
    const deltaY = boundsHeight - height;

    const constrainedPos = {
      x: Math.max(0, Math.min(pos.x, deltaX)),
      y: Math.max(0, Math.min(pos.y, deltaY)),
    };

    const boundary = getBoundary(constrainedPos, {
      width: deltaX,
      height: deltaY,
    });
    if (boundary && boundary !== onBoundary()) {
      setOnBoundary(boundary);
    }

    return constrainedPos;
  };

  // constrains the dimensions of the resizeable to the bounds of the video element
  const constrainDimensions = (
    dim: Dimensions,
    pos: Position
  ): {
    dim: Dimensions;
    pos: Position;
  } => {
    const { width, height } = dimensions();
    const { width: boundsWidth, height: boundsHeight } = props.bounds;
    const deltaX = boundsWidth - width;
    const deltaY = boundsHeight - height;

    let newWidth = dim.width;
    let newHeight = dim.height;
    let newX = pos.x;
    let newY = pos.y;

    // Constrain width
    if (newX + newWidth > props.bounds.width) {
      newWidth = props.bounds.width - newX;
    }
    if (newX < 0) {
      newWidth += newX;
      newX = 0;
    }

    // Constrain height
    if (newY + newHeight > props.bounds.height) {
      newHeight = props.bounds.height - newY;
    }
    if (newY < 0) {
      newHeight += newY;
      newY = 0;
    }

    // Ensure minimum dimensions
    newWidth = Math.max(30, newWidth);
    newHeight = Math.max(30, newHeight);
    const position = { x: newX, y: newY };
    const boundary = getBoundary(position, { width: deltaX, height: deltaY });
    if (boundary && boundary !== onBoundary()) {
      setOnBoundary(boundary);
    }
    return {
      dim: { width: newWidth, height: newHeight },
      pos: position,
    };
  };

  // position should be relative to the video element
  const getRelativePosition = (e: MouseEvent): Position => {
    if (!elementRef?.parentElement) return { x: 0, y: 0 };
    const rect = elementRef.parentElement.getBoundingClientRect();
    let rawY = e.clientY - rect.top;
    let rawX = e.clientX - rect.left;

    // If we're outside bounds, return the boundary position
    if (props.bounds) {
      if (rawY < 0) {
        rawY = 0;
      }
      if (rawY > props.bounds.height) {
        rawY = props.bounds.height;
      }
      if (rawX < 0) {
        rawX = 0;
      }
      if (rawX > props.bounds.width) {
        rawX = props.bounds.width;
      }
    }

    return { x: rawX, y: rawY };
  };

  const handleMouseDown = (e: MouseEvent, direction?: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPosition(getRelativePosition(e));
    if (direction) {
      setIsResizing(true);
      setResizeDirection(direction);
    } else {
      setIsDragging(true);
    }
  };

  // custom update function to handle the boundary logic
  const updatePosition = (relativePosition: Position) => {
    const { width, height } = props.bounds;
    const { x, y } = currentPosition();
    const padding = 10;

    match(onBoundary())
      .with('topLeft', () => {
        setCurrentPosition({
          x: relativePosition.x > padding ? relativePosition.x : padding,
          y: relativePosition.y > padding ? relativePosition.y : padding,
        });
        if (relativePosition.x > padding && relativePosition.y > padding) {
          setOnBoundary(null);
        }
      })
      .with('topRight', () => {
        setCurrentPosition({
          x: relativePosition.x < width - padding ? relativePosition.x : x,
          y: relativePosition.y > padding ? relativePosition.y : y,
        });
        if (
          relativePosition.x < width - padding &&
          relativePosition.y > padding
        ) {
          setOnBoundary(null);
        }
      })
      .with('bottomLeft', () => {
        setCurrentPosition({
          x: relativePosition.x > width - padding ? relativePosition.x : x,
          y: relativePosition.y < height - padding ? relativePosition.y : y,
        });
        if (
          relativePosition.x > width - padding &&
          relativePosition.y < height - padding
        ) {
          setOnBoundary(null);
        }
      })
      .with('bottomRight', () => {
        setCurrentPosition({
          x: relativePosition.x < width - padding ? relativePosition.x : x,
          y: relativePosition.y < height - padding ? relativePosition.y : y,
        });
        if (
          relativePosition.x < width - padding &&
          relativePosition.y < height - padding
        ) {
          setOnBoundary(null);
        }
      })
      .with('bottom', () => {
        setCurrentPosition({
          x: relativePosition.x,
          y: relativePosition.y < height - padding ? relativePosition.y : y,
        });
        if (relativePosition.y < height - padding) {
          setOnBoundary(null);
        }
      })
      .with('right', () => {
        setCurrentPosition({
          x: relativePosition.x < width - padding ? relativePosition.x : x,
          y: relativePosition.y,
        });
        if (relativePosition.x < width - padding) {
          setOnBoundary(null);
        }
      })
      .with('left', () => {
        setCurrentPosition({
          x: relativePosition.x > padding ? relativePosition.x : x,
          y: relativePosition.y,
        });
        if (relativePosition.x > padding) {
          setOnBoundary(null);
        }
      })
      .with('top', () => {
        setCurrentPosition({
          x: relativePosition.x,
          y: relativePosition.y > padding ? relativePosition.y : y,
        });
        if (relativePosition.y > padding) {
          setOnBoundary(null);
        }
      })
      .with(P.nullish, () => {
        setCurrentPosition(relativePosition);
      })
      .exhaustive();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() && !isResizing()) return;

    const newPosition = getRelativePosition(e);

    const dx = newPosition.x - currentPosition().x;
    const dy = newPosition.y - currentPosition().y;

    const newX = position().x + dx;
    const newY = position().y + dy;

    updatePosition(newPosition);
    if (isDragging()) {
      const newPos = constrainPosition({
        x: newX,
        y: newY,
      });
      setPosition(newPos);
    } else if (isResizing()) {
      const direction = resizeDirection()?.toLowerCase();
      if (!direction) return;
      let newWidth = dimensions().width;
      let newHeight = dimensions().height;
      let newX = position().x;
      let newY = position().y;

      // Handle horizontal resizing
      if (direction.includes('right')) {
        newWidth = dimensions().width + dx;
      } else if (direction.includes('left')) {
        newWidth = dimensions().width - dx;
        newX = position().x + dx;
      }

      // Handle vertical resizing
      if (direction.includes('bottom')) {
        newHeight = dimensions().height + dy;
      } else if (direction.includes('top')) {
        newHeight = dimensions().height - dy;
        newY = position().y + dy;
      }

      const { dim, pos } = constrainDimensions(
        { width: newWidth, height: newHeight },
        { x: newX, y: newY }
      );
      setDimensions(dim);
      setPosition(pos);
    }
  };

  const handleMouseUp = () => {
    const isDeltaDim =
      dimensions().width !== props.redaction.width ||
      dimensions().height !== props.redaction.height;
    const isDeltaPos =
      position().x !== props.redaction.x || position().y !== props.redaction.y;
    if (isDeltaDim) {
      props.onDimensionChange(dimensions(), position());
    }
    if (isDeltaPos) {
      props.onPositionChange(position());
    }
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  const getClassNames = (direction: ResizeDirection) => {
    const baseClasses = 'absolute';
    const cursorClasses = {
      top: 'cursor-ns-resize',
      bottom: 'cursor-ns-resize',
      left: 'cursor-ew-resize',
      right: 'cursor-ew-resize',
      topLeft: 'cursor-nwse-resize',
      bottomRight: 'cursor-nwse-resize',
      topRight: 'cursor-nesw-resize',
      bottomLeft: 'cursor-nesw-resize',
    };
    const positionClasses = {
      top: 'w-full h-1 -translate-x-1/2 -top-1 left-1/2',
      right: 'w-1 h-full -translate-y-1/2 -right-1 top-1/2',
      bottom: 'w-full h-1 -translate-x-1/2 -bottom-1 left-1/2',
      left: 'w-1 h-full -translate-y-1/2 -left-1 top-1/2',
      topLeft: 'w-1 h-1 -top-1 -left-1',
      topRight: 'w-1 h-1 -top-1 -right-1',
      bottomRight: 'w-1 h-1 -bottom-1 -right-1',
      bottomLeft: 'w-1 h-1 -bottom-1 -left-1',
    };

    return cn(
      baseClasses,
      cursorClasses[direction],
      positionClasses[direction]
    );
  };

  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <div
      ref={elementRef}
      class={cn(
        resizeableVariants({
          previewMode: props.previewMode,
          backgroundColor: props.backgroundColor,
        })
      )}
      style={{
        left: `${position().x}px`,
        top: `${position().y}px`,
        width: `${dimensions().width}px`,
        height: `${dimensions().height}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={e => handleMouseDown(e)}
    >
      {/* Top handle */}
      <div
        class={getClassNames('top')}
        onMouseDown={e => handleMouseDown(e, 'top')}
      />

      {/* Right handle */}
      <div
        class={getClassNames('right')}
        onMouseDown={e => handleMouseDown(e, 'right')}
      />

      {/* Bottom handle */}
      <div
        class={getClassNames('bottom')}
        onMouseDown={e => handleMouseDown(e, 'bottom')}
      />

      {/* Left handle */}
      <div
        class={getClassNames('left')}
        onMouseDown={e => handleMouseDown(e, 'left')}
      />

      {/* Top-left handle */}
      <div
        class={getClassNames('topLeft')}
        onMouseDown={e => handleMouseDown(e, 'topLeft')}
      />

      {/* Top-right handle */}
      <div
        class={getClassNames('topRight')}
        onMouseDown={e => handleMouseDown(e, 'topRight')}
      />

      {/* Bottom-right handle */}
      <div
        class={getClassNames('bottomRight')}
        onMouseDown={e => handleMouseDown(e, 'bottomRight')}
      />

      {/* Bottom-left handle */}
      <div
        class={getClassNames('bottomLeft')}
        onMouseDown={e => handleMouseDown(e, 'bottomLeft')}
      />

      <button
        class="absolute top-1 right-1 transition-opacity duration-200 cursor-pointer"
        classList={{
          'opacity-100': isHovered(),
          'opacity-0': !isHovered(),
        }}
        onClick={e => {
          e.stopPropagation();
          props.onRemove();
        }}
      >
        <div class="text-xs w-5 h-5 bg-red-500 text-white rounded-full display-flex items-center justify-center">
          &times;
        </div>
      </button>
    </div>
  );
};

const getBoundary = (
  pos: Position,
  bounds: { width: number; height: number }
) =>
  match(pos)
    .with({ x: 0, y: 0 }, () => 'topLeft' as const)
    .with(
      { x: P.when(x => x === bounds.width), y: 0 },
      () => 'topRight' as const
    )
    .with(
      { x: 0, y: P.when(y => y === bounds.height) },
      () => 'bottomLeft' as const
    )
    .with(
      {
        x: P.when(x => x === bounds.width),
        y: P.when(y => y === bounds.height),
      },
      () => 'bottomRight' as const
    )
    .with({ x: 0 }, () => 'left' as const)
    .with({ y: 0 }, () => 'top' as const)
    .with({ x: P.when(x => x === bounds.width) }, () => 'right' as const)
    .with({ y: P.when(y => y === bounds.height) }, () => 'bottom' as const)
    .otherwise(() => null);
