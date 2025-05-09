import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Redaction } from './store';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type Result =
  | {
      success: true;
      videoUrl: string;
    }
  | {
      success: false;
      message: string;
      error: Error;
    };

export const processVideoWithFFMPEG = async (
  videoSrc: string,
  redactions: Redaction[],
  redactionColor: string,
  onProgress: (progress: number) => void
): Promise<Result> => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    console.debug(message);
  });
  ffmpeg.on('progress', ({ progress }) => {
    onProgress(progress);
  });
  // toBlobURL is used to bypass CORS issue, urls with the same
  // domain can be used directly.

  try {
    await ffmpeg
      .load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        ),
      })
      .catch(error => {
        console.error('Error loading ffmpeg core:', error);
        throw error;
      });
  } catch (error) {
    return {
      success: false,
      message: 'Error loading ffmpeg core',
      error: error as Error,
    };
  }
  // Generate filter complex command for rectangles
  const videoFilter = redactions
    .map(rect => {
      const x = Math.round(rect.x);
      const y = Math.round(rect.y);
      const w = Math.round(Math.abs(rect.width));
      const h = Math.round(Math.abs(rect.height));
      return `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${redactionColor}:t=fill`;
    })
    .join(', ');

  const inputPath = 'input.mp4';
  try {
    await ffmpeg.writeFile(inputPath, await fetchFile(videoSrc));
  } catch (error) {
    return {
      success: false,
      message: 'Error writing input file',
      error: error as Error,
    };
  }

  const outputPath = 'output.mp4';
  try {
    await ffmpeg.exec([
      '-i', // input file
      inputPath,
      '-vf', // video filter
      videoFilter,
      '-c:a', // copy audio codec
      'copy',
      '-y', // Overwrite output file if it exists
      outputPath,
    ]);
  } catch (error) {
    return {
      success: false,
      message: 'Error processing video',
      error: error as Error,
    };
  }

  // Read the output file
  try {
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data], { type: 'video/mp4' });
    const url = URL.createObjectURL(blob);
    return {
      success: true,
      videoUrl: url,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error reading output file',
      error: error as Error,
    };
  }
};
