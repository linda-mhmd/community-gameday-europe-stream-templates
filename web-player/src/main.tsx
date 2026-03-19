import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Tell Remotion's staticFile() to resolve assets relative to the Vite base URL.
// Without this, staticFile("assets/foo.png") returns "/assets/foo.png" (absolute),
// which breaks when deployed to a GitHub Pages subdirectory.
(window as Window & { remotion_staticBase?: string }).remotion_staticBase =
  import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
