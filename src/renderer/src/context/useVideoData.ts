import { useContext } from "solid-js"
import { VideoContext } from "./provider"

export const useVideoData = () => {
  const store = useContext(VideoContext)
  if (!store) {
    throw new Error("useVideoData must be used within a VideoProvider")
  }
  return store
}
