<template>
  <div class="popup">
    <div class="box" :class="{ overlayBackground: showMenu }">
      <div class="cred-card">
        <div class="cred-card-body">
          <span class="fullName">
            Vishwas Anand
          </span><br />
          <span class="fullTitle">
            VP of Engineering @ Hypermine
          </span><br />
          <span class="fullTitle">
            www.hypersign.id
          </span><br />
        </div>
        
        <div class="avatar">
          <div class="img">
            <img src="https://avatars.githubusercontent.com/u/15328561?v=4" alt="">
          </div>          
        </div>

        <div class="cred-card-body" style="    margin-top: 10%;">
          <span class="sub-sub-heading">
            vishwas@hypermine.in
          </span><br />
          <span class="sub-sub-heading"> 
            did:hid:testnet:zA9qEAQ438awyBHV69hCFnTivrZ
          </span><br />
        </div>
      </div>
    
      <div class="submenu-bg">
        <div class="box-club">
          <BoxButton text="Twitter" to="/" class="tour__step9">
            <TwitterIcon width="30" height="30" slot="icon" />
          </BoxButton>
          <BoxButton text="Telegram" to="/">
            <TelegramIcon width="30" height="30" slot="icon" />
          </BoxButton>
          <span @click="saveAs()">
            <BoxButton text="Save Contact" class="tour__step10">
              <PhoneIcon width="30" height="30" slot="icon" color="white" />
            </BoxButton>
          </span>
          <BoxButton text="Discord" to="/" class="tour__step9">
            <DiscordIcon width="30" height="30" slot="icon" />
          </BoxButton>
          <BoxButton text="LinkedIn" to="/">
            <LinkedInIcon width="30" height="30" slot="icon" />
          </BoxButton>
          <BoxButton text="Facebook" to="/" class="tour__step10">
            <FacebookIcon width="30" height="30" slot="icon" color="white" />
          </BoxButton>
        </div>
        <Button @click="share()">Share Via QR/Link</Button>
      </div>
    
      <!-- <ul class="list-group">
                <li class="list-group-item" v-for="claim in claims" :key="claim">
                    <div class="list-title">{{ toUpper(claim) }}: </div>
                    <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
                </li>
           </ul> -->
      <Loader v-if="loading" />
    </div>

    <div class="box overlay" v-if="showMenu">
        <SmallModal  @close="showMenu = false">
        <div v-if="qrdata != ''" class="qrPopup">
            <div if="showQr">
              <VueQr
                  v-if="qrdata != ''"
                  :text="qrdata"
                  :size="250"
                  :logoSrc="logo"
                  logoBackgroundColor="white"
              >
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
</template>
<script>
const HypersignSSISdk = require('hs-ssi-sdk');
const vCardsJS = require('vcards-js');
import BoxButton from '../components/BoxButton';
import TwitterIcon from '../../../icons/twitter-svgrepo-com.svg?vue-component';
import TelegramIcon from '../../../icons/telegram-svgrepo-com.svg?vue-component';
import PhoneIcon from '../../../icons/telephone-call-svgrepo-com.svg?vue-component';

import DiscordIcon from '../../../icons/discord-svgrepo-com.svg?vue-component';
import LinkedInIcon from '../../../icons/linkedin-svgrepo-com.svg?vue-component';
import FacebookIcon from '../../../icons/facebook-svgrepo-com.svg?vue-component';

import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VueQr from 'vue-qr';

import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import hidWalletInstance from '../../utils/hidWallet';
import { WALLET_URL } from '../../utils/hsConstants';
import CopyIcon from '../../../icons/copy.svg?vue-component';

import SmallModal from '../components/SmallModal.vue';

export default {
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
      credDetials: {
        formattedIssuer: '',
        formattedExpirationDate: '',
        formattedIssuanceDate: '',
        formattedSchemaName: '',
        schemaId: '',
      },
    };
  },
  created() {
    try {
      this.vp = JSON.parse(this.$route.params.vp);
    } catch (error) {
      this.vp = JSON.parse(Buffer.from(this.$route.params.vp, 'base64').toString('utf8'));
    }
    // console.log(this.vp);

    //   console.log("credentialId", credentialId);

    if (this.vp) {
      this.verifiableCredential = this.vp.verifiableCredential[0];
      this.credDetials.formattedExpirationDate = toFormattedDate(
        this.verifiableCredential.expirationDate,
      );
      this.credDetials.formattedIssuanceDate = toFormattedDate(
        this.verifiableCredential.issuanceDate,
      );
      this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
      this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
      const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
      this.credDetials.schemaId = toStringShorner(
        getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim(),
        32,
        15,
      );
      this.claims = Object.keys(this.verifiableCredential.credentialSubject);
    }
    const credSub = this.vp.verifiableCredential[0].credentialSubject;
    // console.log("credSub", credSub);
    const arr = Object.keys(credSub).map(key => [key, credSub[key]]);
    var vcard = vCardsJS();
    arr.forEach(element => {
      switch (element[0]) {
        case 'socialUrls':
          vcard.socialUrls['custom'] = element[1];
          break;
        case 'photo':
          vcard.photo.attachFromUrl(element[1], 'JPEG');
          break;
        default:
          vcard[element[0]] = element[1];
          break;
      }
    });

    this.vcf = vcard.getFormattedString();
    this.qrdata = this.vcf;
    this.showQr = true;
    // console.log("vcf", this.vcf);

    this.link =
      WALLET_URL +
      'sharedcredential/' +
      Buffer.from(JSON.stringify(this.vp), 'utf-8').toString('base64');
    this.short_link = toStringShorner(this.link, 20, 15);
  },

  methods: {
    share() {
      console.log('Clicked...');
      this.showMenu = true;
    },
    saveAs() {
      const blob = new Blob([this.vcf], { type: 'text/plain;charset=utf-8' });
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
  },
};
</script>


<style lang="scss" scoped>
@import '../../../common/variables';

.button-text{
  font-size: 10px;
}
.submenu-bg {
  background: $submenu-bg;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 5%;
}


.qrPopup{
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

      .overlayBackground{
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
        margin-left: 15%;
      }

.box-club {
  padding: 1px;
  border: 1px solid #80808052;
  width: 100%;
  border-radius: 5px;
  margin-top: 1%;
}
.cred-card-body {
  padding: 12px;
    color: lightgrey;
    font-size: small;
}


.fullName{
  color: whitesmoke;
    font-size: larger;
    font-weight: 600;
}
.scan-text {
  margin-left: 20px;
  margin-bottom: 2px;
  // float: right;
}

.copyicon,
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
  background: #33343e !important;
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
  background-color: #bfc2c7;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 6px solid var(--dark);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.img img {
  width: 80%;
  padding: 10px 0;
}

</style>



