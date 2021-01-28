<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-card>
          <v-tabs v-model="tab">
            <v-tab key="students">{{ studentHeader }}</v-tab>
            <v-tab key="requestsToJoin">{{ requestsToJoin }}</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <v-tab-item key="students">
              <v-card flat>
                <v-card-title>
                  Students
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                    class="mr-2 mb-2"
                  ></v-text-field>

                  <student-entry-form
                    :entry-form-id="entryFormId"
                    :entry-form-enabled="entryFormEnabled"
                    :entry-form-message="entryFormMessage"
                    v-on:save-event-form="onSaveEntryFormDetails"
                  ></student-entry-form>
                  <v-dialog v-model="showEmailDialog" max-width="500px">
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on">Invite Student</v-btn>
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
                                <v-alert type="warning">
                                  Students must login with a Google account - a
                                  GMail or GSuite account
                                </v-alert>
                                <v-text-field
                                  v-model="dialogEmail"
                                  :rules="dialogEmailRules"
                                  :disabled="saving"
                                  label="Email"
                                  required
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            @click="inviteStudent()"
                            :loading="saving"
                            color="primary"
                            >Send</v-btn
                          >
                          <v-btn
                            @click="showEmailDialog = false"
                            :disabled="saving"
                            >Cancel</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-form>
                  </v-dialog>

                  <v-dialog
                    v-model="showStudentEditDialog"
                    persistent
                    max-width="500px"
                  >
                    <v-form ref="modalEditStudent" lazy-validation>
                      <v-card>
                        <v-card-text>
                          <v-container>
                            <v-row>
                              <v-col cols="12">
                                <v-text-field
                                  v-model="dialogStudentDisplayName"
                                  :disabled="saving"
                                  :rules="[(v) => !!v || 'Name is required']"
                                  label="Name"
                                  required
                                ></v-text-field>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            @click="editStudent()"
                            :loading="saving"
                            color="primary"
                            >Save</v-btn
                          >
                          <v-btn
                            @click="showStudentEditDialog = false"
                            :disabled="saving"
                            >Cancel</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-form>
                  </v-dialog>
                </v-card-title>
                <v-data-table :headers="headers" :items="students">
                  <template slot="no-data">
                    No students have joined. Invite some!
                  </template>

                  <template v-slot:item.action="{ item }">
                    <v-icon @click="showEditStudent(item)" class="mr-5">
                      mdi-pencil
                    </v-icon>
                    <v-icon @click="deleteStudent(item)">
                      mdi-delete
                    </v-icon>
                  </template>
                </v-data-table>
              </v-card>
            </v-tab-item>

            <v-tab-item key="requestsToJoin">
              <v-card v-if="joinRequests.length == 0" flat>
                <v-card-text class="title">
                  There are no requests to join your club
                </v-card-text>
              </v-card>
              <v-card v-else flat>
                <v-list two-line>
                  <template v-for="(request, index) in joinRequests">
                    <v-divider
                      v-if="showDivider(index, joinRequests.length)"
                      :key="index"
                    ></v-divider>

                    <v-list-item :key="request.id">
                      <v-list-item-avatar>
                        <v-img :src="request.photoURL"></v-img>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title
                          v-html="request.displayName"
                        ></v-list-item-title>
                        <v-list-item-subtitle
                          v-html="request.email"
                        ></v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action>
                        <v-tooltip left>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-on="on"
                              @click="approveRequest(index)"
                              text
                              icon
                            >
                              <v-icon>
                                mdi-account-check
                              </v-icon>
                            </v-btn>
                          </template>
                          <span>Approve request</span>
                        </v-tooltip>
                      </v-list-item-action>

                      <v-list-item-action>
                        <v-tooltip left>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-on="on"
                              @click="denyRequest(index)"
                              text
                              icon
                            >
                              <v-icon>
                                mdi-account-remove
                              </v-icon>
                            </v-btn>
                          </template>
                          <span>Remove request</span>
                        </v-tooltip>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
      <snackbar />

      <confirmation-dialog
        :showDialog="showDeleteConfirmationDialog"
        @on-dialog-confirmation="onDeleteConfirmation()"
        @on-dialog-cancel="onDeleteCancel()"
        :id="$route.params.id"
        :text="confirmationDialogMessage"
        title="Delete Request?"
      />
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'
import StudentEntryForm from '@/components/teacher/StudentEntryForm'
import firebase from 'firebase/app'
import uuidv4 from 'uuid/v4'
import ConfirmationDialog from '~/components/ConfirmationDialog'

