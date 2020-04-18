<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" xs="12" lg="9" xl="6" class="mx-auto">
        <v-img src="/bots/robots small.png" width="330" class="mx-auto"></v-img>
      </v-col>
    </v-row>
    <v-row justify="center">
      <div class="title my-2">
        Let's setup your club!
      </div>
    </v-row>
    <v-row>
      <v-col cols="12" xs="12" lg="9" xl="6" class="mx-auto">
        <v-stepper v-model="currentStep" vertical>
          <v-stepper-step :complete="currentStep > 1" step="1" editable="true">
            Club Info
          </v-stepper-step>

          <v-stepper-content step="1">
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="clubName"
                :rules="[(v) => !!v || 'Name is required']"
                :disabled="savingClub"
                label="Club Name"
                placeholder="i.e. Tawa Code Club"
                required
              ></v-text-field>
              <v-textarea
                v-model="clubDescription"
                :disabled="savingClub"
                placeholder="Description"
              ></v-textarea>
            </v-form>
            <v-btn @click="currentStep = 2" color="primary">Continue</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 2" step="2" editable="true"
            >Add a Group</v-stepper-step
          >

          <v-stepper-content step="2">
            <div class="body-2">
              Lessons and students are assigned to a group. We need at least one
              setup
            </div>
            <div>
              Groups are great for breaking up the class (i.e. new children vs
              more experienced) or if you have mutiple clubs that run at
              different times.
            </div>
            <div class="body-2">
              We need at least one group setup. You can always add/edit this
              later
            </div>

            <v-card
              color="grey lighten-1"
              class="mb-12"
              height="200px"
            ></v-card>
            <v-btn @click="currentStep = 3" color="primary">Continue</v-btn>
            <v-btn @click="currentStep = 1" text>back</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 3" step="3" editable="true"
            >Invite more teachers</v-stepper-step
          >

          <v-stepper-content step="3">
            <v-card
              color="grey lighten-1"
              class="mb-12"
              height="200px"
            ></v-card>
            <v-btn @click="currentStep = 4" color="primary">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-stepper-content>

          <v-stepper-step step="4" editable="true"
            >Import some lessons</v-stepper-step
          >
          <v-stepper-content step="4">
            <v-card
              color="grey lighten-1"
              class="mb-12"
              height="200px"
            ></v-card>
            <v-btn @click="currentStep = 1" color="primary">Continue</v-btn>
            <v-btn text>Cancel</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  data() {
    return {
      currentStep: 1,
      valid: false,
      loading: true,
      enableStudentButton: false
    }
  },

  async mounted() {
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    const studentRecord = await firestore
      .collection('students')
      .where('uid', '==', currentUserUid)
      .get()

    this.enableStudentButton = studentRecord.docs.length > 0

    this.loading = false
  },

  methods: {
    teacher() {
      this.$router.push('/teacher/club')
    },

    student() {
      this.$router.push('/student')
    }
  }
}
</script>
