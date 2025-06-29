import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

async function main() {
  const worker = new Worker(new URL("./worker.js", import.meta.url));
  worker.onmessage = (e) => {
    console.log("Message received from worker", e.data);
  };
  
  createRoot(document.getElementById("root")).render(<App worker={worker} />);
}

main().catch(console.error);
