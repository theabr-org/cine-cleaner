import { useVideoData } from '@/context/useVideoData';
import { Download } from 'lucide-solid';
import { Component, createSignal, Show } from 'solid-js';
import { Button } from './ui/button';
import { applyVideoEdits } from '@/utils/applyVideoEdits';

export const ExportVideoButton: Component<{
  videoRef: HTMLVideoElement;
}> = props => {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [processPercent, setProcessPercent] = createSignal(0);
  const [store] = useVideoData();

  const exportVideo = async (): Promise<void> => {
    setIsProcessing(true);

    try {
      const result = await applyVideoEdits({
        objectUrl: store.videoSrc!,
        redactions: store.redactions,
        startTime: store.startTime,
        endTime: store.endTime,
        redactionColor: store.redactionColor,
        container: {
          width: props.videoRef.clientWidth,
          height: props.videoRef.clientHeight,
        },
        onProgress: setProcessPercent,
      });

      if (!result.success) {
        alert(`Error exporting video: ${result.message}`);
        return;
      }

      // Download the file
      const link = document.createElement('a');
      link.href = result.objectUrl;
      link.download = 'redacted-video.mp4';
      link.click();
    } catch (error) {
      console.error('Error applying edits to video:', error);
    } finally {
      setIsProcessing(false);
      setProcessPercent(0);
    }
  };
  return (
    <>
      <Show when={isProcessing()}>
        <ProgressModal percent={processPercent()} />
      </Show>
      <Button
        variant="secondary"
        onClick={exportVideo}
        title={
          store.endTime - store.startTime > 10
            ? 'Exporting video longer than 10 seconds is not supported'
            : 'Export the video with redactions applied'
        }
        disabled={isProcessing() || store.endTime - store.startTime > 10}
      >
        <Download class="w-4 h-4" />
        Export Video
      </Button>
    </>
  );
};

const ProgressModal = (props: { percent: number }) => {
  return (
    <div class="fixed z-100 inset-0 flex items-center justify-center bg-gray-800/40">
      <div class="bg-white p-4 rounded shadow-lg">
        <h2 class="text-lg font-bold">Processing Video...</h2>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            class="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${props.percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
