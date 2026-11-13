import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Overlay from "./pages/Overlay";
import OverlayFull from "./pages/OverlayFull";
import OverlayPlayer from "./pages/OverlayPlayer";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Apps PWA ficam em /contador e /config (escopos separados) */}
        <Route path="/" element={<Navigate to="/contador/" replace />} />
        <Route path="/controller" element={<Navigate to="/contador/" replace />} />

        <Route path="/overlay" element={<Overlay />} />
        <Route path="/overlay/full" element={<OverlayFull />} />
        <Route path="/overlay/:player" element={<OverlayPlayer />} />

        {/* Fallback: manda pro Contador */}
        <Route path="*" element={<Navigate to="/contador/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
