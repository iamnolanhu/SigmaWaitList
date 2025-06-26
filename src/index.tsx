import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Desktop } from "./screens/Desktop";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Desktop />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);
