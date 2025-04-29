import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from './App';
import reportWebVitals from "./reportWebVitals";
import Home from "./app/page";
import { ToastProvider } from "./hooks/use-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ToastProvider>
    {/* your app components here */}
    <React.StrictMode>
      {/* <App /> */}
      <Home />
    </React.StrictMode>
  </ToastProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
