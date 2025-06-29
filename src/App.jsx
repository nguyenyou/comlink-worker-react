import * as React from "react";
import DocumentLoader from "./DocumentLoader";
import ComlinkSample from "./ComlinkSample";

export default function App({ worker, workerApi }) {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState("");

  return (
    <div className="p-10">
      <ComlinkSample workerApi={workerApi} />
      <DocumentLoader />
      {/* <div className="flex gap-4">
        <input
          className="input"
          type="text"
          name=""
          id=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => worker.postMessage([Number(input)])}
        >
          Send message to worker
        </button>
      </div> */}
      <div className="flex gap-4">
        <input
          className="input"
          type="text"
          name=""
          id=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="btn"
          onClick={() => {
            const xxx = workerApi.pow(Number(input));
            setResult(xxx);
          }}
        >
          Comlink Remote Call
        </button>
      </div>
      <div>
        <p>{result}</p>
      </div>
    </div>
  );
}
