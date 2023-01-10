
const version = "v1";
let userSW={

}
let dataSW={

}
let authTokeSW=undefined
self.addEventListener('sync', function (event) {
  if (event.tag === 'sync') {
    


    
    event.waitUntil(
      // Perform the background sync here
      // For example, you might want to send a message to a server
      // or upload a 

      fetch('https://stage.hypermine.in/authserver/hs/api/v2/sync', {
        method: 'POST', body: JSON.stringify({
          user: userSW,
          document:dataSW,
      }),headers:{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authTokeSW
      }
      })
        .then(function () {
          console.log('File upload complete');
        })
        .catch(function () {
          console.log('File upload failed');
        })
    );
  }
  if (event.tag === 'resync') {

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



self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
})



self.addEventListener('message', event => {
  const {user,data,authToken}= event.data
  userSW=user
  dataSW=data
  authTokeSW=authToken
  
});