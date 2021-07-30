const hsdk = require('hs-ssi-sdk');
const { HS_NODE_BASE_URL } = require('./hsConstants')
import env from "dotenv"

env.config({ path: "../../../.env.development"});

const options = { nodeUrl: HS_NODE_BASE_URL};
const hsSSISdk =  new hsdk(options); 
// console.log(hsSSISdk)


export const hypersignSDK = {
    did: hsSSISdk.did,
    credential: hsSSISdk.credential
};

