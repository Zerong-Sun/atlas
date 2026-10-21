import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { getMotionEnabled, applyMotionPreference } from "./lib/motionPrefs";
applyMotionPreference(getMotionEnabled());
const syncAnimationVisibility=()=>{document.documentElement.dataset.atlasPaused=String(document.hidden);};
syncAnimationVisibility();
document.addEventListener("visibilitychange",syncAnimationVisibility);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
