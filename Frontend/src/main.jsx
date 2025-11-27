import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import ThemeProvider from "./utils/ThemeContext";
import { StoreProvider } from "./contexts/storeContext"; // ← import it
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <StoreProvider>
          {" "}
          {/* ✅ App now has access to useStores */}
          <App />
        </StoreProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
