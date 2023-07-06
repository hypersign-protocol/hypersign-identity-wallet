<template>
  <div class="popup">
    <div class="box" :class="{ overlayBackground: showMenu }">      
      <img :src="certificateImage" alt="" srcset="">      
      <!-- <div class="cred-card">
        
                  <div class="cred-card-body">
                  <div class="container" align="center">    
              <table class="cert">
              <tr>
                <td align="center" class="crt_logo">
                <img src="../../../icons/hypersign.jpg" alt="logo">

                </td>
              </tr>
              <tr>
                <td align="center">
                <h1 class="crt_title">{{credDetials.formattedSchemaName}}</h1>
                <h2>CERTIFICATE</h2>
                  <p>This Certificate is awarded to</p>
                  <h1 class="crt_user">{{vcard.candidateName}}</h1>
                  <h3 class="afterName">For participating in {{credDetials.formattedSchemaName}}<br> organized by <br> Hypersign.ID
                  </h3>
                  <h3>Awarded as {{vcard.award}} winner </h3>
                </td>
              </tr>
          <tr>
            <div style="display: flex;">
              <div style="display: inline;" class="text-center">
                <h3 style="margin-right: auto; margin-bottom: 0;" class="ml-4">Organizer</h3>
                <span>{{vcard.issuerName}}</span>
              </div>              
              <div style="margin-left: auto;" class="text-center">
                <h3 style="margin-bottom: 0;" class="mr-4">Date</h3>
                <span>{{vcard.issueDate}}</span>
              </div>
            </div>
          </tr>

          </table>      
            </div>
            </div>
      </div> -->

      <!-- <div class="submenu-bg">
        <div class="box-club">
          <span @click="shareOnTwitter">
            <BoxButton text="Twitter" class="tour__step9">
              <TwitterIcon width="30" height="30" slot="icon" />
            </BoxButton>
          </span>
          <span @click="shareOnLinkedIn">
            <BoxButton text="LinkedIn">
              <LinkedInIcon width="30" height="30" slot="icon" />
            </BoxButton>
          </span>
          <span @click="shareOnFaceBook">
            <BoxButton text="Facebook" class="tour__step10">
              <FacebookIcon width="30" height="30" slot="icon" color="white" />
            </BoxButton>
          </span>
        </div>
        <img :src="imgS" alt="" srcset="">
        <Button @click="share()">Share Via QR/Link</Button>
      </div> -->

      <!-- <ul class="list-group">
                <li class="list-group-item" v-for="claim in claims" :key="claim">
                    <div class="list-title">{{ toUpper(claim) }}: </div>
                    <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
                </li>
           </ul> -->
      <Loader v-if="loading" />
    </div>

    <div class="box overlay" v-if="showMenu">
      <SmallModal @close="showMenu = false">
        <div v-if="qrdata != ''" class="qrPopup">
          <div v-if="showQr">
            <VueQr v-if="qrdata != ''" :text="qrdata" :size="250" :logoSrc="logo" logoBackgroundColor="white">
            </VueQr>
          </div>
          <div>
            <div class="copied-alert" v-if="copied">{{ $t('pages.account.copied') }}</div>
            <code class="copyicon" @click="copy">{{ short_link }}</code>
            <CopyIcon class="copyicon" slot="icon" @click="copy"></CopyIcon>
          </div>
        </div>
      </SmallModal>
    </div>

  </div>
</template>ping when you are availabe 
irfan wants to discuss
<script>

const HypersignSSISdk = require('hs-ssi-sdk');
import BoxButton from '../components/BoxButton';
import TwitterIcon from '../../../icons/twitter-svgrepo-com.svg?vue-component';
import TelegramIcon from '../../../icons/telegram-svgrepo-com.svg?vue-component';
import PhoneIcon from '../../../icons/telephone-call-svgrepo-com.svg?vue-component';
import html2canvas from 'html2canvas';
import DiscordIcon from '../../../icons/discord-svgrepo-com.svg?vue-component';
import LinkedInIcon from '../../../icons/linkedin-svgrepo-com.svg?vue-component';
import FacebookIcon from '../../../icons/facebook-svgrepo-com.svg?vue-component';
import {mapState} from "vuex"
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VueQr from 'vue-qr';

import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import CopyIcon from '../../../icons/copy.svg?vue-component';

import SmallModal from '../components/SmallModal.vue';

import { WALLET_URL, SUPERHERO_HS_AUTH_BASE_URL } from '../../utils/hsConstants'
import Axios from 'axios';
import { EventBus } from '../../utils/eventBus';

