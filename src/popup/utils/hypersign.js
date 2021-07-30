const hsdk = require('hs-ssi-sdk');
const { HS_NODE_BASE_URL } = require('./hsConstants')
import env from "dotenv"

env.config({ path: "../../../.env.development"});

const options = { nodeUrl: HS_NODE_BASE_URL};
const hsSSISdk =  new hsdk(options); 
// console.log(hsSSISdk)

console.log("ENV PRICESS", process.env);

export const hypersignSDK = {
    did: hsSSISdk.did,
    credential: hsSSISdk.credential
};


export const auth0Config = {
    domain: process.env.VUE_APP_AUTH0_DOMAIN,
    clientID: process.env.VUE_APP_AUTH0_CLIENT_ID
}


