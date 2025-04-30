import { Component } from 'solid-js';
import VideoEditor from './components/VideoEditor';
import { VideoProvider } from './context/provider';

const App: Component = () => {
  return (
    <VideoProvider>
      <VideoEditor />
    </VideoProvider>
  );
};

export default App;
