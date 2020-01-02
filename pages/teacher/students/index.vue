<template>
  <v-container>
    <v-row>
      <v-col cols="12" xs="12" class="mx-auto">
        <div v-if="loading">
          <v-skeleton-loader
            type="image, paragraph, text, article, button"
          ></v-skeleton-loader>
        </div>

        <div v-if="!loading">
          <v-dialog v-model="showDialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="primary" dark>Open Dialog</v-btn>
            </template>
            <v-form ref="modalInviteStudent" lazy-validation>
              <v-card>
                <v-card-title>
                  <span class="headline">Invite Student</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          v-model="dialogEmail"
                          :rules="dialogEmailRules"
                          label="Email*"
                          required
                        ></v-text-field>
                        <small>*indicates required field</small>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn @click="inviteStudent()" color="primary">Save</v-btn>
                  <v-btn @click="showDialog = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
          <v-btn>Classes</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'teacher',

  data() {
    return {
      valid: false,
      loading: false,
      sendingEmail: false,
      showDialog: false,
      dialogEmail: null,
      dialogEmailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ]
    }
  },

  mounted() {
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    console.log(currentUserUid)
  },

  methods: {
    async inviteStudent() {
      if (!this.$refs.modalInviteStudent.validate()) {
        return
      }

      const studentRecord = await firestore
        .collection('students')
        .where('email', '==', this.dialogEmail)
        .get()

      let studentId = null
      if (studentRecord.docs.length === 0) {
        // Add the student record and the invite
        const newStudent = await firestore.collection('students').add({
          email: this.dialogEmail,
          organizations: firebase.firestore.FieldValue.arrayUnion(
            localStorage.orgId
          )
        })

        studentId = newStudent.id
      } else {
        studentId = studentRecord.docs[0].id
      }

      await firestore
        .collection('students')
        .doc(studentId)
        .collection('invites')
        .add({
          invitedOn: new Date(),
          invitedBy: JSON.parse(localStorage.currentUser).uid,
          email: this.dialogEmail,
          orgName: localStorage.orgName
        })

      this.showDialog = false
    }
  }
}
</script>
