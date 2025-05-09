import { useVideoData } from '@/context/useVideoData';
import { Actions } from '@/utils/store';
import { createResizeObserver } from '@solid-primitives/resize-observer';
import { Component, createSignal, For, onCleanup, onMount } from 'solid-js';
import { Redaction } from './Redaction';
import { Pause, Play } from 'lucide-solid';
import { ExportVideoButton } from './ExportVideoButton';
import { Button } from './ui/button';
import { ColorPicker } from './ui/color-picker';

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
  });

  return (
    <>
      <section class="w-full">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-end">
            <span class="mr-2 text-sm text-gray-600">Set Redaction Color:</span>
            <ColorPicker
              value={videoState.redactionColor}
              onChange={color =>
                dispatch({
                  type: Actions.SetRedactionColor,
                  payload: color,
                })
              }
            />
          </div>
          <div class="flex items-center justify-end">
            <span class="mr-2 text-sm text-gray-600">Preview Mode:</span>
            <button
              onClick={() => dispatch({ type: Actions.TogglePreviewMode })}
              class={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                videoState.previewMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-pressed={videoState.previewMode}
              aria-label="Toggle preview mode"
            >
              <span
                class={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  videoState.previewMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>
      <div class="flex-1 relative min-h-0 max-h-full h-full">
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
            {redaction => <Redaction redaction={redaction}></Redaction>}
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
