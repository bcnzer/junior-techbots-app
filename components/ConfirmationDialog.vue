<template>
  <v-dialog v-model="showingDialog" :persistent="persistent" max-width="400">
    <v-card>
      <v-card-title v-if="title" class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ text }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="onConfirmationBtn()" text>{{
          confirmationBtnText
        }}</v-btn>
        <v-btn @click="onCancelBtn()" v-if="cancelBtnText" text>{{
          cancelBtnText
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmationDialog',

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
    },
    confirmationBtnText: {
      type: String,
      default: 'Yes'
    },
    cancelBtnText: {
      type: String,
      default: 'No'
    },
    persistent: {
      type: Boolean,
      default: false
    },
    id: {
      // ID of the item you may be deleting, for example
      type: String,
      default: null
    }
  },

  computed: {
    showingDialog: {
      get() {
        return this.showDialog
      }
    }
  },

  methods: {
    onConfirmationBtn() {
      this.$emit('on-dialog-confirmation', this.id)
    },
    onCancelBtn() {
      this.$emit('on-dialog-cancel')
    }
  }
}
</script>
