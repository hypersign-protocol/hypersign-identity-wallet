<template>
  <div class="popup">
    <div class="mt-10"> 
      <Input
        label="WALLET ADDRESS"
        :value="walletAddress"
        disabled
        class="ae-address"
      />

      <Input
        label="DID"
        :value="hypersign.did"
        disabled
        class="ae-address"
      />

      <Input
        label="NAME"
        v-model="profile.name"
        disabled
        class="ae-address"
      />

      <Input
        label="EMAIL"
        v-model="profile.email"
        disabled
        class="ae-address"
      />
      
      
      <Loader v-if="loading" />
    </div>
  </div>
</template>

<script>
import Input from '../components/Input';
import registration from '../../../mixins/registration';
import hidWalletInstance from '../../utils/hidWallet';
import { mapState } from 'vuex';

export default {
  mixins: [registration],
  components: { Input },
   computed: { 
    ...mapState(['mnemonic', 'hypersign']),
  },
  data: () => ({
    loading:  false,
    walletAddress: "",
    walletBalance: ""
  }),
  async created() {
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.walletAddress = await hidWalletInstance.getWalletAddress()
    this.walletBalance  = await hidWalletInstance.getBalance();
  },
  methods: {
    async setupProfileNow(){
      try{
        this.loading = true;
        await this.setupProfile();
      }catch (e) {
        // console.log(e)
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg:e.message });
      }
      finally{
        this.loading =  false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.claim-tips .input-wrapper {
  margin: 20px 0;
}


.ae-address {
    color: black;
    letter-spacing: -0.2px;
}


</style>
