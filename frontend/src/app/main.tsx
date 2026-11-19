import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppProviders } from "./providers";
import "@/assets/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Target container #root not found in document.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);

