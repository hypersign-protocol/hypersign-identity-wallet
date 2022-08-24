export const SUPERHERO_HS_AUTH_BASE_URL = process.env.VUE_APP_HS_AUTH_BASE_URL || "https://devnet.hypersign.id/hsauth/";
export const SUPERHERO_HS_AUTH_CREDENTIAL_ISSUE_API = "hs/api/v2/register"; // change supero to hypersign later
export const HS_AUTH_DID_URL = SUPERHERO_HS_AUTH_BASE_URL + "hs/api/v2/authdid"

export const AUTH_SERVER_FAUCET_PATH = "hs/api/v2/faucet/"
export const WALLET_TYPE = process.env.VUE_APP_HS_WALLET_TYPE || "web"
export const HYPERSIGN_AUTH_PROVIDER = {
    GOOGLE: 'google',
    TWITTER: 'twitter',
    FACEBOOK: 'facebook'
}

export const HIDNODE_RPC = "https://jagrat.hypersign.id/node1/rpc/"
export const HIDNODE_REST = "https://jagrat.hypersign.id/node1/rest/"
export const HIDNODE_FAUCET = "https://jagrat.hypersign.id/node1/faucet/"

