<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12">
        <v-row align="center" justify="center">
          <v-skeleton-loader
            type="image, paragraph, button"
            min-width="400"
          ></v-skeleton-loader>
        </v-row>
      </v-col>
    </v-row>
    <div v-else>
      <v-row v-if="!entryFormValid" align="center" justify="center">
        <div class="display-2">Entry form not found</div>
      </v-row>

      <v-row
        v-if="entryFormValid && !entryFormEnabled"
        align="center"
        justify="center"
      >
        <div class="display-2">Entry form disabled</div>
      </v-row>

      <div v-if="entryFormValid && entryFormEnabled">
        <v-img
          src="/bots/robots small.png"
          max-width="300"
          class="mx-auto my-5"
        ></v-img>
        <v-row>
          <v-col>
            <v-card class="mx-auto" max-width="600px">
              <v-card-title>{{ clubName }}</v-card-title>
              <v-card-subtitle v-if="clubDescription">{{
                clubDescription
              }}</v-card-subtitle>
              <v-card-text>
                <div>
                  <display-logged-in-user
                    :current-user="currentUser"
                  ></display-logged-in-user>
                </div>
                <div class="mt-4">
                  <google-button></google-button>
                </div>
                <v-textarea label="Message for teacher"></v-textarea>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary">Submit</v-btn>
                <v-btn>Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>
  </v-container>
</template>

<script>
// Entry form that anyone can use to sign up
import { firestore } from '@/services/fireinit.js'
import GoogleButton from '@/components/login/GoogleButton'
import DisplayLoggedInUser from '@/components/login/DisplayLoggedInUser'

export default {
  layout: 'minimal',

  components: {
    GoogleButton,
    DisplayLoggedInUser
  },

  head() {
    return { title: 'Entry Form' }
  },

  data() {
    return {
      loading: true,
      entryFormData: null,
      entryFormValid: false,
      entryFormEnabled: false,
      currentUser: null
    }
  },

  computed: {
    clubName() {
      if (!this.entryFormData) return null
      return this.entryFormData.clubName
    },
    clubDescription() {
      if (!this.entryFormData) return null
      return this.entryFormData.clubDescription
    },
    entryFormMessage() {
      if (!this.entryFormData) return null
      return this.entryFormData.entryFormMessage
    }
  },

  async created() {
    this.currentUser = JSON.parse(localStorage.currentUser)

    if (this.$route.params.id) {
      console.log(this.$route.params.id)
      const entryFormRef = await firestore
        .collection('publicentryforms')
        .doc(this.$route.params.id)
        .get()

      if (!entryFormRef.empty) {
        this.entryFormData = entryFormRef.data()
        this.entryFormEnabled = this.entryFormData.entryFormEnabled
        this.entryFormValid = true
      }
    }

    this.loading = false
  }
}
</script>
