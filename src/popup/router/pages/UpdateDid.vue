
<template>
    <div class="popup">
      <div>
        <div class="">
          <div class="appInfo">
            <p>This organisation <span style="font-style:oblique">{{hypersign.requestingAppInfo.appName}}</span>
            is requesting to sign the following</p>
            <textarea>{{ JSON.stringify(this.didRaw,null,2) }}</textarea>
          </div>
        </div>
        <div class="scanner d-flex">
          <Button class="scan"  data-cy="scan-button" @click="signAndSendToBlockchain()">
            <VerifiedIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.authorize') }}</span>
          </Button>
        </div>
        <div class="scanner d-flex">
          <Button class="scan"  data-cy="scan-button" @click="reject()">
            <CloseIcon width="20" height="20" class="scan-icon"/><span class="scan-text">{{ $t('pages.credential.decline') }}</span>
          </Button>
        </div>
      </div>
      <Loader v-if="loading" />    
    </div>
  </template>
  <style>
   textarea{        
          overflow-y: scroll;
          height: 40vh;
          width: 100%;
          resize: none;
      }</style>
  
  <script>
  import { mapGetters, mapState } from 'vuex';
  import hidWalletInstance from '../../utils/hidWallet';
  const HypersignSSISdk = require('hs-ssi-sdk');
  import { HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE  } from '../../utils/hsConstants';
  import QrIcon from '../../../icons/qr-code.svg?vue-component';
  import VerifiedIcon from '../../../icons/badges/verified.svg?vue-component';
  import CloseIcon from '../../../icons/badges/not-verified.svg?vue-component';
  import axios from 'axios';
  
  export default {
  
      name: 'IssueSchema',
      computed: {
          ...mapGetters(['hypersign']),
          ...mapState(['mnemonic'])
      },
      components: { QrIcon,CloseIcon,VerifiedIcon },
      beforeDestroy() {
          this.reject()
      },
      data() {
          return {
              hsSDK: null,
              loading:  false,
              didRaw: '',
                updatedDid: ''
          }
      },
      async created(){
          // get the schemadata to sign from route
          /*
  
  {
    QRType: 'ISSUE_DID',
    serviceEndpoint: 'https://stage.hypermine.in/studioserver/api/v1/org/status/6311dfe821773d0fa79ba0f7',
    schemaId: '',
    appDid: '',
    appName: 'Hypersign Studio',
    challenge: '',
    provider: '',
    data: {
      serviceEndpoint: "https://stage.hypermine.in/studioserver/api/v1/org/"
      controllers : ['did:hs:zERsQiJV5PCDaLqr7WLtpjJSCx5Euq4xJB7MLQmcKzrqy'],
      alsoKnownAs: 'hypermine.in',
    }
  }
  */        
          this.didRaw = this.hypersign.requestingAppInfo.data;
          await hidWalletInstance.generateWallet(this.mnemonic);
          this.hsSDK = new HypersignSSISdk(hidWalletInstance.offlineSigner, HIDNODE_RPC, HIDNODE_REST, HIDNODE_NAMESPACE);
          await this.hsSDK.init();
          
            this.updatedDid=await this.hsSDK.did.resolve({did: this.didRaw.orgDid})
            // await this.signAndSendToBlockchain();
      },
      methods: {
          async reject () {
              this.$store.commit('clearRequestingAppInfo');
              this.$router.push('/account');
          },
         
          async signAndSendToBlockchain(){
              try{
                  this.loading = true;
                  
                  // Generating dummy key
                   this.updatedDid.didDocument.controller=this.didRaw.controllers;
                    let verificationMethod=[]
                    let authentication=[]
                    let assertionMethod=[]
                    let keyAgreement=[]
                    let capabilityInvocation=[]
                    let capabilityDelegation=[]

                    for(let i=0;i<this.didRaw.controllers.length;i++){
                      const { didDocument } = await this.hsSDK.did.resolve({did: this.didRaw.controllers[i]})
                      verificationMethod.push(didDocument.verificationMethod[0])
                      authentication.push(didDocument.authentication[0])
                      assertionMethod.push(didDocument.assertionMethod[0])
                      keyAgreement.push(didDocument.keyAgreement[0])
                      capabilityInvocation.push(didDocument.capabilityInvocation[0])
                      capabilityDelegation.push(didDocument.capabilityDelegation[0])

                    }
                    // this.updatedDid.didDocument.verificationMethod=verificationMethod
                    this.updatedDid.didDocument.authentication=authentication
                    this.updatedDid.didDocument.assertionMethod=assertionMethod
                    this.updatedDid.didDocument.keyAgreement=keyAgreement
                    this.updatedDid.didDocument.capabilityInvocation=capabilityInvocation
                    this.updatedDid.didDocument.capabilityDelegation=capabilityDelegation

                    const versionId=this.updatedDid.didDocumentMetadata.versionId;
                  const verificationMethodId = this.hypersign.didDoc.verificationMethod[0].id;
                  
                  const result = await this.hsSDK.did.update({  didDocument:  this.updatedDid.didDocument, privateKeyMultibase: this.hypersign.keys.privateKeyMultibase, verificationMethodId,versionId })
  
                  
                  if(!result){
                      throw new Error("Could not Update the did");
                  }
  
                  if (result) {
                      this.$store.dispatch('modals/open', { name: 'default', msg: 'Successfully DID Updated' });
                      /// call the sutatus API of the studio/dappp server to for updating the status in db.
                      const { serviceEndpoint } = this.hypersign.requestingAppInfo;
                      if(serviceEndpoint){
                          try{
                              const body = {
                                  transactionHash: result.transactionHash,
                                  orgDid: this.updatedDid.didDocument.id,
                              }
                              axios.post(serviceEndpoint, body).then(response => {
                                  if(response && response.status === 200){
                                      console.log('Successfully sent result to webhook')
                                  } else {
                                      console.log("Could not sent result to webhook")
                                  }
                              }).catch(e => {
                                  console.error(e)    
                              })
                              
                          }catch(e){
                              console.error(e)
                              this.loading = false;
                          }
                          
                      }else{
                          console.log('No serviceEndpoint available.')
                      }
                  }
              }catch(e){
                  // console.log(e)
                  this.$store.dispatch('modals/open', { name: 'default', msg: e.message });
              } finally {
                  this.loading = false;
                  this.reject();
              }
          }
      }
  
  }
  
  </script>