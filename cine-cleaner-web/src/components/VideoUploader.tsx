import { Upload, AlertCircle } from "lucide-solid"
import { Actions } from "@/utils/store" // Import your store
import { useVideoData } from "@/context/useVideoData" // Import your context
import { createSignal } from "solid-js"

export const VideoUploader = () => {
  const [isDragging, setIsDragging] = createSignal<boolean>(false)
  const [error, setError] = createSignal<string>("")
  let fileInputRef!: HTMLInputElement

  const [, dispatch] = useVideoData()

  const handleDragEnter = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }

  const validateFile = (file: File): boolean => {
    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file only.")
      return false
    }

    // Clear any previous errors
    setError("")
    return true
  }

  const processVideoFile = (file: File): void => {
    dispatch({
      type: Actions.SetVideoSrc,
      payload: URL.createObjectURL(file),
    })
  }

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer?.files ?? []
    if (files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        processVideoFile(file)
      }
    }
  }

  const handleFileChange = (
    e: Event & {
      target: HTMLInputElement
    }
  ): void => {
    const files = e.target?.files
    if (files && files.length > 0) {
      const file = files[0]
      if (validateFile(file)) {
        processVideoFile(file)
      }
    }
  }

  const openFileDialog = (): void => {
    if (fileInputRef) {
      fileInputRef.click()
    }
  }

  return (
    <div class="w-full max-w-lg mx-auto">
      <div
        class={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging()
            ? "border-blue-500 bg-blue-50"
            : error()
            ? "border-red-300 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          class="hidden"
        />

        <div class="flex flex-col items-center justify-center space-y-3">
          <Upload
            class={`w-10 h-10 ${error() ? "text-red-500" : "text-blue-500"}`}
          />
          <div class="space-y-1">
            <p class="text-lg font-medium">
              {error() ? "Invalid File" : "Drop your video here"}
            </p>
            <p class="text-sm text-gray-500">
              {error() ? error() : "or click to browse (video files only)"}
            </p>
          </div>
        </div>
      </div>

      {error() && (
        <div class="mt-2 flex items-center text-sm text-red-500">
          <AlertCircle class="w-4 h-4 mr-1" />
          {error()}
        </div>
      )}
    </div>
  )
}
