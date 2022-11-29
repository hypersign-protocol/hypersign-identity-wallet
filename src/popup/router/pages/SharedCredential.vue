<template>
    <div class="popup">
        <div class="">
            <div class="cred-card">
                <div class="cred-card-header">
                    <span>{{ credDetials.formattedSchemaName }}</span>
                </div>
                <div class="cred-card-body">
                    <span class="cred-card-body-detail">SCHEMA ID: {{ credDetials.schemaId }}</span><br />
                    <span class="cred-card-body-detail">ISSUER ID: {{ credDetials.formattedIssuer }}</span><br />
                    <span class="cred-card-body-detail">ISSUED ON: {{ credDetials.formattedIssuanceDate }}</span><br />
                </div>
            </div>
            <br>

            <div v-if="qrdata != ''">
                <div class="copied-alert" v-if="copied">{{ $t('pages.account.copied') }}</div>


                <code class="copyicon" @click="copy">{{ short_link }}</code>
                <CopyIcon class="copyicon" slot="icon" @click="copy"></CopyIcon>
                <div if="showQr">
                    <VueQr v-if="qrdata != ''" :text="qrdata" :size="250" :logoSrc="logo" logoBackgroundColor="white">
                    </VueQr>


                </div>
                <!-- <Button @click="verify()" >Verify</Button> -->
                <Button @click="saveAs()">Save Contact</Button>

            </div>
            <ul class="list-group">
                <li class="list-group-item" v-for="claim in claims" :key="claim">
                    <div class="list-title">{{ toUpper(claim) }}: </div>
                    <div>{{ verifiableCredential.credentialSubject[claim] }}</div>
                </li>
            </ul>
            <Loader v-if="loading" />
        </div>


    </div>
</template>
<script>
const HypersignSSISdk = require('hs-ssi-sdk');
const vCardsJS = require('vcards-js');

import { mapGetters, mapState } from 'vuex';
import QrIcon from '../../../icons/qr-code.svg?vue-component';
import VueQr from "vue-qr";

import { toFormattedDate, toStringShorner } from '../../utils/helper';
import { getSchemaIdFromSchemaUrl } from '../../utils/hypersign';
import hidWalletInstance from '../../utils/hidWallet';
import { WALLET_URL } from '../../utils/hsConstants'
import CopyIcon from '../../../icons/copy.svg?vue-component';

export default {
    components: { QrIcon, VueQr, CopyIcon },
    data() {
        return {
            verifiableCredential: {},
            copied: false,
            claims: [],
            loading: false,
            qrdata: '',
            link: "",
            short_link: "",
            logo: require("../../../icons/hypersign-icon.png"),
            showQr: false,
            vp: {},
            vcf: {},
            credDetials: {
                formattedIssuer: "",
                formattedExpirationDate: "",
                formattedIssuanceDate: "",
                formattedSchemaName: "",
                schemaId: ""
            }
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
            this.credDetials.formattedExpirationDate = toFormattedDate(this.verifiableCredential.expirationDate);
            this.credDetials.formattedIssuanceDate = toFormattedDate(this.verifiableCredential.issuanceDate);
            this.credDetials.formattedIssuer = toStringShorner(this.verifiableCredential.issuer, 32, 15);
            this.credDetials.formattedSchemaName = this.verifiableCredential.type[1]; //toStringShorner(this.verifiableCredential.type[1], 26, 15);
            const credentialSchemaUrl = this.verifiableCredential['@context'][1].hs;
            this.credDetials.schemaId = toStringShorner(getSchemaIdFromSchemaUrl(credentialSchemaUrl).trim(), 32, 15);
            this.claims = Object.keys(this.verifiableCredential.credentialSubject);
        }
        const credSub = this.vp.verifiableCredential[0].credentialSubject
        // console.log("credSub", credSub);
        const arr = Object.keys(credSub).map((key) => [key, credSub[key]]);
        var vcard = vCardsJS();
        arr.forEach(element => {
            switch (element[0]) {
                case "socialUrls":
                    vcard.socialUrls['custom'] = element[1]
                    break;
                case "photo":
                    vcard.photo.attachFromUrl(element[1], 'JPEG');
                    break;
                default:
                    vcard[element[0]] = element[1]
                    break;
            }
        });



        this.vcf = vcard.getFormattedString()
        this.qrdata = this.vcf
        this.showQr = true
        // console.log("vcf", this.vcf);

        this.link = WALLET_URL + "sharedcredential/" + Buffer.from(JSON.stringify(this.vp), 'utf-8').toString('base64')
        this.short_link = toStringShorner(this.link, 32, 15)


    },

    methods: {
        saveAs() {
            const blob = new Blob([this.vcf], { type: "text/plain;charset=utf-8" });
            const link = document.createElement("a");
            link.href = window.webkitURL.createObjectURL(blob);
            link.download = "contact.vcf";
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