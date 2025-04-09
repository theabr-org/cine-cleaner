import { useVideoData } from '@renderer/context/useVideoData';
import { Download } from 'lucide-solid';
import { Component, createSignal } from 'solid-js';

export const ExportVideoButton: Component<{
  videoRef: HTMLVideoElement;
}> = props => {
  const [isProcessing, setIsProcessing] = createSignal(false);
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
        x,
        y,
        width,
        height,
      };
    });
    try {
      const result = await window.api.exportVideo({
        inputPath: store.videoPath!,
        redactions: JSON.stringify(redactions),
      });

      if (!result.isSuccess) {
        alert(`Error exporting video: ${result.errorMessage}`);
        return;
      } else {
        alert(`Video exported successfully: ${result.outputPath}`);
      }
    } catch (error) {
      console.error('Error processing video:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <button
      onClick={exportVideo}
      disabled={isProcessing()}
      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
    >
      <Download class="w-4 h-4" />
      Export Video
    </button>
  );
};
