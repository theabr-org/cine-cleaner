import { useVideoData } from '@/context/useVideoData';
import { OctagonAlert, ShieldCheck } from 'lucide-solid';
import { Component, Show } from 'solid-js';

export const TimeWarning: Component<{ duration: number }> = props => {
  const [videoState] = useVideoData();

  const getTrimLength = (): number => {
    return videoState.endTime - videoState.startTime;
  };
  const isValidDuration = (): boolean => {
    return getTrimLength() <= 10;
  };

  return (
    <Show when={props.duration > 10}>
      <div
        class="h-24 w-full mt-4 p-4 bg-red-50 rounded border-l-4 border-red-400 text-red-700"
        classList={{
          ['bg-red-50 border-red-400 text-red-700']: !isValidDuration(),
          ['bg-green-50 border-green-400 text-green-700']: isValidDuration(),
        }}
      >
        <div class="flex items-center">
          <Show
            when={!isValidDuration()}
            fallback={<ShieldCheck class="w-5 h-5 mr-2" />}
          >
            <OctagonAlert class="w-5 h-5 mr-2" />
          </Show>
          <p class="text-sm font-medium">Video Length Warning</p>
        </div>
        <Show
          when={!isValidDuration()}
          fallback={
            <p>
              Video is now trimmed to {getTrimLength().toFixed(2)} seconds. You
              may continue to use the sliders if you would like a shorter clip.
            </p>
          }
        >
          <p>
            The video length cannot exceed 10 seconds. Please use the sliders at
            the bottom of the video to select a time range to limit the video to
            10 seconds or less.
          </p>
        </Show>
      </div>
    </Show>
  );
};
