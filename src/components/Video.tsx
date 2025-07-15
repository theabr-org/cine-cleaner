import { useVideoData } from '@/context/useVideoData';
import { Actions } from '@/utils/store';
import { createResizeObserver } from '@solid-primitives/resize-observer';
import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
} from 'solid-js';
import { Redaction } from './Redaction';
import { Pause, Play } from 'lucide-solid';
import { ExportVideoButton } from './ExportVideoButton';
import { Button } from './ui/button';
import { ColorPicker } from './ui/color-picker';
import { TimeWarning } from './TimeWarning';
import { ScaleWarning } from './ScaleWarning';

export const Video: Component = () => {
  const [videoState, dispatch] = useVideoData();
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [duration, setDuration] = createSignal(0);
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

  const loopVideo = (): void => {
    if (videoRef.currentTime >= videoState.endTime) {
      videoRef.currentTime = videoState.startTime;
    }
  };

  createEffect(() => {
    videoRef.currentTime = videoState.startTime;
  });

  createEffect(prev => {
    if (prev !== 0) {
      videoRef.currentTime = videoState.endTime;
    }
    return videoState.endTime;
  });

  onMount(() => {
    videoRef.addEventListener('play', startPlaying);
    videoRef.addEventListener('pause', stopPlaying);
    videoRef.addEventListener('ended', stopPlaying);
    videoRef.addEventListener('timeupdate', loopVideo);

    if (videoState.videoDimensions == null) {
      createResizeObserver(videoRef, ({ width, height }, el) => {
        if (videoRef === el) {
          dispatch({
            type: Actions.ResizeVideo,
            payload: { width, height },
          });
        }
      });

      videoRef.onloadedmetadata = () => {
        videoRef.onloadedmetadata = null; // Remove the event listener after it runs once
        setDuration(videoRef.duration);
        dispatch({
          type: Actions.SetVideoDimensions,
          payload: {
            width: videoRef.clientWidth,
            height: videoRef.clientHeight,
            videoWidth: videoRef.videoWidth,
            videoHeight: videoRef.videoHeight,
            duration: videoRef.duration,
          },
        });
      };
    }
  });

  onCleanup(() => {
    videoRef.removeEventListener('play', startPlaying);
    videoRef.removeEventListener('pause', stopPlaying);
    videoRef.removeEventListener('ended', stopPlaying);
    videoRef.removeEventListener('timeupdate', loopVideo);
  });

  return (
    <>
      <ScaleWarning />
      <TimeWarning duration={duration()} />
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
        <VideoTimeControls duration={duration()} />
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

const VideoTimeControls: Component<{ duration: number }> = props => {
  const [videoState, dispatch] = useVideoData();

  const leftPercentage = (): number =>
    (videoState.startTime / props.duration) * 100;
  const rightPercentage = (): number =>
    (videoState.endTime / props.duration) * 100;
  const rangeWidth = (): number => rightPercentage() - leftPercentage();

  let trackRef!: HTMLDivElement;

  const handleMouseDown = (isLeftHandle: boolean) => {
    const preventDefault = (event: Event) => event.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      moveEvent.stopPropagation();

      const rect = trackRef.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (moveEvent.clientX - rect.left) / rect.width)
      );
      const newTime = percentage * props.duration;

      if (isLeftHandle && newTime >= videoState.endTime) {
        return; // Prevent moving left handle past right handle
      }
      if (!isLeftHandle && newTime <= videoState.startTime) {
        return; // Prevent moving right handle before left handle
      }

      if (isLeftHandle) {
        dispatch({ type: Actions.SetStartTime, payload: newTime });
      } else {
        dispatch({ type: Actions.SetEndTime, payload: newTime });
      }
    };

    const handleMouseUp = (): void => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventDefault);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // Prevent text selection while dragging
    document.addEventListener('selectstart', preventDefault);
  };

  const tooLong = (): boolean => videoState.endTime - videoState.startTime > 10;

  return (
    <div ref={trackRef} class="w-full relative h-2 bg-gray-200">
      <div
        class="absolute h-2"
        classList={{ ['bg-red-500']: tooLong(), ['bg-green-500']: !tooLong() }}
        style={{
          left: `calc(${leftPercentage()}% )`,
          width: `calc(${rangeWidth()}%)`,
        }}
      />
      <div
        class="rounded-full h-4 w-4 top-[-4px] absolute cursor-pointer"
        classList={{ ['bg-red-500']: tooLong(), ['bg-green-500']: !tooLong() }}
        style={{ left: `calc(${leftPercentage()}% - 8px)` }}
        onMouseDown={() => handleMouseDown(true)}
      />
      <div
        class="rounded-full h-4 w-4 top-[-4px] absolute cursor-pointer"
        classList={{ ['bg-red-500']: tooLong(), ['bg-green-500']: !tooLong() }}
        style={{ left: `calc(${rightPercentage()}% - 8px)` }}
        onMouseDown={() => handleMouseDown(false)}
      />
    </div>
  );
};
