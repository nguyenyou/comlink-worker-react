export default function ComlinkSample({ workerApi }) {
  return (
    <div>
      <button
        className="btn"
        onClick={async () => {
          const xxx = await workerApi.sum(1, 2);
          const yyy = await workerApi.sumAsync(2, 4);
          console.log(xxx);
          console.log(yyy);
        }}
      >
        Comlink Remote Call
      </button>
    </div>
  );
}
