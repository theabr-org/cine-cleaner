import { Show, Component } from 'solid-js';
import { useVideoData } from '@/context/useVideoData';
import { Video } from './Video';
import { VideoUploader } from './VideoUploader';

const VideoEditor: Component = () => {
  const [videoState] = useVideoData();

  return (
    <div class="h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
      <div class="bg-white w-2xl max-h-full flex flex-col items-center rounded-lg shadow-lg p-6 space-y-4">
        <h1 class="text-2xl font-bold  text-center text-gray-800">
          Cine Cleaner
        </h1>

        <Show when={videoState.videoSrc} fallback={<VideoUploader />}>
          <Video />
        </Show>
      </div>
    </div>
  );
};

export default VideoEditor;
