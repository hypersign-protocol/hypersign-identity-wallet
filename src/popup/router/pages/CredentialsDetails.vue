<template>
  <div class="popup">
    <div class="">
      <!-- <div class="cred-card">
        <div class="cred-card-header">
          <span>{{ credDetials.formattedSchemaName }}</span>
        </div>
        <div class="cred-card-body">
          <span class="cred-card-body-detail">SCHEMA ID: {{ credDetials.schemaId }}</span><br />
          <span class="cred-card-body-detail">ISSUER ID: {{ credDetials.formattedIssuer }}</span><br />
          <span class="cred-card-body-detail">ISSUED ON: {{ credDetials.formattedIssuanceDate }}</span><br />
        </div>
      </div> -->
      <ul class="list-group">
        <li class="list-group-item">
          <div class="list-title">CREDENTIAL ID: </div>
          <div>{{ verifiableCredential.id }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">CREDENTIAL TYPE: </div>
          <div>{{ credDetials.formattedSchemaName }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">SCHEMA ID: </div>
          <div>{{ credDetials.schemaId }}</div>
        </li>
        <li class="list-group-item">
          <div class="list-title">ISSUER DID: </div>
            <div>{{ verifiableCredential.issuer }}</div>
        </li>
        <li class="list-group-item" style="height: 66px;">
          <div style="float:left; width: 50%">
            <div class="list-title">ISSUANCE DATE: </div>
            <div>{{ formattedDate(verifiableCredential.issuanceDate) }}</div>
          </div>
          <div style="float:right; width: 50%; text-align: right;">
            <div class="list-title">EXPIRY DATE: </div>
            <div>{{ formattedDate(verifiableCredential.expirationDate) }}</div>
          </div>
        </li>


        <li class="list-group-item" v-for="claim in claims" :key="claim">
          <div class="list-title">{{ toUpper(claim) }}: </div>
          <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
        </li>
      </ul>
      <Loader v-if="loading" />
    </div>
    <div>
      <img :src="imgS" alt="" srcset="">
      <Button v-if="share" v-on:click="shareCredential">Share</Button>
        <Button  @click="deleteCredential">
          <CloseIcon width="20" height="20" class="scan-icon"/><span class="scan-text">Delete</span>
        </Button>      
      <Loader v-if="loading" />

    </div>
  </div>
</template>
<script>
const HypersignSSISdk = require('hs-ssi-sdk');

import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import hidWalletInstance from '../../utils/hidWallet';
import { HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE, SUPERHERO_HS_AUTH_BASE_URL, BUSINESSCARD_SCHEMA,CERTIFICATECARD_SCHEMA } from '../../utils/hsConstants'
import Axios from 'axios';
import html2canvas from 'html2canvas';
import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
import logoImage from "../../../icons/hypersign.jpg"
import { EventBus } from '../../utils/eventBus';
export default {
  components: { QrIcon, CloseIcon },
  data() {
    return {
      share: false,
      verifiableCredential: {},
      claims: [],
      loading: false,
      credDetials: {
        formattedIssuer: "",
        formattedExpirationDate: "",
        formattedIssuanceDate: "",
        formattedSchemaName: "",
        schemaId: ""
      },
      imgS:''
    };
  },
  created() {
    const credentialId = this.$route.params.credentialId;
    if (credentialId) {
      this.verifiableCredential = this.hypersign.credentials.find(x => x.id == credentialId);
      if(this.verifiableCredential===undefined){
        return this.$router.push('/account')
         
      }
      this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate);
      this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate);
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      const credentialSchema = this.verifiableCredential.credentialSchema.id
      if (credentialSchema === BUSINESSCARD_SCHEMA) {
        this.share = true
      }
      if(credentialSchema === CERTIFICATECARD_SCHEMA){
        this.share = true
      }
      this.credDetials.schemaId = getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim();
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
  },
  computed: {
    ...mapGetters(['hypersign']),
    ...mapState(['mnemonic'])

  },
  methods: {
    formattedDate(date){
      const d =  new Date(date)      
      return d.toLocaleDateString() 
    },
     deleteCredential() {
      // console.log("deleteCredential");
      try {
        this.loading = true
        this.$store.dispatch('removeHSVerifiableCredential', this.verifiableCredential)
        this.$store.dispatch('modals/open', { name: 'default', msg: 'Credential deleted successfully' });
        this.$router.push({ name: 'credential' })
        this.loading = false
      } catch (error) {
        this.loading = false

      }
    },
    async shareCredential() {
      this.loading = true;

      await hidWalletInstance.generateWallet(this.mnemonic);
      this.hsSDK = new HypersignSSISdk(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
      await this.hsSDK.init();

      const vp_unsigned = await this.hsSDK.vp.getPresentation(
        {
          verifiableCredentials: [this.verifiableCredential],
          holderDid: this.hypersign.did
        }
      );

      const verificationMethodId = this.hypersign.did + '#key-1';
      const vp_signed = await this.hsSDK.vp.signPresentation(
        {
          presentation: vp_unsigned,
          holderDidDocSigned: this.hypersign.didDoc,
          privateKey: this.hypersign.keys.privateKeyMultibase,
          challenge: "123",
          verificationMethodId
        }
      );

      const result = await Axios({
        method: 'post',
        url: SUPERHERO_HS_AUTH_BASE_URL + 'share',
        data: {
          vp: vp_signed
        }
      });

      console.log(result.data.record);
      const id = result.data.record._id;
      this.loading = false;
      if (this.verifiableCredential.credentialSchema.id === BUSINESSCARD_SCHEMA) {
        console.log(this.verifiableCredential.credentialSchema.id)
        console.log('in bussiness card')
        return this.$router.push({ name: 'sharedCredential', params: { vp: id } });
      }
      if(this.verifiableCredential.credentialSchema.id === CERTIFICATECARD_SCHEMA){
        console.log(this.verifiableCredential.credentialSchema.id)
        console.log('in certificate card')
// Create a div element and set its inner HTML
var div = document.createElement('div');
div.style.width = '337px';
div.style.height = '450px';
div.innerHTML = `<div class="cred-card-body" style="padding: 12px; color: rgb(80, 54, 101); font-size: small;">
  <div class="container" align="center">
    <table class="cert" style="border: 5px solid #b2bbc1; border-right: 5px solid #b2bbc1; border-left: 5px solid #b2bbc1; width: 100%; font-family: arial; color: rgb(80, 54, 101);">
      <tr>
        <td align="center" class="crt_logo">
        <img src="${logoImage}" style="margin-top:5px;" width="30px" height="30px" alt="logo">

        </td>
      </tr>
      <tr>
        <td align="center">      
          <h1 class="crt_title" style="margin-top: 5px; letter-spacing: 1px; color: rgb(80, 54, 101) !important;">HID</h1>
          <h2 style="font-size: larger; color: rgb(80, 54, 101);">CERTIFICATE</h2>
          <p style="margin-bottom: 0;">This Certificate is awarded to</p>
          <h1 class="crt_user" style="font-family: 'Satisfy', cursive; font-size: 40px; margin-top: 0; margin-bottom: 0;">${this.verifiableCredential.credentialSubject.candidateName}</h1>
          <h3 class="afterName" style="font-weight: 100; color: rgb(80, 54, 101); margin-top: 0; margin-bottom: 0;">For participating in ${this.credDetials.formattedSchemaName}<br> organized by <br> ${this.verifiableCredential.credentialSubject.issuerName}</h3>
          <h3 style="margin-bottom: 0;">Awarded as ${this.verifiableCredential.credentialSubject.award}</h3>
          <div style="display: flex;">
          <div style="display: inline; text-align: center;">
            <h3 style="margin-right: auto;" class="ml-4">Organizer</h3>
            <span>${this.verifiableCredential.credentialSubject.issuerName}</span>
          </div>
          <div style="margin-left: auto; text-align: center;">
            <h3 class="mr-4">Date</h3>
            <span>${this.verifiableCredential.credentialSubject.issueDate}</span>
          </div>
        </div>
        </td>
        <tr>
      </tr>
      </tr>      
    </table>
  </div>
</div>`;

        // Append the div element to the document body
        document.body.appendChild(div);

        // Create a canvas element
        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);

        const getCanvas = await this.generateCertificate(div)
        console.log(getCanvas)
        document.body.removeChild(canvas);
        document.body.removeChild(div);
        this.imgS = getCanvas
        this.$store.commit('setImageData',getCanvas)
        const response = await Axios.get('http://localhost:4000/proxy');

        console.log(response.data)      
        return this.$router.push({ name: 'certificateCard', params: { vp: id } });
      }
      

    }
    ,
    async generateCertificate(element) {
      console.log(element)
  try {
    const canvas = await html2canvas(element);
    console.log(canvas)
    // Convert canvas to PNG image data
    const imageData = canvas.toDataURL();       
    return imageData
  } catch (error) {
    console.error('Error generating certificate:', error);
  }
},
    toUpper(t) {
      if (t)
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

.scan-text {
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
  text-transform: capitalize;
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

  p>svg {
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