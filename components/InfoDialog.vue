<template>
  <confirmation-dialog
    :show-dialog="showDialog"
    :title="title"
    :text="text"
    @on-dialog-confirmation="onClose"
    confirmation-btn-text="Close"
  >
    <slot name="body"></slot>
  </confirmation-dialog>
</template>

<script>
import ConfirmationDialog from '@/components/ConfirmationDialog'

export default {
  name: 'InfoDialog',

  components: {
    ConfirmationDialog
  },

  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    },
    text: {
      type: String,
      default: null
    }
  },

  methods: {
    onClose() {
      this.$emit('on-close')
    }
  }
}
</script>
