<template>
  <div class="popup">
    <div data-cy="seed-phrase-backup-window" v-if="type == ''">
      <div class="maindiv_input-group-addon">
          <p class="heading sett_info">{{ $t('pages.restore-wallet.heading') }}</p>
          <img src="../../../icons/cloud-download-down-arrow.svg" alt="Upload logo" class="icon" />
          
          
          <div class="margin-20">
            <!-- <label class="sett_info">{{ $t('pages.restore-wallet.select-info') }}</label> -->
            <!-- <ListItem v-for="network in options" :key="network.text" @click.native="selectNetwork(network)" class="network-row">
              <div class="margin-10">
                {{network.text}}
              </div>
              <CheckBox
                :value="network.value === activeNetwork"
                type="radio"
                :disabled="network.disabled"
                name="activeNetwork"
                prevent
              />
            </ListItem> -->
            <input
                type="file"
                class="form-control"
                placeholder="select backup file"
                @change="onFileChange"
                accept="hypersign-identity-wallet.txt"
                v-if="this.activeNetwork==='local'"
                style="width:100%; height:100%"
                />
          </div>
      <div class="margin-20">
         <Input
                  placeholder="Enter your password"
                  label=""
                  type="password"
                  v-model="password"
                  />
      </div>
         
        <Button @click="restore()" style="margin-top: 30%;">
          {{ $t('pages.restore-wallet.button') }}
        </Button>
      </div>
      <Loader v-if="loading" />
    </div>
  </div>
</template>

<script>
import ListItem from '../components/ListItem';
import CheckBox from '../components/CheckBox';
import Input from '../components/Input';
const { decrypt } = require('../../../lib/symmericCrypto') ;
import { mnemonicToSeed, validateMnemonic } from '@aeternity/bip39';
export default {
  components: {
    ListItem,
    CheckBox,
    Input
  },
  data() {
    return {
      loading: false,
      activeNetwork:'local',
      modal: {
        visible: false,
        title: '',
      },
      seedPhrase: '',
      password: '',
      options: [
        { 
          text: this.$t('pages.backup-wallet.select-option-1'), 
          value: "local",
          disabled:false,
        },
        { 
          text: this.$t('pages.backup-wallet.select-option-2'), 
          value: "cloud",
          disabled:true,
        }
      ],
      seedError: {},
      seed_verified: false,
      walletJson: '',
      type: ''
    };
  },
  methods: {
    async selectNetwork(network) {
      if(!network.disabled){
        this.activeNetwork = network.value
      } else {
        this.$store.dispatch('modals/open', { name: 'default', msg: 'Feature coming soon...'});
      }
    },
    async importAccount() {
      // this.loading = true;
      if (!this.mnemonic)  throw new Error('Mnemonic not found in encryted file.')

        this.mnemonic = this.mnemonic.trim();
        const mnemonic = this.mnemonic.split(' ');
        if (mnemonic.length >= 12 && mnemonic.length <= 24 && validateMnemonic(this.mnemonic)) {
          this.errorMsg = null;
          const seed = mnemonicToSeed(this.mnemonic).toString('hex');
          const address = await this.$store.dispatch('generateWallet', { seed });
          this.$store.commit('setMnemonic', this.mnemonic);
          const keypair = {
            publicKey: address,
            privateKey: seed,
          };
          await this.$store.dispatch('setLogin', { keypair });
          this.$store.commit('setBackedUpSeed', true);
          setTimeout(() => this.$router.push(this.$store.state.loginTargetLocation), 1000);
        }else{
          throw new Error('Could not import accounts. Invalid Mnemonic');
        }
    },
    validateMnemonic() {
      return validateMnemonic(this.mnemonic);
    },
    onFileChange(){
      try{
       const file = event.target.files[0];
      //  console.log(file)
       if(!file) throw Error('Error loading backup file')

       if(file.name.indexOf('hypersign-identity-wallet-backup') > 0) throw Error('Incorrect file. Please select hypersign backup file')
       // TODO:  check if file name is correct
      //  console.log('Reading file start')
       this.readFile(file, this.onfileLoadSuccess);
      }catch(e){
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
      }
    },
    readFile(file, cb){
      //console.log('Inside reaffileDs')
      const reader = new FileReader();
      reader.onload = cb
      reader.readAsText(file);
    },
    onfileLoadSuccess (evt){
     this.walletJson = evt.target.result;
    //  console.log(this.walletJson);
    //  console.log('Reading file done')
    },

    async restore(){
      try{
        this.loading = true;
        // Check the password
        if(this.password === "")throw new Error("Please enter a password")
        if(this.activeNetwork === "")throw new Error('Please choose a backup type.')
        if(this.walletJson === "") throw new Error('Incorrect data')

        setTimeout(async () => {
          try{
            const walletData = await decrypt(this.walletJson, this.password);
            const { hypersign, mnemonic  } =  JSON.parse(walletData);
            // console.log(walletData)

            this.$store.commit('restoreHypersign',hypersign);

            // setup the mnemonic for main account
            this.mnemonic = mnemonic;
            await this.importAccount();
        
            this.loading = false;
            this.$store.dispatch('modals/open', { name: 'default', msg: 'Restore successful' });
            this.$router.push('/account');  
          }catch(e){
            this.loading = false;  
            this.password = "";
            if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: "Incorrect password" });
          }
          
        }, 1000)


      }catch(e){
          this.loading = false;  
            this.password = "";
          if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';
.margin-20 {
  margin-top:20px;
  margin-bottom:28px;
}
.margin-10 {
  margin-top:10px;
  margin-bottom:10px
}
.icon {
  max-width:55%;
  margin-left: 23%;
  display:block;
  margin-top: 10%;
  width: 50%;
  filter: invert(51%) sepia(63%) saturate(10%) hue-rotate(37deg) brightness(88%) contrast(89%);
  margin-bottom: 17%;
}
.heading {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
}
.ae-modal {
  background: $border-color !important;
}

.mnemonics p,
.mnemonics button {
  color: #000 !important;
}

.regbtn {
  background: #ff0d6a;
  color: #fff;
  float: right;
  width: 19%;
  border-radius: 0 !important;
}

.maindiv_input-group-addon {
  color:#000 !important;
  padding-top:10px;
}

.maindiv_input-group-addon h4 {
  text-align: left;
  margin: 0 !important;
}

.addon-input {
  width: 75%;
  outline: none;
  color: #828282;
  padding: 0;
  height: 55px;
  text-indent: 5px;
  caret-color: #ff0d6a;
}

.addon-lbl {
  font-weight: 600;
  color: #828282;
}



.notround {
  border-radius: 0 !important;
}

small {
  word-break: break-word;
}

.seedBadge {
  user-select: unset;
  cursor: pointer;
  border: 2px solid #edf3f7;

  .seedClose {
    margin-left: 5px;
  }

  &.selected {
    opacity: 0.4;
    cursor: unset;
    background: transparent;
    border: 2px solid #c1c1c1;
    color: #fff;
  }
}

</style>
