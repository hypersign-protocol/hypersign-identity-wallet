<template>
    <div class="popup">
        <div class="mt-10 custom-select">
            <vSelect :options="options" style="border:none" @input="onSelect($event)" placeholder="Select Schema"
                :value="selected.label" />
        </div>
        <div class="mt-10">
            <div v-for="prop in schemaProps">
                <br>
                <Input v-if="prop.value.type == 'string'" type="text"  :label="prop.key.toLocaleUpperCase()" :placeholder="prop.value.placeholder"
                    name="prop.key" v-model="prop.value.data" class="ae-address" />
                <Input v-if="prop.value.type == 'date'" type="date"  :label="prop.key" name="prop.key"
                    :placeholder="prop.value.placeholder" v-model="prop.value.data" class="ae-address" />
                <Input v-if="prop.value.type == 'number'" type="number" :label="prop.key" name="prop.key"
                    :placeholder="prop.value.placeholder" v-model="prop.value.data" class="ae-address" />

            </div>
            <div v-if="showBtn" class="mt-10">
                <Button half @click="issueCredential()">
                    Issue
                </Button>
            </div>

        </div>
        <Loader v-if="loading" />

    </div>
</template>
  
<script>
import "vue-select/dist/vue-select.css";

import Input from '../components/Input';
import vSelect from "vue-select";

import registration from '../../../mixins/registration';
import hidWalletInstance from '../../utils/hidWallet';
import { mapState } from 'vuex';
import { HIDNODE_REST, HYPERSIGN_AUTH_PROVIDER, BUSINESSCARD_SCHEMA, HIDNODE_RPC, HIDNODE_NAMESPACE } from '../../utils/hsConstants';
import Axios from "axios";
const HypersignSsiSDK = require('hs-ssi-sdk');

