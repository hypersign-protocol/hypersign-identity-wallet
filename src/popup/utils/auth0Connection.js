import auth0 from "auth0-js";
import {auth0Config} from "./hypersign";



const newWebAuth = new auth0.WebAuth({
          domain:  auth0Config.domain ||  "fidato.us.auth0.com",
          clientID: auth0Config.clientID || "hwM9GmM4nUstds9Fw5KsYZVDboJBeLTL",
          responseType: "token id_token",
          scope: "openid profile email",
   
})


export default newWebAuth