<template>
  <div class="popup">
    <div class="">
      <ul class="list-group">
        <li class="list-group-item">
          <div class="list-title">IN/OUT: </div>
          <div>{{ tx.type }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">TxHash: </div>
          <div>0x{{ tx.txhash }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">Height: </div>
          <div>{{ tx.height }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">Timestamp: </div>
          <div>{{ tx.timestamp }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">Gas (Used/Wanted): </div>
          <div>{{ tx.gas }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">Fee: </div>
          <div>{{ tx.fee }}</div>
        </li>

        <li class="list-group-item">
          <div><a :href="`https://hid-explorer.netlify.app/explorer/txdetails?hash=0x${tx.txhash}`" target="_blank">View
              Full Details</a>
          </div>
        </li>
      </ul>
      <Loader v-if="loading" />
    </div>
  </div>
</template>
<script>
export default {
  name:'transactionDetails',
  components: { },
  data() {``
    return {
      loading: false,
      tx: {}
    };
  },
  created() {
    const queryDataStr = this.$route.query.data
    if(queryDataStr){
      const decodedStr = decodeURI(queryDataStr)
      console.log(decodedStr)
      this.tx = { ...JSON.parse(decodedStr) }
    }else {
      console.error('No query data found')
    }
  },
  computed: {
   
  },
  methods: { 
    toUpper(t){
      if(t)
        return t.toString().toUpperCase();
      else 
        return t;
    },   
  },
}
</script>

<style lang="scss" scoped>
@import '../../../common/variables';
.cred-card-body {
  padding-left: 10px;
  margin-top: 27%;
  padding-bottom: 5%;
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
.credential-list {
    min-height: 700px;
overflow-y: auto;
border-radius: 5px;
overflow-x: hidden;
max-height: 700px;
    
}
.cred-card {
  background: #21222a !important;
  box-shadow: 0 0 8px rgba(0, 33, 87, 0.15);
  border-radius: 14px;
  margin-top: 7%;
  text-align: left;
  font-size: 13px;
  color: gray;
  padding-top: 7%;
}
.cred-card-header {
  color: #fff;

  border-bottom: 1px solid #80808061;
  border-top: 1px solid gray;

  background-color: #808080f0;

  font-size: larger;
  text-align: right;
  padding-right: 8px;
}

.list-title {
  color: $text-color;
  font-size: 12px;
  text-transform:capitalize;
}

.list-group {
  padding: 0 !important;
  margin-top: 30px;
}

.list-group-item {
  text-decoration: none;
  transition: 0.4s;
  position: relative;
  padding: 1rem 1.5rem;
  width: 100%;
  display: block;
  font-size: 12px;
  border-bottom: 1px solid #cccccc2e;
  text-align: left;
  border-left: 2px solid transparent;
  color: gray;
}

.d-flex {
  display: flex;
  float: right;
  padding: 5px;
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