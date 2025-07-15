import { createReducer } from '@/utils/hooks';
import { reducer, VideoAction, VideoState } from '@/utils/store';
import { createContext, ParentComponent } from 'solid-js';

export const VideoContext = createContext<ReturnType<
  typeof createReducer<VideoState, VideoAction>
> | null>(null);

export const VideoProvider: ParentComponent = props => {
  const store = createReducer(reducer, {
    videoSrc: null,
    redactions: [],
    previewMode: false,
    videoDimensions: null,
    redactionColor: 'black',
    startTime: 0,
    endTime: 0,
  });
  return (
    <VideoContext.Provider value={store}>
      {props.children}
    </VideoContext.Provider>
  );
};
