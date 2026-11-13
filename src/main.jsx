import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Contador from "./pages/Contador";
import Config from "./pages/Config";
import Overlay from "./pages/Overlay";
import OverlayFull from "./pages/OverlayFull";
import OverlayPlayer from "./pages/OverlayPlayer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* App do jogador — lore + vitória */}
        <Route path="/" element={<Contador />} />
        <Route path="/contador" element={<Contador />} />
        <Route path="/controller" element={<Navigate to="/" replace />} />

        {/* App do operador — nomes, timer, BO, reset */}
        <Route path="/config" element={<Config />} />

        {/* Overlays */}
        <Route path="/overlay" element={<Overlay />} />
        <Route path="/overlay/full" element={<OverlayFull />} />
        <Route path="/overlay/:player" element={<OverlayPlayer />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
