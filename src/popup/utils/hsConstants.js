// export const SUPERHERO_HS_AUTH_BASE_URL =
//   process.env.VUE_APP_HS_AUTH_BASE_URL || 'https://stage.hypermine.in/authserver/';
export const SUPERHERO_HS_AUTH_BASE_URL =
  process.env.VUE_APP_HS_AUTH_BASE_URL || 'http://localhost:8001/';
// export const SUPERHERO_HS_AUTH_BASE_URL = process.env.VUE_APP_HS_AUTH_BASE_URL || "https://api.fyre.hypersign.id/auth/";
export const HS_VC_STATUS_CHECK_ATTEMPT = process.env.VUE_APP_HS_VC_STATUS_CHECK_ATTEMPT || 15;
export const HS_VC_STATUS_CHECK_INTERVAL = process.env.VUE_APP_HS_VC_STATUS_CHECK_INTERVAL || 7000;
export const SUPERHERO_HS_AUTH_CREDENTIAL_ISSUE_API = 'hs/api/v2/register'; // change supero to hypersign later
export const HS_AUTH_DID_URL = `${SUPERHERO_HS_AUTH_BASE_URL}hs/api/v2/authdid`;
export const HS_VC_STATUS_PATH = `${SUPERHERO_HS_AUTH_BASE_URL}hs/api/v2/vcstatus`;
// export const WALLET_URL = process.env.VUE_APP_WALLET_URL || "https://wallet-jagrat.hypersign.id/";
export const WALLET_URL =
  process.env.VUE_APP_WALLET_URL || 'http://localhost:4999/chrome/popup/popup#/';
// export const BUSINESSCARD_SCHEMA='sch:hid:testnet:zFc19V37DPHmdysvPDJJdeHQTLPWzuSVZq4Tn9GPXcEj2:1.0'
export const BUSINESSCARD_SCHEMA =
  'sch:hid:testnet:zDt4ZZwoA5vBV3t7tn8Y4KNKjH4fBDkwYxLfQK1nJC8BR:1.0';
export const AUTH_SERVER_FAUCET_PATH = 'hs/api/v2/faucet/';
export const WALLET_TYPE = process.env.VUE_APP_HS_WALLET_TYPE || 'web';
export const HYPERSIGN_AUTH_PROVIDER = {
  GOOGLE: 'google',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
};
export const HIDNODE_RPC = 'https://rpc.prajna.hypersign.id';
export const HIDNODE_REST = 'https://api.prajna.hypersign.id';

// export const HIDNODE_RPC = 'http://127.0.0.1:26657/'
// export const HIDNODE_REST = "http://127.0.0.1:1317/"
export const HIDNODE_NAMESPACE = 'testnet';
