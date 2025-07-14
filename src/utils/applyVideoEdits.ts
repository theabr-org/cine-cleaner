import {
  Input,
  Output,
  ALL_FORMATS,
  BlobSource,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
  QUALITY_HIGH,
  VideoSampleSink,
} from 'mediabunny';
import { Redaction } from './store';
import { getScaledDimensions } from './getScaledDimensions';

type ConvertVideoOptions = {
  /** URL of the video to process */
  objectUrl: string;
  /** Array of redaction boxes to apply */
  redactions: Array<Redaction>;
  /** Color of the redaction boxes*/
  redactionColor: string;
  /** Start time of the video clip in seconds */
  startTime: number;
  /** End time of the video clip in seconds */
  endTime: number;
  /** Dimensions of the video container */
  /** Used to calculate the aspect ratio and apply redactions correctly */
  container: {
    width: number;
    height: number;
  };
  /** Callback to report progress */
  /** Progress is reported as a percentage from 0 to 100 */
  onProgress: (progress: number) => void;
};

/** Applies a series of edits to video
 * @param options ConvertVideoOptions
 * @returns result object with an objectUrl string on success and message on fail
 */
export const applyVideoEdits = async (
  options: ConvertVideoOptions
): Promise<
  | { success: true; objectUrl: string }
  | { success: false; message: string; error: Error }
> => {
  const {
    container,
    objectUrl,
    startTime,
    endTime,
    redactionColor,
    redactions,
    onProgress,
  } = options;

  try {
    const videoBlob = await fetch(objectUrl).then(res => res.blob());
    onProgress(5);
    const input = new Input({
      source: new BlobSource(videoBlob),
      formats: ALL_FORMATS,
    });
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) {
      throw new Error('No video track found in input');
    }

    // Calculate scaling to fit within constraints (512-2500px)
    const { displayWidth, displayHeight } = videoTrack;

    const { targetWidth, targetHeight } = getScaledDimensions(
      displayWidth,
      displayHeight
    );
    onProgress(10);

    // Create canvas for video processing with redactions
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d')!;

    // Calculate redaction positions scaled to target video dimensions
    const scaleX = targetWidth / container.width;
    const scaleY = targetHeight / container.height;

    const scaledRedactions = redactions.map(redaction => ({
      ...redaction,
      x: redaction.x * scaleX,
      y: redaction.y * scaleY,
      width: redaction.width * scaleX,
      height: redaction.height * scaleY,
    }));

    // Create video source from canvas
    const videoSource = new CanvasSource(canvas, {
      codec: 'avc',
      bitrate: QUALITY_HIGH,
    });

    output.addVideoTrack(videoSource);
    // Audio track is intentionally omitted - we want video only output

    await output.start();
    onProgress(15);

    // get some values for progress reporting
    let frameCount = 0;
    const stats = await videoTrack.computePacketStats(100);
    const frameRate = stats.averagePacketRate;
    const duration = endTime - startTime;
    const approximateTotalFrames = Math.ceil(duration * frameRate);

    try {
      // Process video frames
      const videoSink = new VideoSampleSink(videoTrack);
      let zeroOffset: number | null = null; // Used to normalize timestamps to the start time of the clip
      for await (const sample of videoSink.samples(startTime, endTime)) {
        if (zeroOffset === null) {
          zeroOffset = sample.timestamp;
        }
        // Clear canvas for the next frame
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Draws the current video frame onto the canvas
        sample.draw(ctx, 0, 0, targetWidth, targetHeight);

        // Apply redactions
        scaledRedactions.forEach(redaction => {
          ctx.fillStyle = redactionColor;
          ctx.fillRect(
            redaction.x,
            redaction.y,
            redaction.width,
            redaction.height
          );
        });

        // Add frame to output
        await videoSource.add(sample.timestamp - zeroOffset, sample.duration);

        // Clean up
        sample.close();

        // Update progress
        frameCount++;
        const frameProgress = 15 + (frameCount / approximateTotalFrames) * 75;
        onProgress(Math.round(frameProgress));
      }
    } catch (error) {
      console.error('Error processing video frames:', error);
      throw error;
    }

    await output.finalize();
    onProgress(95);

    const buffer = output.target.buffer;
    if (!buffer) {
      throw new Error('Output buffer is empty');
    }
    const outputBlob = new Blob([buffer], { type: 'video/mp4' });
    const outputUrl = URL.createObjectURL(outputBlob);

    onProgress(100);
    return { success: true, objectUrl: outputUrl };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to process video: ${error.message}`,
        error,
      };
    } else {
      console.error('Unknown error occurred:', error);
      return {
        success: false,
        message: 'Failed to process video: Unknown error',
        error: new Error('Unknown error'),
      };
    }
  }
};
