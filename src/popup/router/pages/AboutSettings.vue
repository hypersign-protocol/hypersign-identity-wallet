<template>
  <div class="popup">
    <img src="../../../icons/hypersign-logo.png" class="logo" />
    <p style="color:#3e3e3e">
      {{ $t('pages.aboutSettings.systemName') }}
      <span class="version">
        <a
          @click="
            openUrl(
              `https://github.com/hypersign-protocol/hypersign-identity-wallet/commit/${commitHash}`,
              true,
            )
          "
        >
          {{ commitHash.slice(0, 7) }}</a
        ><!--eslint-disable-line vue-i18n/no-raw-text-->
        / {{ extensionVersion }}
      </span>
    </p>
    <hr />
    <div class="waellet-links">
      <router-link to="/termsOfService" data-cy="terms">{{
        $t('pages.aboutSettings.terms')
      }}</router-link>
      <router-link to="/privacyPolicy" data-cy="privacy">{{
        $t('pages.aboutSettings.privacyPolicy')
      }}</router-link>
      <!-- <Button @click="openUrl(bugReportUrl, true)">
        {{ $t('pages.appVUE.reportBug') }}
      </Button> -->
    </div>
  </div>
</template>

<script>
import openUrl from '../../utils/openUrl';
import { BUG_REPORT_URL } from '../../utils/constants';

export default {
  components: {},
  data() {
    return {
      extensionVersion: `v.${process.env.npm_package_version}`,
      commitHash: process.env.COMMIT_HASH,
      bugReportUrl: BUG_REPORT_URL,
      openUrl,
    };
  },
};
</script>

<style lang="scss" scoped>
.version {
  color: #909090;
}

.waellet-links a {
  font-weight: bold;
  display: block;
}
</style>
