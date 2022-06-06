<template>
  <div class="popup">
    <span class="altText" v-if="transactions.length == 0">No transaction found.</span>
    <Panel v-else>
      <PanelItem v-for="tx in transactions"
        :to="`/transaction/0x${tx.txhash}?data=${JSON.stringify({ type: tx.type, txhash: tx.txhash, timestamp: tx.timestamp, height: tx.height, fee: getFee(tx), gas: `${tx.gas_used} / ${tx.gas_wanted}` })}`"
        :title="toStringShortner(tx.txhash)" :info="tx.type + ' | ' + tx.timestamp" />
    </Panel>
    <Loader v-if="loading" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import removeAccountMixin from '../../../mixins/removeAccount';
import axios from 'axios';
import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { HIDNODE_REST } from '../../utils/hsConstants'
import hidWalletInstance from '../../utils/hidWallet';


import PanelItem from '../components/PanelItem';
import Panel from '../components/Panel';


export default {
  mixins: [removeAccountMixin],
  components: { Panel, PanelItem},
  data() {
    return {
      walletAddress:"", 
      transactions: [],
      basicTxData: {},     
      form: {
        url: '',
        amount: '',
      },
      loading: false,
      credentialDetail: {
        formattedSchemaName: "",
        formattedIssuanceDate: "",
      }
    };
  },
  props: ['address'],
  computed: {
    ...mapState(['saveErrorLog','mnemonic']),
    ...mapGetters(['hypersign']),
    validUrl() {
      return this.form.url != '';
    },
  },
  async created() {
    await hidWalletInstance.generateWallet(this.mnemonic);
    this.walletAddress = await hidWalletInstance.getWalletAddress()
    this.fetchWalletTxs();
  },

  methods: {  

    toStringShortner(str){
      return '0x' + toStringShorner(str, 22, 10)
    },

    async fetchOutTxs() {

      const txListHeSentURL = `${HIDNODE_REST}/cosmos/tx/v1beta1/txs?events=message.sender='${this.walletAddress}'`

      let response = await axios.get(txListHeSentURL);
      response = response.data;
      const { tx_responses } = response;

      tx_responses.map(x => {
        return x['type'] = 'OUT'
      })

      return tx_responses;
    },

    getFee(tx){
      const fee = tx.tx.auth_info.fee.amount[0];
      return fee.amount + fee.denom;
    },

    async fetchInTxs() {


      const txListHeReceivedURL = `${HIDNODE_REST}/cosmos/tx/v1beta1/txs?events=transfer.recipient='${this.walletAddress}'` 


      let response = await axios.get(txListHeReceivedURL);
      response = response.data;
      const { tx_responses } = response;

      tx_responses.map(x => {
        return x['type'] = 'IN'
      })


      return tx_responses;

    },

    async fetchWalletTxs() {
      this.transactions = [];
      this.loading = true;
      const outTxs = this.fetchOutTxs()
      const inTxs = this.fetchInTxs()
      const results = await Promise.all([inTxs, outTxs])
      this.transactions = results[0].concat(results[1]);
      this.loading =  false;
    },
  },
};
</script>


<style lang="scss" scoped>
@import '../../../common/variables';
.altText{
  color: #80808091;
  font-size: larger;
}
.d-flex {
  display: flex;
  float: right;
  padding: 5px;
}

.scan-text{
  margin-left: 20px;
  margin-bottom: 2px;
  // float: right;
}

.scanner {
  // position: fixed;
  bottom: 0;
  margin-top: 3%;
  width: 59%;
  border-radius: 49px;
  margin-left: 13%;
}

.withdraw.step1 {
  textarea {
    width: 250px;
    min-height: 60px !important;
    margin: 0 20px 0 0;
    font-size: 11px;
  }

  small {
    color: $accent-color;
    display: block;
    width: 100%;
    padding-top: 5px;
    font-size: 12px;
  }
}

.withdraw.step2 {
  p {
    display: flex;
    justify-content: center;
    line-height: 2rem;
  }

  p:not(:first-of-type) {
    color: $text-color;
  }

  p > svg {
    margin-right: 10px;
  }

  .info-group {
    text-align: left;
    display: block;
    margin: 20px 0;

    .info-label {
      display: block;
      padding: 10px 0;
    }

    .info-span {
      color: $accent-color;
      font-size: 11px;
      display: inline-block;
      width: 300px;
      white-space: nowrap;
      // overflow: hidden !important;
      // text-overflow: ellipsis;
      letter-spacing: -0.3px;
      cursor: pointer;
    }

    .amount {
      font-size: 26px;
      color: $secondary-color;
    }

    .currencyamount {
      font-size: 18px;
      display: block;

      span {
        font-size: 18px;
      }
    }
  }

  .text-center {
    text-align: center;
  }
}
</style>
