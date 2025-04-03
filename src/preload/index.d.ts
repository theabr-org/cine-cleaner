import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      exportVideo: (videoData: {
        inputPath: string;
        redactions: string; // JSON stringified array of redactions
      }) => Promise<
        | { isSuccess: true; outputPath: string }
        | { isSuccess: false; errorMessage: string }
      >;
      selectVideo: () => Promise<string | null>;
      // Other APIs...
    };
  }
}
