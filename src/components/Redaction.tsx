import { Component } from 'solid-js';
import { Actions, type Redaction as TRedaction } from '@/utils/store';
import { useVideoData } from '@/context/useVideoData';
import { Resizeable } from './ui/resizeable';

type RedactionProps = {
  redaction: TRedaction;
};
export const Redaction: Component<RedactionProps> = props => {
  const [store, dispatch] = useVideoData();

  return (
    <Resizeable
      redaction={props.redaction}
      onPositionChange={newPosition => {
        dispatch({
          type: Actions.SetRedactionPosition,
          payload: {
            key: props.redaction.key,
            x: newPosition.x,
            y: newPosition.y,
          },
        });
      }}
      onDimensionChange={(newDim, newPosition) => {
        dispatch({
          type: Actions.SetRedactionSize,
          payload: {
            key: props.redaction.key,
            width: newDim.width,
            height: newDim.height,
            x: newPosition.x,
            y: newPosition.y,
          },
        });
      }}
      onRemove={() => {
        dispatch({
          type: Actions.RemoveRedaction,
          payload: props.redaction.key,
        });
      }}
      bounds={{
        width: store.videoDimensions!.width,
        height: store.videoDimensions!.height,
      }}
      backgroundColor={store.redactionColor}
      previewMode={store.previewMode}
    />
  );
};
