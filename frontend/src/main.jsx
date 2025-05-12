import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@/index.css";

// Font Awesome configuration
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { faUser, faLock, faEye, faEyeSlash, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Prevent auto-adding CSS to avoid CORS issues
config.autoAddCss = false;

// Add icons to the library
library.add(faUser, faLock, faEye, faEyeSlash, faExclamationCircle);

import { createRoot } from "react-dom/client";
import App from "@/App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Ensure there is an element with id 'root' in your HTML.");
}

const root = createRoot(rootElement);

root.render(<App />);
