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
    <v-card>
      <snackbar />
      <v-toolbar dark color="dark grey-3">
        <v-btn @click="dialog = false" icon dark>
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Entry Form</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn @click="dialog = false" dark text>Save</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <div class="ml-5 mt-5">
        <v-switch
          v-model="formEnabled"
          :label="entryFormSwitchLabel"
        ></v-switch>
      </div>
      <div class="ml-5">
        <div class="body-1">
          Link to entry form:
          <v-text-field ref="entry"
            >https://asdkjasdoaiusoiuweqwe.com/asdasd/asd2/234234</v-text-field
          >
          <v-btn @click="copyLink()" class="ml-3">
            Copy
          </v-btn>
        </div>
      </div>
      <div class="ml-5 mr-5">
        <v-textarea
          :value="notes"
          label="Notes"
          hint="Information that may be useful for potential students"
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
    url: {
      type: String,
      default: null
    },
    entryFormEnabled: {
      type: Boolean,
      default: true
    }
  },

  data: () => ({
    formEnabled: true,
    dialog: false,
    notes: null,
    message: ''
  }),

  computed: {
    entryFormSwitchLabel() {
      return `Entry form ${this.formEnabled ? 'enabled' : 'disabled'}`
    }
  },

  created() {
    this.formEnabled = this.entryFormEnabled
  },

  methods: {
    click() {
      this.$emit('save-event-form')
    },
    copyLink() {
      navigator.clipboard.writeText(this.url)
      this.$store.commit('snackbar/setSnack', 'URL copied')
    }
  }
}
</script>
