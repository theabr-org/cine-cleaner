import { Show, Component } from "solid-js"

import { useVideoData } from "@/context/useVideoData"
import { Actions } from "@/utils/store"
import { Video } from "./Video"
import { VideoUploader } from "./VideoUploader"

const VideoEditor: Component = () => {
  const [videoState, dispatch] = useVideoData()

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
                videoState.previewMode ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-pressed={videoState.previewMode}
              aria-label="Toggle preview mode"
            >
              <span
                class={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  videoState.previewMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <Show when={videoState.videoSrc} fallback={<VideoUploader />}>
          <Video />
        </Show>
      </div>
    </div>
  )
}

export default VideoEditor
