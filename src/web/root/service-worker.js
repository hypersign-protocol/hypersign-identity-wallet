
const version = "v1";

self.addEventListener('sync', function(event) {
  if (event.tag === 'myFirstSync') {
    event.waitUntil(
      // Perform the background sync here
      // For example, you might want to send a message to a server
      // or upload a 
      fetch('/upload', { method: 'POST', body: {} })
        .then(function() {
          console.log('File upload complete');
        })
        .catch(function() {
          console.log('File upload failed');
        })
    );
  }
});


self.addEventListener('statechange', event => {
  console.log(event.target.state);
  if (event.target.state === 'activated') {
      console.log("Service worker activated")
      // Perform tasks here
  }
});


self.addEventListener('install', event => {
  console.log("installing");
  event.waitUntil(self.skipWaiting())
});


self.addEventListener('activate',event=>{
  console.log('Service Worker: Activated');
})