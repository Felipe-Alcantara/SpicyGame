import { SpicyGame } from "./components/game/SpicyGame";
import { ToastProvider } from "./components/ui/Toast";

export default function App() {
  return (
    <ToastProvider>
      <SpicyGame />
    </ToastProvider>
  );
}
