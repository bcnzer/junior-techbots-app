<template>
  <v-dialog v-model="showDialog" max-width="750">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" dark class="mr-2">Entry form</v-btn>
    </template>
    <v-card>
      <v-card-title>
        Entry Form
      </v-card-title>
      <snackbar />
      <v-card-text>
        <v-alert type="info">
          You will need to approve any requests to join your club
        </v-alert>
        <v-switch
          v-model="isFormEnabled"
          :label="entryFormSwitchLabel"
          class="mt-5"
        ></v-switch>
        <div class="body-1">
          Link to entry form:
          <a :href="entryFormUrl">{{ entryFormUrl }}</a>
          <v-btn @click="copyLink()" icon class="ml-3">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </div>
        <v-textarea
          v-model="formMessage"
          label="Additional Message"
          hint="Information that may be useful for potential students (optional)"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="saveEntryForm(true)" color="primary" class="mb-3"
          >Save</v-btn
        >
        <v-btn @click="saveEntryForm(false)" class="mb-3 mr-3">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import snackbar from '@/components/snackbar'

export default {
  name: 'StudentEntryForm',

  components: {
    snackbar
  },

  props: {
    entryFormEnabled: {
      type: Boolean,
      default: true
    },
    entryFormMessage: {
      type: String,
      default: null
    },
    entryFormId: {
      type: String,
      default: null
    }
  },

  data: () => ({
    formEnabled: true,
    showDialog: false,
    additionalMessage: null,
    message: '',
    url: null
  }),

  computed: {
    entryFormSwitchLabel() {
      return `Entry form ${this.formEnabled ? 'enabled' : 'disabled'}`
    },
    entryFormUrl() {
      return `${new URL(window.location.href).origin}/student/entry/${
        this.entryFormId
      }`
    },
    isFormEnabled: {
      get() {
        return this.entryFormEnabled
      },
      set(value) {
        this.formEnabled = value
      }
    },
    formMessage: {
      get() {
        return this.entryFormMessage
      },
      set(value) {
        this.additionalMessage = value
      }
    }
  },

  methods: {
    copyLink() {
      navigator.clipboard.writeText(this.entryFormUrl)
      this.$store.commit('snackbar/setSnack', 'URL copied to clipboard')
    },
    saveEntryForm(save) {
      this.showDialog = false
      if (save) {
        this.$emit('save-event-form', {
          entryFormEnabled: this.formEnabled,
          entryFormMessage: this.additionalMessage
        })
      } else {
        this.$emit('save-event-form')
      }
    }
  }
}
</script>
