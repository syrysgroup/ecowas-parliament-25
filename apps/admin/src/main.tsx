import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App.tsx";
import "./index.css";

// Phase 0 — opt the admin shell into the ops-dark token set.
// (Light theme stays available for users who flip the toggle.)
document.documentElement.dataset.adminTheme = "ops-dark";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
