import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "tailwindcss/tailwind.css";
import { Provider } from 'react-redux';
import { store } from './store/store';

console.log("hi");

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
