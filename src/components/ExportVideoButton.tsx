import { useVideoData } from '@/context/useVideoData';
import { processVideoWithFFMPEG } from '@/utils/processVideo';
import { Download } from 'lucide-solid';
import { Component, createSignal, Show } from 'solid-js';
import { Button } from './ui/button';

export const ExportVideoButton: Component<{
  videoRef: HTMLVideoElement;
}> = props => {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [processPercent, setProcessPercent] = createSignal(0);
  const [store] = useVideoData();

  const exportVideo = async (): Promise<void> => {
    setIsProcessing(true);
    const videoRealHeight = props.videoRef.videoHeight;
    const videoRealWidth = props.videoRef.videoWidth;

    const videoContainer = props.videoRef.getBoundingClientRect();
    const videoContainerHeight = videoContainer.height;
    const videoContainerWidth = videoContainer.width;

    const heightRatio = videoRealHeight / videoContainerHeight;
    const widthRatio = videoRealWidth / videoContainerWidth;
    const redactions = store.redactions.map(redaction => {
      const x = redaction.x * widthRatio;
      const y = redaction.y * heightRatio;
      const width = redaction.width * widthRatio;
      const height = redaction.height * heightRatio;
      return {
        ...redaction,
        x,
        y,
        width,
        height,
      };
    });
    try {
      const result = await processVideoWithFFMPEG(
        store.videoSrc!,
        redactions,
        progress => {
          setProcessPercent(progress * 100);
        }
      );

      if (!result.success) {
        alert(`Error exporting video: ${result.message}`);
        return;
      } else {
        // Download the file
        const link = document.createElement('a');
        link.href = result.videoUrl;
        link.download = 'redacted-video.mp4';
        link.click();
      }
    } catch (error) {
      console.error('Error processing video:', error);
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
        disabled={isProcessing()}
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
