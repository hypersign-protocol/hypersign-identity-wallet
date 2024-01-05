<!--eslint-disable vue-i18n/no-raw-text-->
<template>
  <Modal @close="resolve" close>
    <div slot="body">
      <img src="../../../../icons/check-icon.svg" /> <br />
      <b>{{ $t('pages.claim.url') }}:</b> {{ url }} <br />
      <b>{{ $t('pages.claim.tipsOnUrl') }}:</b> {{ claimAmount }} {{ $t('pages.claim.ae') }} <br />
      <span style="color: #2a9cff;">{{ $t('pages.claim.claimed') }}</span>
    </div>
    <div slot="footer">
      <Button @click="resolve">{{ $t('ok') }}</Button>
    </div>
  </Modal>
</template>

<script>
import Modal from '../Modal';
import Button from '../Button';

export default {
  props: {
    resolve: { type: Function, required: true },
    url: { type: String, required: true },
    claimAmount: { type: Number, required: true },
  },
  components: { Modal, Button },
};
</script>
