import { Outlet } from "react-router-dom";
import SocketProvider from "./providers/SocketProvider";
function App() {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

export default App;
