// if ('serviceWorker' in    navigator){
//     navigator.serviceWorker.register('http://localhost:4999/web/root/service-worker.js')
//       .then(function(registration) {

       
//         console.log('Service worker registration successful');
//       })
//       .catch(function(error) {
//         console.log('Service worker registration failed:', error);
//       });


   
    


//   }
 


export default function initiateWorker(){
  const worker=new Worker('http://localhost:4999/web/root/worker.js')
  return worker;
}