import { mapGetters, mapState } from 'vuex';
import axios from 'axios';
import { toURL, validateTipUrl } from '../popup/utils/helper';
import { SUPERHERO_HS_AUTH_BASE_URL, SUPERHERO_HS_AUTH_CREDENTIAL_ISSUE_API } from '../popup/utils/hsConstants'

export default {
    data: () => ({
        url: '',
        loading: false,
        ifEdit: false,
        ifCreate: true,
        ifAllDisabled: false,
        profile: {
            email: "",
            name: "",
            did: "",
            didDoc: "",
        },
        copied: false,
    }),
    computed: {
        ...mapGetters(['account', 'hypersign']),
        normalizedUrl() {
            if (!validateTipUrl(this.url)) return '';
            return toURL(this.url).toString();
        },
    },
    async created() {
        if (Object.keys(this.hypersign.profile).length == 0) {
            this.profile.did = this.hypersign.did
            this.profile.didDoc = this.hypersign.didDoc
        } else {
            this.profile = {...this.hypersign.profile }
            this.ifEdit = true;
            this.ifCreate = false;
            this.ifAllDisabled = true;
        }
    },
    methods: {
        edit() {
            this.ifAllDisabled = false;
            this.ifEdit = false;
            this.ifCreate = true;
        },
        async setupProfile(isThridPartyAuth = false) {
            // try {
            //     this.loading = true;
            //// HS_TODO::
            // Fetch email, name from text box
            // Fetch did from localstore
            // Call studio register api to get a hypersign credentials
            // Once you get the credential, store it in the localstore. - this we need to think a bit, how will user store it, either in browser storage or how
            const HS_STUDIO_REGISTER_URL = `${SUPERHERO_HS_AUTH_BASE_URL}${SUPERHERO_HS_AUTH_CREDENTIAL_ISSUE_API}`

            const body = {
                user: {
                    name: this.profile.name,
                    email: this.profile.email,
                    
                },
                didDoc:this.profile.didDoc,
                isThridPartyAuth: false,
                expirationDate: "2030-12-31T00:00:00.000Z"
            }

            if(isThridPartyAuth){
                const thridPartyAuthGetter = this.$store.getters.thirdPartyGoogleAuth;
                body["user"]["did"] = this.profile.did;
                body["didDoc"] = this.profile.didDoc;
                body["isThridPartyAuth"] = true;
                if(thridPartyAuthGetter){
                    body["thridPartyAuthProvider"] = thridPartyAuthGetter.provider;
                    body["accessToken"] = thridPartyAuthGetter.accessToken;
                }
            }
            
            let res = await axios.post(HS_STUDIO_REGISTER_URL, body);

            if (!res) throw new Error("Could not register the user");
            // console.log("After getting response")
            res = res.data;
            // console.log(res)
            // console.log(res.message)
           
            if (res && res.status != 200) throw new Error(res.error);


            // console.log(typeof(res.message))
            console.log(res.message)
            if (isThridPartyAuth && res && res.message) {
                // console.log("Before setting 3rdPartyAuthVC");
                // only in case of 3rd party auth, verifiable credenital will come
                localStorage.setItem("3rdPartyAuthVC", JSON.stringify(res.message));
            }

            this.$store.commit('addHSProfile', this.profile);
            this.$store.commit('clearThridPartyAuth', { provider: 'Google' })
            this.ifEdit = true;
            this.ifCreate = false;
            this.ifAllDisabled = true;

            return true;
        },
    },
};