export default {
  layout: 'teacher',

  components: {
    snackbar,
    StudentEntryForm,
    ConfirmationDialog
  },

  head() {
    return { title: 'Teacher' }
  },

  data() {
    return {
      search: null,
      loading: true,
      tab: null,
      showEmailDialog: false,
      saving: false,
      dialogEmail: null,
      dialogEmailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      students: [],
      showStudentEditDialog: false,
      dialogStudentDisplayName: null,
      dialogCurrentStudent: null,
      entryFormMessage: null,
      currentClub: null,
      joinRequests: [],
      joinRequestIndex: null,
      joinRequestDisplayName: null,
      showDeleteConfirmationDialog: false
    }
  },

  computed: {
    confirmationDialogMessage() {
      return `Are you sure you want to delete the request for '${this.joinRequestDisplayName}'?`
    },
    studentHeader() {
      if (this.students.length === 0) return 'Students'

      return `Students (${this.students.length})`
    },
    requestsToJoin() {
      if (this.joinRequests.length === 0) return 'Requests to Join'

      return `Requests to Join (${this.joinRequests.length})`
    }
  },

  async created() {
    const clubId = JSON.parse(localStorage.club).id
    const clubRef = await firestore
      .collection('clubs')
      .doc(clubId)
      .get()

    this.currentClub = clubRef.data()
    this.currentClub.id = clubId
    this.entryFormEnabled = this.currentClub.entryFormEnabled
    this.entryFormMessage = this.currentClub.entryFormMessage
    this.entryFormId = this.currentClub.entryFormId

    await firestore
      .collection('students')
      .where('clubs', 'array-contains', clubId)
      .onSnapshot((querySnapshot) => {
        this.students = []
        querySnapshot.docs.forEach((doc) => {
          const student = doc.data()
          this.students.push({
            uid: student.uid,
            recordId: doc.id,
            name: student.displayName,
            email: student.email,
            group: ''
          })
        })
      })

    await firestore
      .collection('submittedentries')
      .where('clubId', '==', clubId)
      .onSnapshot((querySnapshot) => {
        this.joinRequests = []
        querySnapshot.docs.forEach((doc) => {
          const record = doc.data()
          record.id = doc.id
          this.joinRequests.push(record)
        })
      })

    this.loading = false
  },

  methods: {
    async onDeleteConfirmation() {
      await this.handleRequest(false, this.joinRequestIndex)
      this.showDeleteConfirmationDialog = false
      this.joinRequestIndex = null
      this.joinRequestDisplayName = null
    },

    onDeleteCancel() {
      this.joinRequestIndex = null
      this.showDeleteConfirmationDialog = false
    },

    async handleRequest(approve, index) {
      const clubId = JSON.parse(localStorage.club).id

      // Assign the club to the student
      await firestore
        .collection('students')
        .doc(this.joinRequests[index].studentId)
        .update({
          clubs: approve
            ? firebase.firestore.FieldValue.arrayUnion(clubId)
            : firebase.firestore.FieldValue.arrayRemove(clubId)
        })

      console.log(this.joinRequests[index])
      await firestore
        .collection('user_claims')
        .doc(this.joinRequests[index].uid)
        .set(
          {
            inClubAsStudent: approve
              ? firebase.firestore.FieldValue.arrayUnion(clubId)
              : firebase.firestore.FieldValue.arrayRemove(clubId)
          },
          { merge: true }
        )

      // Delete the entry once done
      await firestore
        .collection('submittedentries')
        .doc(this.joinRequests[index].id)
        .delete()
    },

    async approveRequest(index) {
      await this.handleRequest(true, index)
    },

    denyRequest(index) {
      this.joinRequestIndex = index
      this.joinRequestDisplayName = this.joinRequests[index].displayName
      this.showDeleteConfirmationDialog = true
    },

    async onSaveEntryFormDetails(event) {
      if (!event) return

      const currentUserUid = JSON.parse(localStorage.currentUser).uid
      await firestore
        .collection('clubs')
        .doc(this.currentClub.id)
        .update({
          entryFormEnabled: event.entryFormEnabled,
          entryFormMessage: event.entryFormMessage
        })

      await firestore
        .collection('publicentryforms')
        .doc(this.currentClub.entryFormId)
        .set({
          uid: currentUserUid,
          clubId: this.currentClub.id,
          clubName: this.currentClub.name,
          clubDescription: this.currentClub.description,
          entryFormEnabled: event.entryFormEnabled,
          entryFormMessage: event.entryFormMessage
        })

      this.entryFormEnabled = event.entryFormEnabled
      this.entryFormMessage = event.entryFormMessage
    },

    showDivider(index, length) {
      if (index <= 0) return false
      if (index < length) return true
      return false
    },

    showEditStudent(student) {
      this.dialogCurrentStudent = student // used later when we update
      this.dialogStudentDisplayName = student.name
      this.showStudentEditDialog = true
    },

    async editStudent() {
      if (
        !this.dialogCurrentStudent ||
        !this.$refs.modalEditStudent.validate()
      ) {
        return
      }
      this.saving = true

      await firestore
        .collection('students')
        .doc(this.dialogCurrentStudent.recordId)
        .update({
          displayName: this.dialogStudentDisplayName
        })

      this.saving = false
      this.dialogStudentDisplayName = null
      this.showStudentEditDialog = false
      this.$store.commit('snackbar/setSnack', 'Student updated')
    },

    async deleteStudent(student) {
      await firestore
        .collection('students')
        .doc(student.recordId)
        .update({
          clubs: firebase.firestore.FieldValue.arrayRemove(
            JSON.parse(localStorage.club).id
          )
        })

      await firestore
        .collection('user_claims')
        .doc(student.uid)
        .set(
          {
            inClubAsStudent: firebase.firestore.FieldValue.arrayRemove(
              JSON.parse(localStorage.club).id
            )
          },
          { merge: true }
        )
    },

    async inviteStudent() {
      if (!this.$refs.modalInviteStudent.validate()) {
        return
      }

      this.saving = true
      const studentRecord = await firestore
        .collection('students')
        .where('email', '==', this.dialogEmail)
        .get()

      let studentId = null
      if (studentRecord.docs.length === 0) {
        // Add the student record and the invite
        const newStudent = await firestore.collection('students').add({
          email: this.dialogEmail
        })

        studentId = newStudent.id
      } else {
        studentId = studentRecord.docs[0].id
      }

      const club = JSON.parse(localStorage.club)
      await firestore
        .collection('students')
        .doc(studentId)
        .collection('invites')
        .add({
          inviteId: uuidv4().substring(0, 8),
          invitedOn: new Date(),
          invitedBy: JSON.parse(localStorage.currentUser).uid,
          email: this.dialogEmail,
          clubName: club.name,
          clubId: club.id,
          domainUrl: new URL(window.location.href).origin
        })

      this.dialogEmail = null
      this.showEmailDialog = false
      this.saving = false
      this.$store.commit('snackbar/setSnack', 'Invite sent')
    }
  }
}
</script>
