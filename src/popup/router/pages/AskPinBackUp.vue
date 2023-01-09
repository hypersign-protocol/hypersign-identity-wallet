<template>
  <div class="popup">
    <div data-cy="seed-phrase-backup-window" v-if="type == ''">
      <div class="maindiv_input-group-addon">
        <p class="heading sett_info">{{ $t('pages.backup-wallet.heading') }}</p>
        <img src="../../../icons/cloud-backup-up-arrow_gray.png" alt="Upload logo" class="icon" />

        <div class="margin-20">
          <Input placeholder="Enter your password" label="" type="password" v-model="password" />
        </div>
        <div class="margin-20">
          <Input placeholder="Re-enter your password" label="" type="password" v-model="repassword" />
        </div>

        <!-- <div class="margin-20">
          <label class="sett_info">{{ $t('pages.backup-wallet.select-info') }}</label>
          <ListItem
            v-for="backupType in options"
            :key="backupType.text"
            @click.native="selectBackupType(backupType)"
            class="network-row"
          >
            <div class="margin-10">
              {{ backupType.text }}
            </div>
            <div class="mr-auto text-left">
              <p class="f-16" data-cy="network-name">{{ backupType.name }}</p>
            </div>
            <CheckBox
              :value="backupType.value === activeBackup"
              type="radio"
              :disabled="backupType.disabled"
              name="activeBackup"
              prevent
            />
          </ListItem>
        </div> -->

        <Button @click="askPinBkUP()">
          {{ $t('pages.backup-wallet.button') }}
        </Button>
      </div>
      <Loader v-if="loading" />
    </div>
  </div>
</template>

<script>
import ListItem from '../components/ListItem';
import CheckBox from '../components/CheckBox';
import cryptoService from '../../../mixins/cryptoService'
import edvService from '../../utils/edvService'

import { mapGetters, mapState } from 'vuex';
import Input from '../components/Input';

export default {
  components: {
    ListItem,
    CheckBox,
    Input,
  },
  data() {
    return {
      loading: false,
      activeBackup: 'local',
      modal: {
        visible: false,
        title: '',
      },
      seedPhrase: '',
      password: '',
      repassword: '',
      options: [
        {
          text: this.$t('pages.backup-wallet.setelct-option-ask-pin'),
          value: 'local',
          disabled: false,
        },
        {
          text: this.$t('pages.backup-wallet.select-option-2'),
          value: 'cloud',
          disabled: true,
        },
      ],
      alert: {
        fill: 'neutral',
        show: false,
        content: '',
      },
      loading: false,
      type: '',
    };
  },
  computed: {
    ...mapState(['mnemonic']),
    ...mapGetters(['hypersign']),

  },
  mixins: [cryptoService],

  mounted() {
    this.$store.commit('setDontGoBack', true)

  },
  methods: {
    async askPinBkUP() {

      try {
        this.loading = true
        if (this.password === '') throw new Error('Please enter a password.');
        if (this.password != this.repassword) throw new Error('Password mismatch');
        this.$store.commit('setPassword', this.password);      // encrypt Wallet


        const encryptedMessage = await this.encryptWallet(this.mnemonic, this.hypersign, this.password)
        const edvServiceInstance = new edvService();
            const documentId = 'randomId'
            const userData = {
              userId: this.hypersign.profile.email,
              sequenceNo: 0,
              docId: documentId,
            }
            const data = {
              encryptedMessage
            }
            await edvServiceInstance.sync(userData, data)
        this.$store.commit('setDontGoBack', false)
        this.loading = false
      } catch (e) {
        console.log(e);
        this.loading = false
        this.$store.commit('setDontGoBack', true)


        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      }
      finally {
        this.loading = false
      }


    }
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.margin-20 {
  margin-top: 20px;
  margin-bottom: 20px;
}

.margin-10 {
  margin-top: 10px;
  margin-bottom: 10px;
}

.icon {
  max-width: 55%;
  margin-left: 23%;
  display: block;
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
