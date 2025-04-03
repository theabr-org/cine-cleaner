import { dialog, ipcMain } from "electron"
import { exec } from "node:child_process"
import ffmpeg from "@ffmpeg-installer/ffmpeg"

export const exportVideo: Parameters<typeof ipcMain.handle>[1] = async (
  _,
  videoData: {
    inputPath: string
    redactions: string // JSON stringified array of redactions
  },
): Promise<
  | { isSuccess: true; outputPath: string }
  | { isSuccess: false; errorMessage: string }
> => {
  const savePath = await dialog.showSaveDialog({
    title: "Save Redacted Video",
    defaultPath: "redacted-video.mp4",
    filters: [{ name: "Video Files", extensions: ["mp4"] }],
  })

  if (savePath.canceled) {
    return { isSuccess: false, errorMessage: "Save dialog was canceled" }
  }
  const outputPath = savePath.filePath
  if (!outputPath) {
    return { isSuccess: false, errorMessage: "No output path provided" }
  }

  const { inputPath, redactions } = videoData

  const parsedRedactions = JSON.parse(redactions) as {
    x: number
    y: number
    width: number
    height: number
  }[]

  // Generate filter complex command for rectangles
  const videoFilter = parsedRedactions
    .map((rect) => {
      const x = Math.round(rect.x)
      const y = Math.round(rect.y)
      const w = Math.round(Math.abs(rect.width))
      const h = Math.round(Math.abs(rect.height))
      return `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=black:t=fill`
    })
    .join(", ")

  const ffmpegCommand = [
    // There is a known issue with ffmpeg path in Electron when using app.asar
    // This is a workaround to get the correct path in a bundled Electron app
    // https://github.com/kribblo/node-ffmpeg-installer/blob/master/README.md#wrong-path-under-electron-with-asar-enabled
    ffmpeg.path.replace("app.asar", "app.asar.unpacked"),
    "-i", // input file
    inputPath,
    "-vf", // video filter
    `"${videoFilter}"`, // Use double quotes to handle spaces in filter
    "-c:a", // copy audio codec
    "copy",
    "-y", // Overwrite output file if it exists
    outputPath,
  ]

  return new Promise((resolve, reject) => {
    exec(ffmpegCommand.join(" "), (error, _stdout, stderr) => {
      if (error) {
        console.error("Error executing FFmpeg:", error)
        console.error("FFmpeg stderr:", stderr)
        reject(stderr)
      } else {
        resolve({ isSuccess: true, outputPath })
      }
    })
  })
}
