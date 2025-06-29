import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as Comlink from "comlink";

async function main() {
  const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
  const workerApi = Comlink.wrap(worker);
  createRoot(document.getElementById("root")).render(<App worker={worker} workerApi={workerApi}/>);
}

main().catch(console.error);
