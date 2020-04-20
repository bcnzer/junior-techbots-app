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
          <v-stepper-step :complete="currentStep > 1" step="1">
            Login
          </v-stepper-step>

          <v-stepper-content step="1">
            <div v-if="currentUser">
              Junior Techbots uses Google to sign in. Your club will be setup
              against this account
              <v-list>
                <v-list-item>
                  <v-list-item-avatar class="mr-5">
                    <v-img :src="currentUserPhoto"></v-img>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      v-html="currentUserDisplayName"
                    ></v-list-item-title>
                    <v-list-item-subtitle
                      v-html="currentUserEmail"
                    ></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <div>
                If you have multiple Google accounts, click here to sign in and
                pick one
              </div>
            </div>
            <div v-else>
              Please login with your Google account
            </div>
            <div class="mt-3">
              <v-btn @click="googleSignIn">
                <v-img
                  height="18"
                  width="18"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  class="mr-2"
                ></v-img>
                Sign in with Google
              </v-btn>
            </div>
            <v-btn
              @click="goForwardStep"
              :disabled="!currentUser"
              color="primary"
              class="mt-4"
              >Continue</v-btn
            >
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 2" step="2">
            Club Info
          </v-stepper-step>

          <v-stepper-content step="2">
            <v-form ref="formClubInfo">
              <v-text-field
                v-model="clubName"
                :rules="[(v) => !!v || 'Club name is required']"
                label="Club Name"
                placeholder="Example: Kāpiti Code Club"
                required
              ></v-text-field>
              <v-textarea
                v-model="clubDescription"
                placeholder="Description"
              ></v-textarea>
            </v-form>
            <v-btn @click="goForwardStep" color="primary">Continue</v-btn>
            <v-btn @click="goBackStep" text>back</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 2" step="3"
            >Add a Group</v-stepper-step
          >

          <v-stepper-content step="3">
            <div>
              <span class="body-2">
                Lessons and students are assigned to groups. We need at least
                one
              </span>
              <v-btn
                @click="dialogGroupMoreInfo = true"
                small
                color="primary"
                text
              >
                More info
              </v-btn>
            </div>
            <v-dialog v-model="dialogGroupMoreInfo" max-width="400">
              <v-card>
                <v-card-title>Groups</v-card-title>
                <v-card-text>
                  Groups are great for two use cases:
                  <ol>
                    <li>
                      breaking up the class i.e. new children vs more
                      experienced
                    </li>
                    <li>
                      if you have mutiple clubs that run at different times
                    </li>
                  </ol>
                  <div class="mt-1">
                    We need at least one group setup. You can add more or edit
                    this group later.
                  </div>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="dialogGroupMoreInfo = false"
                    color="primary"
                    text
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-form ref="formGroupName">
              <v-text-field
                v-model="groupName"
                :rules="[(v) => !!groupName || 'Name is required']"
                label="Group Name"
                placeholder="Example: Coding Club or Years 5-8"
              ></v-text-field>
            </v-form>
            <v-btn @click="goForwardStep" color="primary">Continue</v-btn>
            <v-btn @click="goBackStep" text>back</v-btn>
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 3" step="4"
            >Optional - Invite members of your team</v-stepper-step
          >

          <v-stepper-content step="4">
            <div class="body-2">
              You are the administrator of this club. You can optionally invite
              others people to help run your club. They'll have access to the
              "teacher" portal for managing groups, lessons, students, etc
            </div>

            <v-form ref="formInviteOrganizers" class="mt-4">
              <v-text-field
                v-model="inviteEmail1"
                :rules="emailRules"
                placeholder="Email address"
                clearable
              ></v-text-field>
              <v-text-field
                v-model="inviteEmail2"
                :rules="emailRules"
                placeholder="Email address"
                clearable
              ></v-text-field>
              <v-text-field
                v-model="inviteEmail3"
                :rules="emailRules"
                placeholder="Email address"
                clearable
              ></v-text-field>
            </v-form>

            <v-btn @click="goForwardStep" color="primary">Continue</v-btn>
            <v-btn @click="goBackStep" text>back</v-btn>
          </v-stepper-content>

          <v-stepper-step step="5">Confirmation</v-stepper-step>
          <v-stepper-content step="5">
            <div class="mb-5">
              Are you sure you want to go ahead and create
              <b>{{ clubName }}</b
              >?
            </div>
            <v-btn
              @click="createClub"
              :loading="saving"
              :disabled="saving"
              color="primary"
              >Create Club</v-btn
            >
            <v-btn @click="goBackStep" :disabled="saving" text>back</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import firebase from 'firebase/app'
