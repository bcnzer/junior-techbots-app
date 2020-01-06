<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" dark class="mr-2">Entry form</v-btn>
    </template>
    <v-card :disabled="saving">
      <snackbar />
      <v-toolbar dark color="dark grey-3">
        <v-btn @click="dialog = false" icon dark>
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Entry Form</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn @click="saveEntryForm" :loading="saving" dark text>Save</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="ml-5 mt-5">
        <v-switch
          v-model="formEnabled"
          :label="entryFormSwitchLabel"
        ></v-switch>
      </div>
      <div class="ml-5 body-1">
        <v-avatar color="secondary" size="36">
          <v-icon dark>mdi-alert-circle-outline</v-icon>
        </v-avatar>
        If there are multiple classes, the students will be able to pick the
        class they would like to join
      </div>
      <div class="ml-5 mt-5">
        <div class="body-1">
          Link to entry form:
          <a :href="entryFormUrl">{{ entryFormUrl }}</a>
          <v-btn @click="copyLink()" class="ml-3">
            Copy
          </v-btn>
        </div>
      </div>
      <div class="ml-5 mr-5">
        <v-textarea
          v-model="additionalMessage"
          label="Additional Message"
          hint="Information that may be useful for potential students (optional)"
        ></v-textarea>
      </div>
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
    buttonText: {
      type: String,
      default: null
    },
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
    saving: false,
    dialog: false,
    additionalMessage: null,
    message: '',
    url: null
  }),

  computed: {
    entryFormSwitchLabel() {
      return `Entry form ${this.formEnabled ? 'enabled' : 'disabled'}`
    },
    entryFormUrl() {
      return `https://app.juniortechbots.com/student/entry/${this.entryFormId}`
    }
  },

  created() {
    this.formEnabled = this.entryFormEnabled
    this.additionalMessage = this.entryFormMessage
  },

  methods: {
    copyLink() {
      navigator.clipboard.writeText(this.entryFormUrl)
      this.$store.commit('snackbar/setSnack', 'URL copied')
    },
    saveEntryForm() {
      this.saving = true

      this.$emit('save-event-form', {
        entryFormEnabled: this.formEnabled,
        entryFormMessage: this.additionalMessage
      })

      // const org = JSON.parse(localStorage.org)
      // await firestore
      //   .collection('organizations')
      //   .doc(org.id)
      //   .update({
      //     entryFormEnabled: this.formEnabled,
      //     entryFormMessage: this.additionalMessage
      //   })

      // org.entryFormEnabled = this.formEnabled
      // org.entryFormMessage = this.additionalMessage
      // localStorage.org = JSON.stringify(org)

      this.dialog = false
      this.saving = false
    }
  }
}
</script>
