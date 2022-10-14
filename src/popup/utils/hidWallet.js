const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { HIDNODE_REST, HIDNODE_RPC, SUPERHERO_HS_AUTH_BASE_URL, AUTH_SERVER_FAUCET_PATH } = require('./hsConstants');
const { SigningStargateClient } = require('@cosmjs/stargate');
const axios = require("axios");
class HIDWallet {
    constructor() {
        this.prefix = 'hid';
        this.offlineSigner = null;
    }

    async generateWallet(mnemonic) {
        if (!mnemonic) {
            this.offlineSigner = await DirectSecp256k1HdWallet.generate(24, {
                prefix: this.prefix,
            });
        } else {
            this.offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
                prefix: this.prefix,
            });
        }
    }

    /**
     * Get first wallet address of signer
     * @returns walletAddrss {string}
     */
    async getWalletAddress() {
        const accounts = await this.offlineSigner.getAccounts()
        this.walletAddress = accounts[0].address
        return this.walletAddress
    }


    /**
     * Get 50uhid from faucet
     **/
    //// Post Request New Code
    async rechargeWallet() {
        const walletAddress = await this.getWalletAddress();
        const url = SUPERHERO_HS_AUTH_BASE_URL + AUTH_SERVER_FAUCET_PATH + walletAddress;
        const res = await axios.get(url)
            // const { data } = res;
        if (!res || res.message) {
            throw new Error('Could not fund the wallets')
        }
        return res.message

        // const url = HIDNODE_FAUCET
        // const data = {
        //     address: walletAddress,
        //     coins: [
        //         '10000uhid'
        //     ]
        // }
        // const balance = await this.getBalance();
        // return balance;
    }


    /**
     * Get wallet HID balance of the current account
     * @returns walletBalance {string}
     */
    async getBalance() {
        const walletAddress = await this.getWalletAddress();
        const url = HIDNODE_REST + "/cosmos/bank/v1beta1/balances/" + walletAddress;
        const res = await axios.get(url);

        if (!res || !res.data || !res.data.balances || res.data.balances.length == 0) {
            console.error('Could not fetch the balance for wallet ' + walletAddress)
            return 0;
        }

        const bal = res.data.balances.find(x => x.denom === 'uhid')
        if (!bal) {
            console.error('Invalid balance')
            return 0;
        }
        return bal.amount
    }

    async sendTokens({ recipient, amount }) {
        if (!this.offlineSigner) {
            throw new Error('Signer is not initialized');
        }
        const walletAddress = await this.getWalletAddress();
        const client = await SigningStargateClient.connectWithSigner(HIDNODE_RPC, this.offlineSigner, {
            gasPrice: "0.0001uhid"
        });


        //client.simulate(walletAddress, )
        let message = {
                message: "",
                transactionHash: "",
                gasUsed: 0,
                gasWanted: 0,
                height: 0,
                error: ""
            }
            /// TODO: need to make the fee dynamic
        const result = await client.sendTokens(walletAddress, recipient, amount, 'auto', '');
        if (result && result.code == 0) {
            message.transactionHash = result.transactionHash
            message.gasUsed = result.gasUsed
            message.gasWanted = result.gasWanted
            message.height = result.height
            message.message = "Transaction successfull"
        } else {
            message.message = "Transaction failed"
            message.error = result.rawLog ? result.rawLog : "Transaction failed"
        }
        return message;
    }
}

const hidWalletInstance = new HIDWallet();
export default hidWalletInstance;