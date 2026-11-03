
import { useRoutes } from "react-router";
import BrowseSessions from "./pages/BrowseSessions.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

function App() {
  let element = useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/browse",
      element: <BrowseSessions />,
    },
  ]);

  return (
    <>
      <Navbar />
      {element}
    </>
  );
}

export default App;
