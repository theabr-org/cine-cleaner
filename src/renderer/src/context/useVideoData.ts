import { useContext } from 'solid-js';
import { VideoContext } from './provider';
import { VideoAction, VideoState } from '@renderer/store';

export const useVideoData = (): [VideoState, (action: VideoAction) => void] => {
  const store = useContext(VideoContext);
  if (!store) {
    throw new Error('useVideoData must be used within a VideoProvider');
  }
  return store;
};
