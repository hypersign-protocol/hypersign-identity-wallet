const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing");
const { HIDNODE_REST, HIDNODE_FAUCET } = require('./hsConstants');
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

    async getWalletAddress() {
        const accounts = await this.offlineSigner.getAccounts()
        this.walletAddress = accounts[0].address
        return this.walletAddress
    }

    async rechargeWallet() {
        const walletAddress = await this.getWalletAddress();
        const url = HIDNODE_FAUCET
        const data = {
            address: walletAddress,
            coins: [
                '100000uhid'
            ]
        }
        await axios.post(url, data)
        const balance = await this.getBalance();
        return balance;
    }

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
}

const hidWalletInstance = new HIDWallet();

// Object.freeze(hidWalletInstance);

export default hidWalletInstance;