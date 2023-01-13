self.addEventListener('message',async event => {
    // Perform heavy computation or task here
    
    const {url,body,headers,method}=event.data
    const options={
        method,
        headers,
        body:JSON.stringify(body)
    }
     fetch(url,options).then(resp=> resp.json())
     .then(data=>{
        self.postMessage(data);

     })
    // Send result back to the main thread

    
  });


  