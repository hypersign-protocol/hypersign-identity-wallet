<template>
  <div class="index">
    
    <div v-if="!isProviderPresent">
        <img v-if="IN_FRAME" src="../../../icons/iframe/sendAndReceive.svg" />
    
        <div v-else class="not-iframe">
          <img src="../../../icons/hypersign-logo.png" :class="{ logo: !IS_WEB }" />
        </div>
        
        <Button @click="loginWithGoogle" data-cy="login-with-google">
          Continue with Google
        </Button>
        <br/>

        <a href="#" @click="gotoRestore">{{ $t('pages.index.restoreWallet') }}</a>
        
    </div>
    
    
    <Loader v-if="loading" />
  </div>
</template>

<script>
import { IN_FRAME } from '../../utils/helper';
import Logo from '../../../icons/hypersign-logo.png?vue-component';
import SuperheroLogo from '../../../icons/hypersign-logo.png?vue-component';
import CheckBox from '../components/CheckBox';
import Button from '../components/Button';
import Platforms from '../components/Platforms';
import { generateMnemonic, mnemonicToSeed } from '@aeternity/bip39';
import Input from '../components/Input-light';
import registration from '../../../mixins/registration';
import { HYPERSIGN_AUTH_PROVIDER, HIDNODE_RPC, HIDNODE_REST  } from '../../utils/hsConstants'
import  webAuth from "../../utils/auth0Connection";
import hidWalletInstance from '../../utils/hidWallet';
// import HypersignSsiSDK  from 'hs-ssi-sdk'
const HypersignSsiSDK = require('hs-ssi-sdk');

