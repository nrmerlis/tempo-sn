import { Board } from './components/Board';
import { UnsupportedViewport } from './components/UnsupportedViewport';
import { NotesProvider } from './context/NotesContext';
import { useViewportSize } from './hooks/useViewportSize';

function App() {
  const isSupported = useViewportSize();

  if (!isSupported) {
    return <UnsupportedViewport />;
  }
  
  return (
    <NotesProvider>
      <Board />
    </NotesProvider>
  );
}

export default App
