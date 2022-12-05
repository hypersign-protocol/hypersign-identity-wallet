<template>
  <div class="button-container">
    <RouterLink :to="to" class="button-content" :class="{ disabled }" v-if="to">
      <slot name="icon" />
      <span class="button-text" :class="accent ? 'button-text-accent' : ''">{{ text }}</span>
    </RouterLink>
    <a class="button-content"  :class="{ disabled }" v-else>
      <slot name="icon" />
      <span class="button-text" :class="accent ? 'button-text-accent' : ''">{{ text }}</span>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    to: [String, Object],
    accent: Boolean,
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
};
</script>
<style lang="scss">
@import '../../../common/variables';

.button-container {
  width: 32%;
  display: inline-block;
  padding: 10px;

  .button-content {
    text-align: center;
    background: $box-button-color;
    border-radius: 5px;
    padding: 15px 10px;
    border: 1px solid transparent;
    display: block;
    color: inherit;
    text-decoration: none;

    &:hover {
      background-color: $secondary-color;
      cursor: pointer;
    }

    &:hover .button-text {
      color: $white-color !important;
    }

    .button-text {
      font-size: 10px;
      display: block;
      font-weight: bold;
      margin-top: 5px;
      line-height: 20px;

      &.button-text-accent {
        color: $accent-color;
      }
    }

    &.disabled {
      pointer-events: all;
      opacity: 0.3;
    }
  }
}
</style>
