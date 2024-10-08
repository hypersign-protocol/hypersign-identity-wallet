<template>
  <div class="invite-row">
    <div class="invite-info">
      <span class="balance-display">
        {{ inviteLinkBalance }}
        <span>{{ $t('pages.appVUE.aeid') }}</span>
      </span>
      <!--eslint-disable vue-i18n/no-raw-text-->
      ({{ formatCurrency((inviteLinkBalance * currentCurrencyRate).toFixed(2)) }})
      <!--eslint-enable vue-i18n/no-raw-text-->
      <span class="date">{{ createdAt | formatDate }}</span>
    </div>
    <div class="invite-link">
      <span>{{ link }}</span>
      <button class="invite-link-copy" v-clipboard:copy="link">
        <img src="../../../icons/copy.svg" />
      </button>
    </div>
    <div class="centered-buttons" v-if="!topUp">
      <Button v-if="inviteLinkBalance > 0" bold @click="claim">{{
        $t('pages.invite.claim')
      }}</Button>
      <Button v-else bold dark @click="deleteItem">{{ $t('pages.invite.delete') }}</Button>
      <Button bold :disabled="balance < topUpAmount" @click="topUp = true">{{
        $t('pages.invite.top-up')
      }}</Button>
    </div>
    <template v-else>
      <AmountSend v-model="topUpAmount" :label="$t('pages.invite.top-up-with')" />
      <div class="centered-buttons">
        <Button bold dark @click="resetTopUpChanges">{{ $t('pages.invite.collapse') }}</Button>
        <Button bold :disabled="balance < topUpAmount" @click="sendTopUp">{{
          $t('pages.invite.top-up')
        }}</Button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { AmountFormatter, Crypto } from '@aeternity/aepp-sdk/es';
import AmountSend from './AmountSend';
import Button from './Button';
import { formatDate } from '../../utils';

export default {
  props: {
    secretKey: { type: String, required: true },
    createdAt: { type: Number, required: true },
  },
  components: { Button, AmountSend },
  filters: { formatDate },
  data: () => ({ topUp: false, topUpAmount: 0, inviteLinkBalance: 0 }),
  computed: {
    ...mapState(['sdk', 'balance']),
    ...mapGetters(['formatCurrency', 'currentCurrencyRate']),
    link() {
      const secretKey = Crypto.encodeBase58Check(Buffer.from(this.secretKey, 'hex'));
      return new URL(
        this.$router
          .resolve({ name: 'invite-claim', params: { secretKey } })
          .href.replace(/^#/, ''),
        'https://wallet.hypersign.com',
      );
    },
    address() {
      return Crypto.getAddressFromPriv(this.secretKey);
    },
  },
  watch: {
    secretKey: {
      async handler() {
        await this.updateBalance();
      },
      immediate: true,
    },
  },
  methods: {
    deleteItem() {
      this.$store.commit('invites/delete', this.secretKey);
    },
    async updateBalance() {
      await this.$watchUntilTruly(() => this.sdk);
      this.inviteLinkBalance = parseFloat(
        await this.sdk
          .balance(this.address, { format: AmountFormatter.AE_AMOUNT_FORMATS.AE })
          .catch(() => 0),
      ).toFixed(2);
    },
    async claim() {
      this.$emit('loading', true);
      try {
        await this.$store.dispatch('invites/claim', this.secretKey);
        await this.updateBalance();
      } catch (error) {
        if (await this.$store.dispatch('invites/handleNotEnoughFoundsError', error)) return;
        throw error;
      } finally {
        this.$emit('loading', false);
      }
    },
    resetTopUpChanges() {
      this.topUpAmount = 0;
      this.topUp = false;
    },
    async sendTopUp() {
      this.$emit('loading', true);
      try {
        if (this.topUpAmount > 0) {
          await this.sdk.spend(this.topUpAmount, this.address, {
            payload: 'referral',
            denomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
          });
          await this.updateBalance();
        }
      } catch (error) {
        if (await this.$store.dispatch('invites/handleNotEnoughFoundsError', error)) return;
        throw error;
      } finally {
        this.$emit('loading', false);
      }
      this.resetTopUpChanges();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.invite-row {
  padding: 1rem;
  width: 100%;
  border-bottom: 2px solid $black-1;
  text-align: left;
  color: $text-color;
  position: relative;

  .invite-link {
    margin-bottom: 5px;
    font-size: 11px;
    display: flex;

    span {
      margin-left: 5px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      color: $white-1;
    }
  }

  .invite-link-copy {
    padding: 0;
    color: $gray-2;
  }

  .invite-info {
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: $gray-2;

    .balance-display {
      color: $white-1;
      margin-right: 5px;

      span {
        color: $secondary-color;
      }
    }

    .date {
      font-size: 11px;
      margin-left: auto;
      color: $text-color;
    }
  }

  .amount-send-container {
    margin: 0;
  }

  .centered-buttons {
    display: flex;

    > .primary-button {
      margin-right: 20px;
      width: 120px !important;
    }
  }
}
</style>
