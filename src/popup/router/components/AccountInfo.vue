<template>
  <div class="account-info">
    <div class="title">
      <div class="account-name" data-cy="account-name">
        <UserAvatar :address="hypersign.did" :name="profile.name" class="avatar" size="small" />
        <template v-if="profile.name!=''">{{ profile.name }}</template>
        <router-link to="/profile" v-else>{{ $t('pages.account.claim-name') }} </router-link>
      </div>
      <div class="copied-alert" v-if="copied">{{ $t('pages.account.copied') }}</div>
      <!-- <button data-cy="copy" @click="copy" v-clipboard:copy="account.publicKey">
        {{ $t('pages.account.copy') }}
      </button> -->
      <button data-cy="copy" @click="copy" v-clipboard:copy="profile.did">
        {{ $t('pages.account.copy') }}
      </button>
    </div>
    <div class="ae-address">{{ profile.did }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import UserAvatar from './UserAvatar';

export default {
  components: { UserAvatar },
  data: () => ({
    copied: false,
    profile: {
      email: "",
      name: "",
      did: ""
    }
  }),
  computed: mapGetters(['hypersign']),
  async created() {
    if(Object.keys(this.hypersign.profile).length == 0)
    {
      this.profile.did  = this.hypersign.did
      
    }else{
      this.profile = { ...this.hypersign.profile }
    }
  },
  methods: {
    copy() {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.account-info {
  padding: 20px 20px 0 20px;
  text-align: left;

  .title {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    line-height: 21px;

    img {
      margin-right: 5px;
    }

    .account-name {
      font-weight: 400;
      color: $text-color;
      line-height: 21px;
      margin-right: auto;
      display: flex;
      align-items: center;
      justify-content: start;

      .avatar {
        margin-right: 10px;
      }
    }

    .help-icon {
      margin-left: 10px;
      margin-right: auto;
    }

    .copied-alert {
      color: $button-color;
      margin-right: 7px;
      margin-left: auto;
    }

    button {
      padding: 0;
    }
  }

  .ae-address {
    color: $text-color;
    font-size: 14px !important;
    letter-spacing: -0.3px !important;
  }
}
</style>
