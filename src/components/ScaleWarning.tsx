import { useVideoData } from '@/context/useVideoData';
import {
  getScaledDimensions,
  MAX_DIMENSION,
  MIN_DIMENSION,
} from '@/utils/getScaledDimensions';
import { AlertCircle } from 'lucide-solid';
import { Component, Show } from 'solid-js';

export const ScaleWarning: Component = () => {
  const [videoState] = useVideoData();
  const isWarningVisible = () => {
    const { videoDimensions } = videoState;
    if (videoDimensions == null) return false;
    const { videoWidth, videoHeight } = videoDimensions;
    if (videoWidth < MIN_DIMENSION || videoHeight < MIN_DIMENSION) {
      return true;
    }
    if (videoWidth > MAX_DIMENSION || videoHeight > MAX_DIMENSION) {
      return true;
    }
    return false;
  };

  const scaleTo = () => {
    const { videoDimensions } = videoState;
    if (videoDimensions == null) return '';
    const { targetWidth, targetHeight } = getScaledDimensions(
      videoDimensions.videoWidth,
      videoDimensions.videoHeight
    );
    return `${targetWidth}x${targetHeight}`;
  };

  const getVideoDimensions = () => {
    const { videoDimensions } = videoState;
    if (videoDimensions == null) return '';
    const { videoWidth, videoHeight } = videoDimensions;
    return `${videoWidth}x${videoHeight}`;
  };

  return (
    <Show when={isWarningVisible()}>
      <div class="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400 text-yellow-700">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 mr-2" />
          <p class="text-sm font-medium">Video Resolution Warning</p>
        </div>
        <p>
          The required display dimensions of a video are {MIN_DIMENSION} pixels
          minimum and {MAX_DIMENSION} pixels maximum. This video is currently at{' '}
          {getVideoDimensions()}, and will be scaled to {scaleTo()}.
        </p>
      </div>
    </Show>
  );
};
