import auth0 from "auth0-js";

const newWebAuth = new auth0.WebAuth({
          domain: "fidato.us.auth0.com",
          clientID: "hwM9GmM4nUstds9Fw5KsYZVDboJBeLTL",
          responseType: "token id_token",
          scope: "openid profile email",
   
})


export default newWebAuth