import { useVideoData } from '@renderer/context/useVideoData';
import { Actions, type Redaction } from '@renderer/store';
import { Component, onCleanup, onMount } from 'solid-js';

export const RedactionResizer: Component<{
  redaction: Redaction;
}> = props => {
  const [, dispatch] = useVideoData();
  const onMouseDown = (e: MouseEvent): void => {
    e.stopPropagation();
    const newPosition = {
      x: e.clientX,
      y: e.clientY,
    };

    dispatch({
      type: Actions.StartResizeRedaction,
      payload: {
        key: props.redaction.key,
        newPosition,
      },
    });
  };
  const onMouseMove = (e: MouseEvent): void => {
    const { key, isResizing, isSelected, width, height, currentPosition } =
      props.redaction;
    if (currentPosition === null || !isResizing || !isSelected) {
      return;
    }

    const newPosition = {
      x: e.clientX,
      y: e.clientY,
    };
    const dx = newPosition.x - currentPosition.x;
    const dy = newPosition.y - currentPosition.y;

    dispatch({
      type: Actions.ResizeRedaction,
      payload: {
        key,
        width: width + dx,
        height: height + dy,
        newPosition,
      },
    });
  };
  const onMouseUp = (e: MouseEvent): void => {
    e.stopPropagation();
    dispatch({
      type: Actions.StopResizeRedaction,
      payload: props.redaction.key,
    });
  };

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });

  onCleanup(() => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  });
  return (
    <div
      class="absolute cursor-nwse-resize rounded bg-red-500"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        left: `${props.redaction.width - 3}px`,
        top: `${props.redaction.height - 3}px`,
        width: '7px',
        height: '7px',
      }}
    />
  );
};
