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
          <!-- <input
                type="file"
                class="form-control"
                placeholder="select backup file"
                @change="onFileChange"
                accept="hypersign-identity-wallet.txt"
                v-if="this.activeNetwork==='local'"
                style="width:100%; height:100%"
                />-->
        </div>
        <div class="margin-20">
          <Input placeholder="Enter your password" label="" type="password" v-model="password" />
        </div>

        <Button @click="askPin()" style="margin-top: 30%;">
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
import cryptoService from '../../../mixins/cryptoService'
import edvService from '../../utils/edvService'
export default {
  components: {
    ListItem,
    CheckBox,
    Input
  },
  data() {
    return {
      sequence: 0,
      userId: undefined,
      docId: undefined,
      loading: false,
      activeNetwork: 'cloud',
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
          disabled: false,
        },
        {
          text: this.$t('pages.backup-wallet.select-option-2'),
          value: "cloud",
          disabled: true,
        }
      ],
      seedError: {},
      seed_verified: false,
      walletJson: '',
      type: ''
    };
  },
  mixins: [cryptoService],

  mounted() {
    this.$store.commit('setDontGoBack', true)

    this.userId = this.$store.getters.profile.email


  },

  methods: {
    async askPin() {

      try {
        this.loading = true

        if (this.password === '') throw new Error('Please enter a password.');
        this.$store.commit('setPassword', this.password);
        const edvServiceInstance = new edvService();
        const data = await edvServiceInstance.resync(this.userId)
        const decrypdtWallet = await this.decryptWallet(data.encryptedMessage, this.password)
        const { hypersign, mnemonic } = JSON.parse(decrypdtWallet)
        console.log(mnemonic)
        await this.restore(hypersign, mnemonic)



        this.$store.commit('setDontGoBack', false)
        this.$store.commit('setProfile', {})

        this.loading = false
      } catch (e) {
        this.$store.commit('setDontGoBack', false)
        this.loading = false
        console.log(e);
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
      finally {
        this.loading = false
      }



    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.margin-20 {
  margin-top: 20px;
  margin-bottom: 28px;
}

.margin-10 {
  margin-top: 10px;
  margin-bottom: 10px
}

.icon {
  max-width: 55%;
  margin-left: 23%;
  display: block;
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
  color: #000 !important;
  padding-top: 10px;
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