export default {
  name:"certificateCard",
  components: {
    SmallModal,    
    QrIcon,
    VueQr,
    CopyIcon,
    BoxButton,
    TwitterIcon,
    TelegramIcon,
    PhoneIcon,
    DiscordIcon,
    LinkedInIcon,
    FacebookIcon,
  },
  computed: {    
    ...mapState(['certificateImage'])
  },
  data() {
    return {
      showMenu: false,
      verifiableCredential: {},
      copied: false,
      claims: [],
      loading: false,
      qrdata: '',
      link: '',
      short_link: '',
      logo: require('../../../icons/hypersign-icon.png'),
      showQr: false,
      vp: {},
      vcf: {},
      vcard: {},
      credDetials: {
        formattedIssuer: '',
        formattedExpirationDate: '',
        formattedIssuanceDate: '',
        formattedSchemaName: '',
        schemaId: '',
      },
      imageData:'',
      imageUrl:'https://s3.amazonaws.com/coursera_assets/meta_images/generated/CERTIFICATE_LANDING_PAGE/CERTIFICATE_LANDING_PAGE~NLH98ZU78CVZ/CERTIFICATE_LANDING_PAGE~NLH98ZU78CVZ.jpeg',
      certificatePageUrl:'https://www.coursera.org/account/accomplishments/verify/NLH98ZU78CVZ?utm_source=link&utm_medium=certificate&utm_content=cert_image&utm_campaign=sharing_cta&utm_product=course',
      imgS:''
    };
  },
 
  async created() {    
    try {
      this.loading = true;
      this.vp = this.$route.params.vp;
      
      const fetcedVp = await Axios.get(SUPERHERO_HS_AUTH_BASE_URL + 'shared/vp/' + this.vp);
      console.log(fetcedVp)
      this.vp = fetcedVp.data.vp
      this.sortUrl = fetcedVp.data._id
    } catch (error) {

      this.vp = JSON.parse(Buffer.from(this.$route.params.vp, 'base64').toString('utf8'));
      this.loading = false;
      this.$router.push({ name: 'account' });
      return
    }

    //   console.log("credentialId", credentialId);

    if (this.vp) {
      this.verifiableCredential = this.vp.verifiableCredential[0];
      this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate);
      this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate);
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      this.credDetials.schemaId = toStringShorner(getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim(), 32, 15);
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
    // console.log(this.vcard)
    const credSub = this.vp.verifiableCredential[0].credentialSubject
    console.log("credSub", credSub);
    this.vcard = credSub
    console.log(this.vcard)    
    this.loading = false;

    this.link = WALLET_URL + "certificateCard/" + this.sortUrl
    this.qrdata = this.link    
    this.showQr = true


    this.short_link = toStringShorner(this.link, 32, 10)
    this.vcard.id = toStringShorner(this.vcard.id, 32, 15)

  },

  methods: {
    
//     async generateCertificate(element) {
//   try {
//     const canvas = await html2canvas(element);
//     console.log()
//     // Convert canvas to PNG image data
//     let imageData = canvas.toDataURL('image/png');
//     console.log(imageData)
//     // Create a temporary link element to download the PNG certificate
//     const link = document.createElement('a');
//     link.href = imageData;
//     link.download = 'certificate.png';
//     link.click();

//     console.log(imageData);
//     return imageData
//   } catch (error) {
//     console.error('Error generating certificate:', error);
//   }
// },
  // async shareOnLinkedIn() {
  //     // const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.certificatePageUrl)}&image=${encodeURIComponent(this.imageUrl)}`;
  //     // window.open(linkedInShareUrl, 'width=550,height=450');
  //     const element = document.querySelector('.cred-card-body');
  //     element.style.backgroundColor = 'white';
  //     const getCanvas = await this.generateCertificate(element)
  //     console.log(getCanvas)
  //     this.imgS = getCanvas
  //     // return
  //     // const apiKey = '6d207e02198a847aa98d0a2a901485a5';        

  //     //   const base64Data = getCanvas.replace(/^data:image\/(png|jpeg);base64,/, '');
  //     //   console.log(base64Data)
  //     //   const blob = this.b64toBlob(base64Data, 'image/png'); // Modify the MIME type if necessary
  //     //   console.log(blob)

  //     //   const formData = new FormData();
  //     //   formData.append('key', apiKey);
  //     //   formData.append('action', 'upload');
  //     //   formData.append('source', blob);

  //     //   try {
  //     //     // const response = await fetch(apiUrl, {
  //     //     //   method: 'GET',
  //     //     //   body: getCanvas,
  //     //     // });
  //     //     const apiUrl = `http://freeimage.host/api/1/upload/?key=${apiKey}&source=${getCanvas}&format=json`;
  //     //     const response = await fetch(apiUrl)
  //     //     console.log(response)
  //     //     const result = await response.json();
  //     //     console.log(result)
  //     //     if (result.success) {
  //     //       const imageUrl = result.image.url;
  //     //       console.log('Image uploaded:', imageUrl);
  //     //       return imageUrl;
  //     //     } else {
  //     //       console.error('Image upload failed:', result.error);
  //     //     }
  //     //   } catch (error) {
  //     //     console.error('Error uploading image:', error);
  //     //   }
  //       const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://raw.githubusercontent.com/Raj6939/web3portfolio/master/src/assets/logo.png')}`;
  //     window.open(linkedInShareUrl, 'width=550,height=450');
  //   }
  //   ,
    b64toBlob(base64Data, contentType = '') {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}, 
    // shareOnTwitter(){
    //   const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.certificatePageUrl)}&text=${encodeURIComponent('HackDID1 certificate!')}&hashtags=${encodeURIComponent('hypersign,HackDID1,Hackathon,DID,SSI')}`;
    //   window.open(twitterShareUrl, 'width=550,height=450');
    // },
    // shareOnFaceBook(){
    //   const facebookShareUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(this.certificatePageUrl)}`;
    //   window.open(facebookShareUrl, 'width=550,height=450');
    // },
    share() {
      // console.log('Clicked...');
      this.showMenu = true;
    },
    iOS() {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',

      ].includes(navigator.platform)

        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document) && !window.MSStream



    },
    saveAs() {
      let blob = ''
      if (this.iOS() === true) {
        blob = new Blob([this.vcf], { type: "text/vcard;charset=utf-8" });
        // console.log("iOS:: Detected");

      } else {
        blob = new Blob([this.vcf], { type: "text/plain;charset=utf-8" });
        // console.log("Not IOS");


      }
      const link = document.createElement('a');
      link.href = window.webkitURL.createObjectURL(blob);
      link.download = 'contact.vcf';
      link.click();
      link.remove();
    },
    copy() {
      navigator.clipboard.writeText(this.link);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    },

    toUpper(t) {
      if (t) return t.toString().toUpperCase();
      else return t;
    },
  }
};
</script>


