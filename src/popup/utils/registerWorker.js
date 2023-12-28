export default function initiateWorker() {  // worker.js file should be inside the src/web/root
  //  const worker=new Worker('http://localhost:4999/web/root/worker.js') // dev local
  const worker = new Worker((window.location.origin.includes("localhost:4999") || window.location.origin.includes("127.0.0.1")) ? 'http://localhost:4999/web/root/worker.js' : window.location.origin + '/worker.js') // deploy
  return worker;
}