export default {
    mixins: [],
    components: { Input, vSelect },
    computed: {
        ...mapState(['mnemonic', 'hypersign']),

    },
    data: () => ({
        loading: false,
        walletAddress: "",
        walletBalance: "",
        showBtn: false,
        schemaId: '',
        schema: {},
        schemaProps: [],
        options: [
            {
                value: BUSINESSCARD_SCHEMA, label: "Business Card"
            },

            {
                value: null, label: "Coming Soon",
            }
        ],
        selected: {
            value: null, label: "Select Schema"
        }
    }),
    async created() {

    },
    methods: {

        async credentialsQRData(cred) {
            try {
                if (!cred) {
                    throw new Error('Credential can not be null or empty');
                }
                // TODO: Check if this credential already exsits in wallet: otherwise reject
                const credInWallet = this.hypersign.credentials.find((x) => x.id == cred.id);
                if (credInWallet) {
                    throw new Error('The credential already exist in your wallet');
                }


                // console.log({
                //   hs_app_did: this.hypersign.did,
                //   credentialSubjectDid: cred.credentialSubject.id
                // })

                // TODO: Check if you are the owner of this credenital: otherwise reject
                if (this.hypersign.did != cred.credentialSubject.id) {
                    throw new Error('The credential is not issued to you');
                }

                this.$store.dispatch('addHSVerifiableCredentialTemp', cred);
                this.$router.push(`/credential/temp/${cred.id}`);
                // localStorage.removeItem("3rdPartyAuthVC");
            } catch (e) {
                // console.log(e);
                this.loading = false;
                if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
            }
        },


        async issueCredential() {
            try {

                if (this.isPrivateDid()) {
                    const selection = await this.$store
                        .dispatch('modals/open', {
                            name: 'confirm',
                            title: this.$t('modals.changeDid.title'),
                            msg: this.$t('modals.changeDid.msg'),

                        }).catch(() => false);
                    if (selection) {
                        this.$emit('closeMenu');
                        this.$router.push(`/did`);
                        return
                    } else {
                        throw new Error('Sorry, Selected DID is private. Please select a public DID to issue Schema')
                    }
                }

                this.loading = true
                const fields = {}
                this.schemaProps.forEach(prop => {
                    if (prop.value.data !== undefined) {
                        fields[prop.key] = prop.value.data

                    }
                });

                await hidWalletInstance.generateWallet(this.mnemonic);
                const hsSdk = new HypersignSsiSDK(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
                await hsSdk.init();

                const expirationDate = new Date('12/11/2027');

                const vc = await hsSdk.vc.getCredential({
                    schemaId: this.schemaId,
                    subjectDid: this.hypersign.did,
                    issuerDid: this.hypersign.did,
                    expirationDate,
                    fields
                })
                const signedVc = await hsSdk.vc.issueCredential({
                    credential: vc,
                    issuerDid: this.hypersign.didDoc.id,
                    privateKey: this.hypersign.keys.privateKeyMultibase,
                    verificationMethodId: this.hypersign.didDoc.id + '#key-1'
                })

                //    console.log(signedVc);
                this.loading = false

                await this.credentialsQRData(signedVc);

            } catch (error) {
                this.loading = false
                throw new Error(error)
            }

        }
        ,
        isPrivateDid() {
            const didList = this.hypersign.dids
            let status
            Object.values(didList).forEach((did) => {
                if (did.didDoc.id === this.hypersign.did) {
                    status = did.status

                }
            })
            return status === 'private' ? true : false;
        }

        ,
        async onSelect(event) {
            try {
                this.selected = event;
                this.loading = true;
                if (this.selected.value != null && this.selected.value.includes('sch:hid:testnet')) {
                    const url = HIDNODE_REST + "hypersign-protocol/hidnode/ssi/schema/" + event.value;
                    const resp = await Axios.get(url)
                    this.schemaId = resp.data.schema[0].id
                    this.schema = resp.data.schema[0].schema
                    this.schemaProps = Object.entries(JSON.parse(this.schema.properties)).map(([key, value]) => {

                        switch (key) {
                            case 'photo':
                                value.placeholder = 'https://www.example.com/photo.png'
                                break;
                            case 'workUrl':
                                value.placeholder = 'https://www.example.com'
                                break;
                            case 'facebook':
                                value.placeholder = 'https://www.facebook.com/username'
                                break;
                            case 'twitter':
                                value.placeholder = 'https://www.twitter.com/username'
                                break;
                            case 'linkedIn':
                                value.placeholder = 'https://www.linkedin.com/in/username'
                                break;
                            case 'telegram':
                                value.placeholder = 'https://t.me/username'
                                break;
                            case 'discord':
                               value.placeholder = 'https://discord.com/username'
                                break;

                            case 'workAddresslabel':
                                value.placeholder = 'Work Address'
                                break;
                            case 'workAddressstreet':
                                value.placeholder = 'Street'
                                break;
                            case 'workAddresscity':
                                value.placeholder = 'City'
                                break;
                            case 'workAddressstateProvince':
                                value.placeholder = 'State/Province'
                                break;
                            case 'workAddresspostalCode':
                                value.placeholder = 'Postal Code'
                                break;
                            case 'workAddresscountryRegion':
                                
                                value.placeholder = 'Country'
                                break;
                            case 'logo':
                                
                                value.placeholder = 'https://www.example.com/logo.png'
                                break;
                            case 'url':
                                
                                value.placeholder = 'https://www.example.com'
                                break;
                            case 'title':
                                
                                value.placeholder = 'Software Engineer'
                                break;
                            case 'role':
                                
                                value.placeholder = 'Software Development'
                                break;

                            default:
                                
                                value.placeholder = 'Enter ' + key.toLowerCase()
                                break;
                        }
                        return { key, value }

                    });
                    this.showBtn = true;
                } else {
                    this.schema = {}
                    this.schemaProps = []
                    this.showBtn = false;
                }
                this.loading = false;
                // console.log(this.schemaProps);

            } catch (error) {
                this.showBtn = false;
                // console.log(error);
                this.schemaProps = [];
                this.schema = {}
                this.loading = false;
            }

        }


    }
};
</script>
  
<style lang="scss" scoped>
.claim-tips .input-wrapper {
    margin: 20px 0;
}

.custom-select {

    --vs-dropdown-bg: #ffffff;
    --vs-dropdown-option-color: #3e3e3e;
    --vs-selected-color: var(--vs-dropdown-option-color)
}

.ae-address {
    color: black;
    letter-spacing: -0.2px;
}
</style>
  