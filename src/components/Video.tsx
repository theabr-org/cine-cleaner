import { useVideoData } from '@/context/useVideoData';
import { Actions } from '@/utils/store';
import { createResizeObserver } from '@solid-primitives/resize-observer';
import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { Redaction } from './Redaction';
import { RedactionMover } from './RedactionMover';
import { RedactionResizer } from './RedactionResizer';
import { Pause, Play } from 'lucide-solid';
import { ExportVideoButton } from './ExportVideoButton';
import { Button } from './ui/button';

export const Video: Component = () => {
  const [videoState, dispatch] = useVideoData();
  const [isPlaying, setIsPlaying] = createSignal(false);
  let videoRef!: HTMLVideoElement;

  const togglePlay = (): void => {
    if (isPlaying()) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(playing => !playing);
  };

  const onMouseLeave = (): void => {
    dispatch({ type: Actions.MouseLeave });
  };

  const startPlaying = (): void => {
    setIsPlaying(true);
  };
  const stopPlaying = (): void => {
    setIsPlaying(false);
  };

  onMount(() => {
    videoRef.addEventListener('play', startPlaying);
    videoRef.addEventListener('pause', stopPlaying);
    videoRef.addEventListener('ended', stopPlaying);
    window.addEventListener('mouseleave', onMouseLeave);

    if (videoState.videoDimensions == null) {
      createResizeObserver(videoRef, ({ width, height }, el) => {
        if (videoRef === el) {
          dispatch({
            type: Actions.ResizeVideo,
            payload: { width, height },
          });
        }
      });
      dispatch({
        type: Actions.SetVideoDimensions,
        payload: {
          width: videoRef.clientWidth,
          height: videoRef.clientHeight,
        },
      });
    }
  });

  onCleanup(() => {
    videoRef.removeEventListener('play', startPlaying);
    videoRef.removeEventListener('pause', stopPlaying);
    videoRef.removeEventListener('ended', stopPlaying);
    window.removeEventListener('mouseleave', onMouseLeave);
  });

  return (
    <>
      <div
        onMouseLeave={onMouseLeave}
        class="flex-1 relative min-h-0 max-h-full h-full"
      >
        <video ref={videoRef!} class="pointer-events-none h-auto max-h-full">
          <source src={videoState.videoSrc!} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div
          class="absolute top-0 left-0"
          style={{
            width: videoRef.clientWidth + 'px',
            height: videoRef.clientHeight + 'px',
          }}
        >
          <For each={videoState.redactions}>
            {redaction => (
              <Redaction redaction={redaction}>
                <Show when={!videoState.previewMode}>
                  <RedactionMover
                    redaction={redaction}
                    maxCoords={{
                      x: videoRef.clientWidth,
                      y: videoRef.clientHeight,
                    }}
                  />
                  <RedactionResizer redaction={redaction} />
                </Show>
              </Redaction>
            )}
          </For>
        </div>
      </div>
      <div class="flex flex-0 justify-between items-center gap-4">
        <Button class="w-[105px]" onClick={togglePlay}>
          {isPlaying() ? <Pause class="w-4 h-4" /> : <Play class="w-4 h-4" />}
          {isPlaying() ? 'Pause' : 'Play'}
        </Button>
        <Button
          variant="destructive"
          onClick={() => dispatch({ type: Actions.AddRedaction })}
        >
          Add Redaction
        </Button>
        <ExportVideoButton videoRef={videoRef} />
      </div>
    </>
  );
};