<style lang="scss" scoped>
@import '../../../common/variables';
///////////////////////////////////////

.cert {
  border: 5px solid #b2bbc1;
  border-right: 5px solid #b2bbc1;
  border-left: 5px solid #b2bbc1;
  width: 100%;
  font-family: arial;
  color: rgb(80, 54, 101);
}

.crt_title {
  margin-top: 10px;  
  letter-spacing: 1px;
  color: rgb(80, 54, 101) !important;
}
.crt_logo img {
  width: 30px;
  height: auto;
  margin: auto;
  padding-bottom: 0;
  padding-top: 10px;
  margin-bottom: 0;
}
.colorGreen {
  color: rgb(80, 54, 101);
}
.crt_user {       
  font-family: "Satisfy", cursive;  
  font-size: 40px;
  margin-bottom:0;
  margin-top: 0;
}

.afterName {
  font-weight: 100;
  color: rgb(80, 54, 101);
}
.colorGrey {
  color: rgb(80, 54, 101);
}
.certSign {
  width: 200px;
}

@media (max-width: 700px) {
  .cert {
    width: 100%;
  }
}

//////////////////////////////////////
.button-text {
  font-size: 10px;
}

.submenu-bg {
  background: $submenu-bg;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 5%;
}


.qrPopup {
  background: whitesmoke;
  padding-bottom: 18px;
  box-shadow: 5px 5px 5px 0px #80808087;
  border-radius: 2px;
}

.box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.overlayBackground {
  -webkit-filter: blur(5px);
  -moz-filter: blur(5px);
  -o-filter: blur(5px);
  -ms-filter: blur(5px);
  filter: blur(5px);
  background-color: #ccc;
}

.overlay {
  z-index: 9;
  margin-top: 50%;
  margin-left: 6.7%;
}

.box-club {
  padding: 1px;
  border: 1px solid #80808052;
  width: 100%;
  border-radius: 5px;
  margin-top: 1%;
  text-align: justify;
}

.cred-card-body {
  padding: 12px;
  color: rgb(80, 54, 101);
  font-size: small;
}


.fullName {
  color: rgb(80, 54, 101);
  font-size: larger;
  font-weight: 600;
}

.scan-text {
  margin-left: 20px;
  margin-bottom: 2px;
  // float: right;
}

.copyicon {
  color: #33343e;

  cursor: pointer;
}

.copied-alert {
  color: #21222a;
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
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 33, 87, 0.15);
  border-radius: 14px;
  margin-top: 7%;
  text-align: left;
  font-size: 13px;
  color: gray;  
}

.cred-card-header {
  color: rgb(80, 54, 101);

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

<style lang="scss" scoped>
.avatar {
  position: absolute;
  width: 33%;
  left: 80%;
  top: 64px;
  transform: translate(-50%);
  text-align: center;
}


.img {
  box-sizing: border-box;
  border-radius: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img img {
  width: 100%;
  object-fit: cover;
  border-radius: 50%;
}
</style>



