<template>
  <div class="popup">
    <NameListHeader />
    <ul v-if="owned.length" class="names-list">
      <NameRow
        v-for="({ name, owner, pending, revoked, autoExtend }, index) in owned"
        :key="index"
        :to="{ name: 'name-details', params: { name } }"
        :name="name"
        :address="owner"
      >
        <span class="name"> {{ name }} </span>
        <Badge v-if="activeAccountName == name" class="active-name">
          {{ $t('pages.names.default') }}
        </Badge>
        <Badge v-if="pending" class="pending-name">
          {{ $t('pages.names.pending-claim') }}
        </Badge>
        <Badge v-if="revoked" class="revoked-name">
          {{ $t('pages.names.revoked') }}
        </Badge>
        <span class="address">{{ owner }}</span>
        <CheckBox
          :value="autoExtend"
          @input="value => $store.commit('names/setAutoExtend', { index, value })"
        >
          {{ $t('pages.names.auto-extend') }}
        </CheckBox>
      </NameRow>
    </ul>
    <p v-else>{{ $t('pages.names.list.no-names') }}</p>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import NameListHeader from '../../components/NameListHeader';
import Badge from '../../components/Badge';
import NameRow from '../../components/NameRow';
import CheckBox from '../../components/CheckBox';

export default {
  components: { NameListHeader, Badge, NameRow, CheckBox },
  computed: {
    ...mapGetters(['activeAccountName']),
    ...mapState('names', ['owned']),
  },
  created() {
    this.$store.dispatch('names/fetchOwned');
    const id = setInterval(() => this.$store.dispatch('names/fetchOwned'), 10000);
    this.$once('hook:destroyed', () => clearInterval(id));
  },
};
</script>

<style scoped>
.names-list {
  padding: 0 !important;
}
</style>
