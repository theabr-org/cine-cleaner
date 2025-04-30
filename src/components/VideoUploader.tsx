import { Upload, AlertCircle } from 'lucide-solid';
import { Actions } from '@/utils/store'; // Import your store
import { useVideoData } from '@/context/useVideoData'; // Import your context
import { createSignal, Show } from 'solid-js';
import { Button } from './ui/button';

export const VideoUploader = () => {
  const [isDragging, setIsDragging] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string>('');
  let fileInputRef!: HTMLInputElement;

  const [, dispatch] = useVideoData();

  const handleDragEnter = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): boolean => {
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file only.');
      return false;
    }

    // Clear any previous errors
    setError('');
    return true;
  };

  const processVideoFile = (file: File): void => {
    dispatch({
      type: Actions.SetVideoSrc,
      payload: URL.createObjectURL(file),
    });
  };

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files ?? [];
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        processVideoFile(file);
      }
    }
  };

  const handleFileChange = (
    e: Event & {
      target: HTMLInputElement;
    }
  ): void => {
    const files = e.target?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        processVideoFile(file);
      }
    }
  };

  const openFileDialog = (): void => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  return (
    <div class="w-full max-w-lg mx-auto flex flex-col gap-4">
      <LocalVideoEditingMessage />
      <div
        class={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging()
            ? 'border-blue-500 bg-blue-50'
            : error()
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
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
            class={`w-10 h-10 ${error() ? 'text-red-500' : 'text-blue-500'}`}
          />
          <div class="space-y-1">
            <p class="text-lg font-medium">
              {error() ? 'Invalid File' : 'Drop your video here'}
            </p>
            <p class="text-sm text-gray-500">
              {error() ? error() : 'or click to browse (video files only)'}
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
  );
};

const LocalVideoEditingMessage = () => {
  const [infoModalOpen, setInfoModalOpen] = createSignal(false);

  const handleInfoClick = () => {
    setInfoModalOpen(true);
  };
  const handleClose = () => {
    setInfoModalOpen(false);
  };
  return (
    <div class="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400 text-yellow-700">
      <div class="flex items-center">
        <AlertCircle class="w-5 h-5 mr-2" />
        <p class="text-sm font-medium">Local Video Editing</p>
      </div>
      <p>
        This is a local video editing tool. Your video will not be uploaded to
        any server, and all processing is done in your browser.
      </p>
      <div class="flex items-center justify-end">
        <Button
          variant="link"
          onClick={handleInfoClick}
          class="text-yellow-700 hover:text-yellow-900 p-0"
        >
          more info
        </Button>
      </div>
      <Show when={infoModalOpen()}>
        <InfoModal onClose={handleClose} />
      </Show>
    </div>
  );
};

const InfoModal = (props: { onClose: () => void }) => {
  return (
    <div class="fixed inset-0 flex items-center justify-center bg-gray-800/40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <h2 class="text-lg font-semibold">Local Video Editing</h2>
        <p>
          This tool allows you to edit videos directly in your browser without
          uploading them to any server. When you upload a video, it is only a
          reference to the local file on your device. The video is processed
          entirely in your browser, ensuring your privacy and security.
        </p>
        <p class="mt-2">
          Please note that the processing may take some time depending on the
          size of the video and the number of redactions. Make sure to have
          enough resources available on your device for smooth processing.
        </p>
        <p class="mt-2">
          If you are interested in the underlying technology, the source code
          can be found on GitHub at{' '}
          <a
            href="https://github.com/theabr-org/cine-cleaner"
            target="_blank"
            class="text-blue-500 underline"
            rel="noopener noreferrer"
          >
            Cine Cleaner GitHub
          </a>
          .
        </p>
        <div class="mt-4 flex items-center">
          <Button onClick={props.onClose} class="mx-auto">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
