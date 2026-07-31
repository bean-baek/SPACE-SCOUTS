import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// index.html always provides #root; the app cannot mount without it.
createRoot(/** @type {HTMLElement} */ (document.getElementById("root"))).render(
  <StrictMode>
    <App />
  </StrictMode>
);
