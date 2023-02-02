<template>
  <div class="popup">
    <div class="mt-10">
      <Input label="WALLET ADDRESS" :value="walletAddress" disabled class="ae-address" />

      <Input label="BALANCE (HID)" :value="walletBalance/1e6" disabled class="ae-address" />

      <Input label="Enter Recipient Address" v-model="recipient" class="ae-address" />

      <Input label="Enter Amount (HID)" v-model="amount" class="ae-address" />

      <Button half @click="sendTokens">
        Send
      </Button>
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
    ...mapState(['mnemonic']),
  },
  data: () => ({
    loading:  false,
    walletAddress: "",
    walletBalance: "",
    recipient: "",
    amount: "",
    actualAmount:"",
  }),
  async created() {
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.walletAddress = await hidWalletInstance.getWalletAddress()
    this.walletBalance  = await hidWalletInstance.getBalance();
  },
  methods: {
    async sendTokens(){
      try{
        this.loading = true;
        if (this.amount == "") throw new Error("Amount can not be blank");
        if (this.recipient == "") throw new Error("Recipient can not be blank");
        if (this.recipient.indexOf('hid') < 0) throw new Error('Invalid address');
        this.actualAmount=parseFloat(this.amount)*1e6
        if (parseFloat(this.walletAddress) < this.actualAmount) throw new Error("Insufficient balance")
        this.actualAmount=this.actualAmount.toString()
        const amount = [
          {
            denom: "uhid",
            amount: this.actualAmount.trim(),
          },
        ];
        const result = await hidWalletInstance.sendTokens({ recipient: this.recipient.trim(), amount});
        if (!result.transactionHash){
          throw new Error('Transaction Unsuccessful. Error = ' + result.error)
        } else {
          return this.$store.dispatch('modals/open', { name: 'default', msg: 'Transaction Successful; TxHash ' + result.transactionHash
});
        }
      }catch(e){
        console.log(e)
        this.loading = false;
        if (e.message) this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
      } finally{
        this.amount = "";
        this.recipient = "";
        this.loading = false;
      }
    },
    async setupProfileNow(){
      try{
        this.loading = true;
        await this.setupProfile();
      }catch (e) {
        console.log(e)
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
