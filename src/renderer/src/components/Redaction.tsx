import { Component } from 'solid-js';
import { RedactionMover } from './RedactionMover';
import { RedactionResizer } from './RedactionResizer';
import type { Redaction as TRedaction } from '@renderer/store';
import { useVideoData } from '@renderer/context/useVideoData';

type RedactionProps = {
  children?: ReturnType<typeof RedactionMover | typeof RedactionResizer>;
  redaction: TRedaction;
};
export const Redaction: Component<RedactionProps> = props => {
  const [store] = useVideoData();
  return (
    <div
      id={new Date().toISOString()}
      class="absolute  z-10"
      classList={{
        'pointer-events-none': store.previewMode,
        'bg-red-200 border-2 border-red-500 opacity-50': !store.previewMode,
        'bg-[black]': store.previewMode,
      }}
      style={{
        width: `${props.redaction.width}px`,
        height: `${props.redaction.height}px`,
        left: `${props.redaction.x}px`,
        top: `${props.redaction.y}px`,
      }}
    >
      {props.children}
    </div>
  );
};