import uuidv4 from 'uuid/v4'

export default {
  layout: 'minimal',

  data() {
    return {
      currentUser: null,
      currentStep: 1,
      clubName: 'Papakowhai School Coding Club',
      clubDescription: 'Lunchtime coding club out of Rimu 2',
      groupName: 'Years 3-8',
      dialogGroupMoreInfo: false,
      projectsCodeClubNZ: false,
      inviteEmail1: null,
      inviteEmail2: null,
      inviteEmail3: null,
      emailRules: [(v) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid'],
      saving: false
    }
  },

  computed: {
    currentUserPhoto() {
      if (!this.currentUser) return
      return this.currentUser.photoURL
    },
    currentUserDisplayName() {
      if (!this.currentUser) return
      return this.currentUser.displayName
    },
    currentUserEmail() {
      if (!this.currentUser) return
      return this.currentUser.email
    }
  },

  mounted() {
    if (!localStorage.currentUser) return null
    this.currentUser = JSON.parse(localStorage.currentUser)
  },

  methods: {
    googleSignIn() {
      this.$router.push('/login?redirect=clubsetup')
    },

    async createClub() {
      this.saving = true

      const currentUserUid = JSON.parse(localStorage.currentUser).uid
      let teacherRecord = await firestore
        .collection('teachers')
        .where('uid', '==', currentUserUid)
        .get()

      if (teacherRecord.docs.length > 0) {
        // They exist already so get their record
        this.teacherRecordId = teacherRecord.docs[0].id
        teacherRecord = teacherRecord.docs[0].data()
      } else {
        // They are new so immediately create a teacher record
        const newTeacherRecord = {
          uid: currentUserUid
        }
        teacherRecord = await firestore
          .collection('teachers')
          .add(newTeacherRecord)
        this.teacherRecordId = teacherRecord.id
        teacherRecord = newTeacherRecord
      }

      // Create the club
      const entryId = uuidv4().substring(0, 8)
      const newClub = await firestore.collection('clubs').add({
        name: this.clubName,
        description: this.clubDescription,
        teachers: [currentUserUid],
        uid: currentUserUid,
        entryFormId: entryId
      })

      // Create the group within the club
      await firestore
        .collection('clubs')
        .doc(newClub.id)
        .collection('groups')
        .add({
          name: this.groupName
        })

      // Add the club to the teacher's record
      await firestore
        .collection('teachers')
        .doc(this.teacherRecordId)
        .update({
          clubs: firebase.firestore.FieldValue.arrayUnion(newClub.id)
        })

      localStorage.club = JSON.stringify({
        id: newClub.id,
        name: this.clubName,
        entryFormId: entryId
      })

      this.$router.push('/teacher')
    },
    goBackStep() {
      this.currentStep -= 1
    },
    goForwardStep() {
      if (this.currentStep === 2 && !this.$refs.formClubInfo.validate()) {
        return
      }
      if (this.currentStep === 3 && !this.$refs.formGroupName.validate()) {
        return
      }
      if (
        this.currentStep === 4 &&
        !this.$refs.formInviteOrganizers.validate()
      ) {
        return
      }
      this.currentStep += 1
    }
  }
}
</script>
