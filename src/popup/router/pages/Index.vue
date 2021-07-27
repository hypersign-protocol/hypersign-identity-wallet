<template>
  <div class="index">
    <img v-if="IN_FRAME" src="../../../icons/iframe/sendAndReceive.svg" />
    <div v-else class="not-iframe">
      <img src="../../../icons/hypersign-logo.png" :class="{ logo: !IS_WEB }" />
      <!-- <Component :is="IS_WEB ? 'SuperheroLogo' : 'Logo'" :class="{ logo: !IS_WEB }" /> -->
      <!-- <span :class="{ blue: IS_WEB }" class="heading-color">
        {{ $t('pages.index.heading') }}
      </span>
      <template v-if="IS_WEB">
        <Platforms class="heading-color">
          {{ $t('pages.index.platforms.heading') }}
        </Platforms>
        <span class="heading-color">{{ $t('pages.index.webVersion') }}</span>
      </template> -->
    </div>
    <div class="">
      <Input
        placeholder="Name"
        label=""
        v-model="profile.name"
        :disabled="ifAllDisabled"
      />
      <Input
        placeholder="Email"
        label=""
        v-model="profile.email"
        :disabled="ifAllDisabled"
      /></div>
    <CheckBox v-model="termsAgreed" data-cy="checkbox" style="padding: 20px;">
      <span class="heading-color">
        {{ $t('pages.index.term1') }}
        <RouterLink to="/termsOfService" data-cy="terms">
          {{ $t('pages.index.termsAndConditions') }}
        </RouterLink>
      </span>
    </CheckBox>

    <Button @click="createWallet" :disabled="!termsAgreed" data-cy="generate-wallet">
      {{ $t('pages.index.generateWallet') }}
    </Button>
    <label class="sett_info">OR</label>
    <br/>
    <a href="#" @click="gotoRestore">{{ $t('pages.index.restoreWallet') }}</a>
    <!-- <Button @click="gotoRestore" :disabled="!termsAgreed">
      {{ $t('pages.index.restoreWallet') }}
    </Button> -->
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
import HypersignSsiSDK from 'hs-ssi-sdk';
import { HS_NODE_BASE_URL } from '../../utils/hsConstants'
export default {
  mixins: [registration],
  components: { Logo,Input, SuperheroLogo, CheckBox, Button, Platforms },
  data: () => ({
    termsAgreed: false,
    IS_WEB: process.env.PLATFORM === 'web',
    IN_FRAME,
    loading:  false
  }),
  methods: {
    gotoRestore(){
      this.$router.push('restoreWallet') 
    },
    isemail(email) {
      var emailReg = /^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
      return emailReg.test(email);
    },

    async createWallet() {


      try{
        if(this.profile.name == "") throw new Error("Name can not be blank");
        if(this.profile.email == "") throw new Error("Email can not be blank");
        if(!this.isemail(this.profile.email)) throw new Error("Enter a valid email address");


      }catch(e){
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
        return;
      }
      
      const hsSdk = new HypersignSsiSDK({ nodeUrl: HS_NODE_BASE_URL }); 
      this.mnemonic = generateMnemonic();
      

      const seed = mnemonicToSeed(this.mnemonic).toString('hex');
      
      // console.log(seed)

      const address = await this.$store.dispatch('generateWallet', { seed });
      this.$store.commit('setMnemonic', this.mnemonic);
      const keypair = {
        publicKey: address,
        privateKey: seed,
      };
      // console.log(keypair)
      ////HYPERSIGN Related
      ////////////////////////////////////////////////
      try {
        this.loading = true;
        // We will not use native aeternity keys, instead will use hypersign keys.
        // The reason to do this, because giving flexibility to use different algorithm for keys
        // const newKeyPair = await hypersignSDK.did.generateKeys({seed});  
        // if(!newKeyPair)       throw Error('Error: could not generate keypair');
        // console.log(newKeyPair);
        // const hskeys = {
        //   publicKey: newKeyPair.publicKey.publicKeyBase58,
        //   privateKey: newKeyPair.privateKeyBase58,
        // };
        // if(!hskeys.publicKey)  throw new Error('Error: Public key is empty')
        // const HS_CORE_DID_REGISTER = `${HS_NODE_BASE_URL}${HS_NODE_DID_REGISTER_API}`;
        // //console.log(HS_CORE_DID_REGISTER);
        // let result = await axios.get(`${HS_CORE_DID_REGISTER}?publicKey=${hskeys.publicKey}`)//.then(result => result.json());
        // console.log(result)
        // result = result.data;
        // if (!result) throw new Error('Could not fetch from hypersign');
        // if (result && result.error) throw new Error(result.error);
        
        // const { keys, did } = result.message;
        // keys['privateKeyBase58'] = hskeys.privateKey;
        // console.log(this.profile)
        // console.log('Before getting did')
        // console.log(hsSdk.did)
        const response1  = await hsSdk.did.getDid({user: { name: this.profile.name }});
        // console.log(response1);
        const {didDoc, keys, did} = response1
        // console.log({didDoc, keys, did})

        // console.log('Before calling register')
        const res = await hsSdk.did.register(didDoc);
        // console.log(2)
        // console.log('After registration')

        this.profile.did = did;
        // console.log(3)
        this.$store.commit('setHSkeys', {
          keys,
          did,
        });

        
        // this.$store.commit('switchLoggedIn', true);
        // this.$store.commit('updateAccount', keypair);
        // this.$store.commit('setActiveAccount', { publicKey: keypair.publicKey, index: 0 });
        console.log("Before setting profile")
        if(await this.setupProfile()){
            console.log("After setting profile");
            console.log("Calling setLogin")
            await this.$store.dispatch('setLogin', { keypair });
            this.$store.commit('switchLoggedIn', true);

            const msg = 'An email with a QR code has been sent to the address you provided.\
            Scan the QR code to receieve the credential'
            this.$store.dispatch('modals/open', { name: 'default', msg });

            Object.assign(this.profile, {});
            console.log("Moving to next route")
            this.$router.push(this.$store.state.loginTargetLocation);
        }else{
          throw new Error("Could not setup profile");
        }

      } catch (e) {
        console.log(e);
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
        this.loading = false;
      }finally{
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
