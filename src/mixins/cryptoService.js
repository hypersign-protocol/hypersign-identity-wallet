const { encrypt, decrypt } = require('../lib/symmericCrypto');
import { mnemonicToSeed, validateMnemonic } from '@aeternity/bip39';
export default {
    methods: {
        async encryptWallet(mnemonic, hypersign, password) {
            const confirmed = await this.$store
                .dispatch('modals/open', {
                    name: 'confirm',
                    title: 'Backup Confirmation',
                    msg: this.$t('pages.backup-wallet.select-option-2-msg')
                })
                .catch(() => false);

            if (confirmed) {
                this.loading = true;
                const dataToEncrypt = {
                    mnemonic: mnemonic,
                    hypersign: hypersign,
                };


                const walletDataJson = JSON.stringify(dataToEncrypt);
                if (walletDataJson == '') throw new Error('Invalid data');
                const encryptedMessage = await encrypt(walletDataJson, password);
                return encryptedMessage

            }
        },
        async encryptWalletNoPopUP(mnemonic, hypersign, password){
            const dataToEncrypt = {
                mnemonic: mnemonic,
                hypersign: hypersign,
            };


            const walletDataJson = JSON.stringify(dataToEncrypt);
            if (walletDataJson == '') throw new Error('Invalid data');
            const encryptedMessage = await encrypt(walletDataJson, password);
            return encryptedMessage
        },



        async decryptWallet(encryptedMessage, password) {
            return await decrypt(encryptedMessage, password)

        },


        async restore(hypersign, mnemonics) {
            this.$store.commit('restoreHypersign', hypersign);
            await this.importAccount(mnemonics)
        },
        async importAccount(mnemonics) {
            this.loading = true;
            if (!mnemonics) throw new Error('Mnemonic not found in encryted file.')

            mnemonics = mnemonics.trim();
            const mnemonic = mnemonics.split(' ');
            if (mnemonic.length >= 12 && mnemonic.length <= 24 && validateMnemonic(mnemonics)) {
                const seed = mnemonicToSeed(mnemonics).toString('hex');
                const address = await this.$store.dispatch('generateWallet', { seed });
                this.$store.commit('setMnemonic', mnemonics);
                const keypair = {
                    publicKey: address,
                    privateKey: seed,
                };
                await this.$store.dispatch('setLogin', { keypair });
                this.$store.commit('setBackedUpSeed', true);

                const url = localStorage.getItem('qrDataQueryUrl')
                if (url !== null) {

                    this.$router.push('/account?url=' + url);

                } else {
                    this.$router.push(this.$store.state.loginTargetLocation)
                }
            } else {
                throw new Error('Could not import accounts. Invalid Mnemonic');
            }
        },

    },


}