export default {
  mixins: [registration],
  components: { Logo,Input, SuperheroLogo, CheckBox, Button, Platforms },
  data: () => ({
    termsAgreed: false,
    IS_WEB: process.env.PLATFORM === 'web',
    IN_FRAME,
    loading:  false,
    isThridPartyAuth: false,
    isProviderPresent: false,
  }),
   created(){
    const authToken = localStorage.getItem("authToken");
    const accessToken = localStorage.getItem("accessToken"); 
    
    const that = this;
    
     // CAN IMPROVE THIS WITH ROUTER PARAMETERS, REPLACING LOCAL STORAGE
    if(authToken && accessToken){
      const provider = localStorage.getItem("provider"); 
      if(provider) this.isProviderPresent = true;
      this.loading = true;
       webAuth.client.userInfo(accessToken, function(err, user) {
              if(err){
                this.loading = false;
                this.$store.dispatch('modals/open', { name: 'default', msg:err });
                return;
              }
                const { email, name } = user;
                that.profile.email = email;
                that.profile.name = name;
                that.isThridPartyAuth = true;

                localStorage.removeItem("authToken")
                localStorage.removeItem("accessToken")
                localStorage.removeItem("isRoute")

                that.createWallet();
        })      
    } else {
      const queryDataFromServiceProviderStr = localStorage.getItem("qrDataQueryUrl");
      if(queryDataFromServiceProviderStr){
        const { provider } = JSON.parse(queryDataFromServiceProviderStr);
        if(provider){
          this.isProviderPresent = true;
          localStorage.setItem("provider", true)
          switch(provider){
            case HYPERSIGN_AUTH_PROVIDER.GOOGLE: {
              this.loginWithGoogle();
              localStorage.setItem("isRegisterFlow", true)
              break;
            }
            default:  // do nothing
          }
        } else {
         }
      } else {
      }
    }
  },
  
  methods: {
    loginWithGoogle(){
        webAuth.authorize(
          {
            connection: "google-oauth2",  
             redirectUri: window.location.origin + "/auth/google?"
          });

    },
    gotoRestore(){
      this.$router.push('restoreWallet') 
    },
    isemail(email) {
      var emailReg = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
      return emailReg.test(email);
    },

    async createWallet() {

      console.log('Inside createWallet')
      try{
        if(this.profile.name == "") throw new Error("Name can not be blank");
        if(this.profile.email == "") throw new Error("Email can not be blank");
        if(!this.isemail(this.profile.email)) throw new Error("Enter a valid email address");
      }catch(e){
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
        this.loading = false;
        return;
      }
      this.loading = true;
      /// Generate HID wallet and recharge it using faucet
      this.mnemonic = generateMnemonic(); 
      await hidWalletInstance.generateWallet(this.mnemonic);

      
      console.log('before rechargewallet')
      await hidWalletInstance.rechargeWallet(); 

      /// Use the HID wallet with SSI sdk
      const hsSdk = new HypersignSsiSDK(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST);
      await hsSdk.init();

      const seed = mnemonicToSeed(this.mnemonic).toString('hex');
      const address = await hidWalletInstance.getWalletAddress();  
      
      this.$store.commit('setMnemonic', this.mnemonic);
      const keypair = {
        publicKey: address,
        privateKey: seed,
      }
      ////HYPERSIGN Related
      ////////////////////////////////////////////////
      try {
        
        const kp = await hsSdk.did.generateKeys();

        const privateKeyMultibase = kp.privateKeyMultibase
        const publicKeyMultibase = kp.publicKeyMultibase

        const didDocString = hsSdk.did.generate({ publicKeyMultibase });
        const didDoc = JSON.parse(didDocString);

        const did  = didDoc.id;
        const verificationMethodId = didDoc['verificationMethod'][0].id;        
        const result = await hsSdk.did.register({ didDocString, privateKeyMultibase, verificationMethodId })

        if(!result){
          throw new Error("Could not register the did");
        }

        const { transactionHash } =  result;
        if(!transactionHash) {
          throw new Error("Could not register the did");
        }

        this.profile.did = did;
        this.$store.commit('setHSkeys', {
          keys: kp,
          did,
        });

        if(await this.setupProfile(this.isThridPartyAuth)){
            await this.$store.dispatch('setLogin', { keypair });

            this.$store.commit('switchLoggedIn', true);
            
            if(!this.isThridPartyAuth){
              const msg = 'An email with a QR code has been sent to the address you provided.\
              Scan the QR code to receieve the credential'
              this.$store.dispatch('modals/open', { name: 'default', msg });
            }

            Object.assign(this.profile, {});
            this.$router.push(this.$store.state.loginTargetLocation);
        }else{
          throw new Error("Could not setup profile");
        }

      } catch (e) {
        console.log(e);
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
        this.loading = false;
      } finally {
        this.loading = false;
      }
      ////HYPERSIGN Related
      ////////////////////////////////////////////////
    }
  }
  
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';
label.or-label{
 color: black;
 font-weight: bold;
}

input.input {
    /* display: block; */
    width: 100%;
    /* border-radius: 5px; */
    border-bottom: 2px solid #bbb!important;
    background: #f1f1f1!important;
    padding-left: 0px;
    margin-bottom: 22px;
    color: #3e3e3e!important;
    font-size: 14px;
    min-height: 35px;
    /* margin-left: auto; */
    /* margin-right: auto; */
}
.input-wrapper {
  width:282px;
  margin:auto;
}
.checkmark {
    height: 15px !important;
    width: 15px  !important;
}
.index {
  text-align: center !important;
  margin-top: 15%;
  .checkbox-container {
    margin: 0 auto 25px auto;
    max-width: 282px;
    font-size: 12px;
    ::v-deep .checkmark {
      margin-right: 5px;
    }
  }
  .heading-color{
    color: $text-color !important;
  }
  .primary-button {
    width: 282px;

    &:hover {
      background: #4aabff;
    }

    &:first-of-type {
      margin-bottom: 20px;
    }
  }

  .not-iframe {
    font-size: 16px;
    width: 312px;
    margin: 0 auto;
    text-align: center;

    span {
      margin: 15px 0;
      display: block;
      font-weight: 600;

      &.blue {
        margin-top: 0;
        color: $button-color;
      }
    }

    .platforms {
      border-radius: 10px;
    }
  }
}
</style>
