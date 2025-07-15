export const MAX_DIMENSION = 2500;
export const MIN_DIMENSION = 512;

export const getScaledDimensions = (
  width: number,
  height: number
): { targetWidth: number; targetHeight: number } => {
  const originalAspectRatio = width / height;
  let targetWidth = width;
  let targetHeight = height;

  // Scale down if too large
  if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
    if (targetWidth > targetHeight) {
      targetWidth = MAX_DIMENSION;
      targetHeight = Math.round(MAX_DIMENSION / originalAspectRatio);
    } else {
      targetHeight = MAX_DIMENSION;
      targetWidth = Math.round(MAX_DIMENSION * originalAspectRatio);
    }
    return { targetWidth, targetHeight };
  }
  // Scale up if too small
  if (targetWidth < MIN_DIMENSION && targetHeight < MIN_DIMENSION) {
    if (targetWidth < targetHeight) {
      targetWidth = MIN_DIMENSION;
      targetHeight = Math.round(MIN_DIMENSION / originalAspectRatio);
    } else {
      targetHeight = MIN_DIMENSION;
      targetWidth = Math.round(MIN_DIMENSION * originalAspectRatio);
    }
  }
  return { targetWidth, targetHeight };
};
