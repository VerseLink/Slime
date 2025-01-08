import { supportedSites } from "@/placeholder";
import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { App } from "./App";

const url = new URL(window.location.href);
if (supportedSites.has(url.hostname)) {

  const app = document.createElement("div");

  document.body.appendChild(app);
  const shadowRoot = app.attachShadow({ mode: "closed" });
  const renderIn = document.createElement("div");
  renderIn.id = "root";
  shadowRoot.appendChild(renderIn);

  const root = createRoot(renderIn);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
}