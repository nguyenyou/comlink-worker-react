import * as React from "react";

export default function App({ worker }) {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState("");

  React.useEffect(() => {
    worker.onmessage = (e) => {
      console.log("Message received from worker", e.data);
      setResult(e.data);
    };
  }, [worker]);

  return (
    <div className="p-10">
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
          onClick={() => worker.postMessage([Number(input)])}
        >
          Send message to worker
        </button>
      </div>
      <div>
        <p>{result}</p>
      </div>
    </div>
  );
}
