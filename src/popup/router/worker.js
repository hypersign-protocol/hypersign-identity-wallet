self.addEventListener('message',async event => {
    // Perform heavy computation or task here
    
    const {url,body,headers,method}=event.data
    const options={
        method,
        headers,
        body:JSON.stringify(body)
    }
    const resp=await fetch(url,options)
    const data=await resp.json()
    // Send result back to the main thread

    self.postMessage(data);
    
  });


  