import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[TRACE-P1] main.tsx: module evaluated");

const root = document.getElementById("root");

console.log("[TRACE-P1] main.tsx: root =", root);

console.log("[TRACE-P1] main.tsx: before render");

createRoot(root!).render(<App />);

console.log("[TRACE-P1] main.tsx: render() invoked");