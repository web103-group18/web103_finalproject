import { useRoutes } from "react-router"
import BrowseSessions from "./components/BrowseSessions.jsx";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

function App() {
  let element = useRoutes([
    {
      path: "/browse",
      element: <BrowseSessions />,
    }
  ]);

  return (
    <>
      <Navbar />
      {element}
    </>
  );
}

export default App;
