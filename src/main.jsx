import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Controller from "./pages/Controller";
import Overlay from "./pages/Overlay";
import OverlayFull from "./pages/OverlayFull";
import OverlayPlayer from "./pages/OverlayPlayer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Controller />} />
        <Route path="/controller" element={<Controller />} />
        {/* Overlay antigo horizontal */}
        <Route path="/overlay" element={<Overlay />} />
        {/* Overlay tela cheia — p1 esquerda, p2 direita (recomendado para CameraFi) */}
        <Route path="/overlay/full" element={<OverlayFull />} />
        {/* Overlays verticais individuais */}
        <Route path="/overlay/:player" element={<OverlayPlayer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
