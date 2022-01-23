export const HS_NODE_BASE_URL = process.env.VUE_APP_HS_NODE_BASE_URL || "https://stage.hypermine.in/core/"; 
export const SUPERHERO_HS_AUTH_BASE_URL = process.env.VUE_APP_HS_AUTH_BASE_URL || "https://stage.hypermine.in/hsauth/";
export const SUPERHERO_HS_AUTH_CREDENTIAL_ISSUE_API = "hs/api/v2/register"; // change supero to hypersign later
export const HS_AUTH_DID_URL = SUPERHERO_HS_AUTH_BASE_URL + "hs/api/v2/authdid"
export const WALLET_TYPE = process.env.VUE_APP_HS_WALLET_TYPE || "web"
export const HYPERSIGN_AUTH_PROVIDER = {
    GOOGLE : 'google',
    TWITTER : 'twitter',
    FACEBOOK : 'facebook'
}
                                          