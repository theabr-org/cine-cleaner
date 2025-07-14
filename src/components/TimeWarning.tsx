import { OctagonAlert } from 'lucide-solid';
import { Component, Show } from 'solid-js';

export const TimeWarning: Component<{ duration: number }> = props => {
  return (
    <Show when={props.duration > 10}>
      <div class="mt-4 p-4 bg-red-50 rounded border-l-4 border-red-400 text-red-700">
        <div class="flex items-center">
          <OctagonAlert class="w-5 h-5 mr-2" />
          <p class="text-sm font-medium">Video Length Warning</p>
        </div>
        <p>
          The video length cannot exceed 10 seconds. Please use the sliders at
          the bottom of the video to select a time range to limit the video to
          10 seconds or less.
        </p>
      </div>
    </Show>
  );
};
