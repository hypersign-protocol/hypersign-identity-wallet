<template>
  <div class="popup">
    <div class="mt-10"> 
      
      <Input
        label="DID"
        :value="profile.did"
        disabled
       />
      <Input
        placeholder="Enter name"
        label="Name"
        v-model="profile.name"
        :disabled="ifAllDisabled"
      />
      <Input
        placeholder="Enter email id"
        label="Email Id"
        v-model="profile.email"
        :disabled="ifAllDisabled"
      />
      
      <Button half :to="{ name: 'account' }">
        {{ $t('pages.tipPage.cancel') }}
      </Button>

      <Button half @click="setupProfileNow"
      :disabled="!profile.name || !profile.did ||  !profile.email"
      v-if ="ifCreate"
      >
        {{ $t('pages.tipPage.confirm') }}
      </Button>

      <Button half @click="edit" v-if="ifEdit" >
        Edit
      </Button>
      
      <Loader v-if="loading" />
    </div>
  </div>
</template>

<script>
import Input from '../components/Input';
import registration from '../../../mixins/registration';

export default {
  mixins: [registration],
  components: { Input },
  data: () => ({
    loading:  false
  }),
  methods: {
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
        this.loading = false
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
    color: lightgray;
    font-size: 20px;
    letter-spacing: -0.2px;
}
</style>
