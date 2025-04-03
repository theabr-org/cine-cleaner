import { dialog } from 'electron';

export const selectVideo = async (): Promise<string | null> => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'mov', 'avi'] }],
  });

  if (filePaths.length === 0) return null; // No file selected
  return filePaths[0]; // Return the full path
};
