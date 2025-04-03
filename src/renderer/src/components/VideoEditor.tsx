import {
  createSignal,
  Show,
  Component,
  For,
  createEffect,
  onCleanup,
} from 'solid-js';
import { Redaction } from './Redaction';
import { Pause, Play, Upload } from 'lucide-solid';
import { RedactionMover } from './RedactionMover';
import { RedactionResizer } from './RedactionResizer';
import { ExportVideoButton } from './ExportVideoButton';
import { useVideoData } from '@renderer/context/useVideoData';
import { Actions } from '@renderer/store';

const VideoEditor: Component = () => {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [videoState, dispatch] = useVideoData();

  let videoRef!: HTMLVideoElement;

  const handleFileUpload = async (): Promise<void> => {
    console.log('handleFileUpload');
    const filePath = await window.api.selectVideo(); // Call Electron API
    if (!filePath) return;
    dispatch({ type: Actions.SetVideoSrc, payload: filePath });
  };

  const togglePlay = (): void => {
    if (isPlaying()) {
      videoRef.pause();
    } else {
      videoRef.play();
    }
    setIsPlaying(!isPlaying());
  };

  const onMouseLeave = (): void => {
    dispatch({ type: Actions.MouseLeave });
  };

  createEffect(() => {
    if (videoRef) {
      videoRef.addEventListener('play', () => setIsPlaying(true));
      videoRef.addEventListener('pause', () => setIsPlaying(false));
      videoRef.addEventListener('ended', () => setIsPlaying(false));
    }
    window.addEventListener('mouseleave', onMouseLeave);
    onCleanup(() => {
      if (videoRef) {
        videoRef.removeEventListener('play', () => setIsPlaying(true));
        videoRef.removeEventListener('pause', () => setIsPlaying(false));
        videoRef.removeEventListener('ended', () => setIsPlaying(false));
      }
      window.removeEventListener('mouseleave', onMouseLeave);
    });
  });

  return (
    <div class="h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      <div class="bg-white w-2xl max-h-full flex flex-col items-center rounded-lg shadow-lg p-6 space-y-4">
        <div class="flex flex-0 w-100 items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-800">Cine Cleaner</h1>
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

        <Show
          when={videoState.videoSrc}
          fallback={
            <>
              <div class="flex-3 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <button class="cursor-pointer" onClick={handleFileUpload}>
                  <Upload class="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p class="text-gray-500">Upload a video to begin</p>
                </button>
              </div>
              <div class="flex-0" />
            </>
          }
        >
          <div
            onMouseLeave={onMouseLeave}
            class="flex-1 relative min-h-0 max-h-full h-full"
          >
            <video
              ref={videoRef!}
              class="pointer-events-none h-auto max-h-full"
            >
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
            <button
              class="px-4 py-2 bg-blue-500 w-[105px] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              onClick={togglePlay}
            >
              {isPlaying() ? (
                <Pause class="w-4 h-4" />
              ) : (
                <Play class="w-4 h-4" />
              )}
              {isPlaying() ? 'Pause' : 'Play'}
            </button>
            <button
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              onClick={() => dispatch({ type: Actions.AddRedaction })}
            >
              Add Redaction
            </button>
            <ExportVideoButton videoRef={videoRef} />
          </div>
        </Show>
      </div>
    </div>
  );
};

export default VideoEditor;
