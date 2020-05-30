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

      <div v-if="entryFormValid && entryFormEnabled && entryAlreadyReceived">
        <v-img
          src="/bots/robots small.png"
          max-width="300"
          class="mx-auto my-5"
        ></v-img>
        <v-row>
          <v-col>
            <v-card v-if="!submitted" class="mx-auto" max-width="600px">
              <v-card-title>{{ clubName }}</v-card-title>
              <v-card-text>
                <div class="title">
                  Entry form already received for this account
                </div>
                <display-logged-in-user
                  :current-user="currentUser"
                  hide-text="true"
                ></display-logged-in-user>
                <div class="mt-2">
                  If you have any questions ask the teacher
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div v-if="entryFormValid && entryFormEnabled && !entryAlreadyReceived">
        <v-img
          src="/bots/robots small.png"
          max-width="300"
          class="mx-auto my-5"
        ></v-img>
        <v-row>
          <v-col>
            <v-card v-if="!submitted" class="mx-auto" max-width="600px">
              <v-card-title>ENTRY FORM</v-card-title>
              <v-card-text>
                <div class="display-1">{{ clubName }}</div>
                <div v-if="clubDescription" class="title">
                  {{ clubDescription }}
                </div>
                <div class="mt-5">
                  <display-logged-in-user
                    :current-user="currentUser"
                  ></display-logged-in-user>
                </div>
                <div class="mt-4">
                  <google-button @on-click="googleSignIn"></google-button>
                </div>
                <v-textarea
                  v-model="messageForTeacher"
                  class="mt-4"
                  label="Message for teacher"
                ></v-textarea>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!currentUser"
                  @click="submitEntry"
                  color="primary"
                  class="mb-2 mr-2"
                  >Submit Entry</v-btn
                >
              </v-card-actions>
            </v-card>
            <v-slide-y-transition>
              <v-card
                v-if="submitted"
                class="mx-auto"
                max-width="600px"
                transition="slide-x-reverse-transition"
              >
                <v-card-text>
                  <div class="display-1">{{ clubName }}</div>
                  <div v-if="clubDescription" class="title">
                    {{ clubDescription }}
                  </div></v-card-text
                >
                <v-card-title>ENTRY SUBMITTED</v-card-title>
                <v-card-text
                  >The teacher will need to approve your request to join the
                  club</v-card-text
                >
              </v-card>
            </v-slide-y-transition>
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
      entryAlreadyReceived: false,
      currentUser: null,
      messageForTeacher: null,
      submitted: false
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
    if (localStorage.currentUser) {
      this.currentUser = JSON.parse(localStorage.currentUser)
      if (this.$route.params.id) {
        const entryRef = await firestore
          .collection('submittedentries')
          .where('email', '==', this.currentUser.email)
          .where('entryId', '==', this.$route.params.id)

        if (!entryRef.empty) {
          // There's already at least one submitted entry for this
          this.entryAlreadyReceived = true
        }
      }
    }

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
  },

  methods: {
    async submitEntry() {
      await firestore.collection('submittedentries').add({
        displayName: this.currentUser.displayName,
        email: this.currentUser.email,
        photoURL: this.currentUser.photoURL,
        uid: this.currentUser.uid,
        entryId: this.$route.params.id,
        messageForTeacher: this.messageForTeacher,
        clubName: this.entryFormData.clubName,
        clubDescription: this.entryFormData.clubDescription,
        entryFormMessage: this.entryFormData.entryFormMessage
      })
      this.submitted = true
    },
    googleSignIn() {
      this.$router.push(`/login?entryform=${this.$route.params.id}`)
    }
  }
}
</script>
