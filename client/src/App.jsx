

import { useRoutes } from "react-router";
import BrowseSessions from "./pages/BrowseSessions.jsx";
import Home from "./pages/Home.jsx";
import Navbar from "./components/Navbar.jsx";
import SessionDetails from "./pages/SessionDetails.jsx";
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
    {
      path: "/sessions/:id",
      element: <SessionDetails />,
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
