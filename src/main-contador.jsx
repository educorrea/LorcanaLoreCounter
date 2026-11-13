import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Contador from "./pages/Contador";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/contador">
      <Contador />
    </BrowserRouter>
  </React.StrictMode>
);
