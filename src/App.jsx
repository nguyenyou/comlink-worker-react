import { useState } from "react";

export default function App({ worker }) {
  const [input, setInput] = useState("");

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
    </div>
  );
}
