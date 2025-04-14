import { Show, Component } from 'solid-js';
import { Upload } from 'lucide-solid';

import { useVideoData } from '@renderer/context/useVideoData';
import { Actions } from '@renderer/store';
import { Video } from './Video';

const VideoEditor: Component = () => {
  const [videoState, dispatch] = useVideoData();

  const handleFileUpload = async (): Promise<void> => {
    const filePath = await window.api.selectVideo(); // Call Electron API
    if (!filePath) return;
    dispatch({ type: Actions.SetVideoSrc, payload: filePath });
  };

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
          <Video />
        </Show>
      </div>
    </div>
  );
};

export default VideoEditor;
