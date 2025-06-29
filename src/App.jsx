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
    <div>
      <input
        type="text"
        name=""
        id=""
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={() => worker.postMessage([Number(input)])}>
        Send message to worker
      </button>
      <p>{result}</p>
    </div>
  );
}
