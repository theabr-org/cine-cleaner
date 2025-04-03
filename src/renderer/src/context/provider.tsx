import { createReducer } from '@renderer/hooks'
import { reducer, VideoAction, VideoState } from '@renderer/store'
import { createContext, ParentComponent } from 'solid-js'

export const VideoContext = createContext<ReturnType<
  typeof createReducer<VideoState, VideoAction>
> | null>(null)

export const VideoProvider: ParentComponent = (props) => {
  const store = createReducer(reducer, {
    videoSrc: null,
    videoPath: null,
    redactions: [],
    previewMode: false
  })
  return <VideoContext.Provider value={store}>{props.children}</VideoContext.Provider>
}
