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
            Club Info
          </v-stepper-step>

          <v-stepper-content step="1">
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
          </v-stepper-content>

          <v-stepper-step :complete="currentStep > 2" step="2"
            >Add a Group</v-stepper-step
          >

          <v-stepper-content step="2">
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

          <v-stepper-step :complete="currentStep > 3" step="3"
            >Invite members of your team</v-stepper-step
          >

          <v-stepper-content step="3">
            <div class="body-2">
              You are the administrator of this club. You can invite others
              people to help run your club. They'll have access to the "teacher"
              portal for managing groups, lessons, students, etc
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

          <v-stepper-step :complete="currentStep > 4" step="4"
            >Import some lessons</v-stepper-step
          >
          <v-stepper-content step="4">
            You can import some pre-defined lessons
            <v-checkbox
              v-model="projectsCodeClubNZ"
              label="Code Club NZ projects"
            ></v-checkbox>
            <v-btn @click="goForwardStep" color="primary">Continue</v-btn>
            <v-btn @click="goBackStep" text>back</v-btn>
          </v-stepper-content>

          <v-stepper-step step="5">Review</v-stepper-step>
          <v-stepper-content step="5">
            <v-card
              color="grey lighten-1"
              class="mb-12"
              height="200px"
            ></v-card>
            <v-btn @click="currentStep = 1" color="primary">Create Club</v-btn>
            <v-btn @click="goBackStep" text>back</v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'minimal',

  data() {
    return {
      currentUserId: null,
      currentStep: 1,
      clubName: null,
      clubDescription: null,
      groupName: null,
      dialogGroupMoreInfo: false,
      projectsCodeClubNZ: false,
      emailRules: [(v) => !v || /.+@.+\..+/.test(v) || 'E-mail must be valid']
    }
  },

  mounted() {
    this.currentUserUid = JSON.parse(localStorage.currentUser).uid
    console.log(this.currentUserId)
  },

  methods: {
    goBackStep() {
      this.currentStep -= 1
    },
    goForwardStep() {
      if (this.currentStep === 1 && !this.$refs.formClubInfo.validate()) {
        return
      }
      if (this.currentStep === 2 && !this.$refs.formGroupName.validate()) {
        return
      }
      if (
        this.currentStep === 3 &&
        !this.$refs.formInviteOrganizers.validate()
      ) {
        return
      }
      this.currentStep += 1
    }
  }
}
</script>
