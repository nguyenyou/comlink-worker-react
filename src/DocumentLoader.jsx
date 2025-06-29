import { useState } from "react";

async function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.readAsArrayBuffer(file);
  });
}

export default function DocumentLoader({ workerApi }) {
  const [url, setUrl] = useState("/compressed.tracemonkey-pldi-09.pdf");
  const [file, setFile] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleLoadFile = async () => {
    if (!file) return;
    const fileContent = await readFile(file);
    console.log(fileContent);
  };

  const handleLoadDocument = async () => {
    const fileContent = await fetch(url).then((res) => res.arrayBuffer());
    console.log("fileContent is in main thread 👇");
    console.log(fileContent);
    workerApi.openDoc(fileContent);
  };

  return (
    <div>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Enter a URL"
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="btn" onClick={handleLoadDocument}>Load Document</button>
      </div>
      <div className="flex gap-4">
        <input
          type="file"
          className="file-input"
          onChange={handleFileChange}
        />
        <button className="btn" onClick={handleLoadFile}>Load File</button>
      </div>
    </div>
  );
}
