import * as Comlink from "comlink";

// onmessage = (e) => {
//   console.log("Message received from main script");
//   const workerResult = `Result: ${e.data[0] * e.data[0]}`;
//   console.log("Posting message back to main script");
//   postMessage(workerResult);
// };

const obj = {
  counter: 0,
  inc() {
    console.log("inc");
    this.counter++;
  },
  pow(a) {
    return a * a;
  },
  sum(a, b) {
    console.log("sum");
    return a + b;
  },
  sumAsync(a, b) {
    console.log("sumAsync");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(a + b);
      }, 1000);
    });
  },
};

Comlink.expose(obj);