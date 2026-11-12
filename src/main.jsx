import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Controller from "./pages/Controller";
import Overlay from "./pages/Overlay";
import OverlayPlayer from "./pages/OverlayPlayer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Controller />} />
        <Route path="/controller" element={<Controller />} />
        {/* Overlay horizontal com os dois jogadores (original) */}
        <Route path="/overlay" element={<Overlay />} />
        {/* Overlays verticais individuais para OBS/CameraFi */}
        <Route path="/overlay/:player" element={<OverlayPlayer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
