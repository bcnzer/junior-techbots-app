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
                            Students must login with a Google account - a GMail
                            or GSuite account
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
                    <v-btn @click="showEmailDialog = false" :disabled="saving"
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
      </v-col>
      <snackbar />
    </v-row>
  </v-container>
</template>

<script>
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'
import StudentEntryForm from '@/components/teacher/StudentEntryForm'
import firebase from 'firebase/app'
import uuidv4 from 'uuid/v4'

export default {
  layout: 'teacher',

  components: {
    snackbar,
    StudentEntryForm
  },

  head() {
    return { title: 'Teacher' }
  },

  data() {
    return {
      search: null,
      loading: true,
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
      entryFormMessage: null
    }
  },

  async created() {
    const clubId = JSON.parse(localStorage.club).id
    const clubRef = await firestore
      .collection('clubs')
      .doc(clubId)
      .get()

    const club = clubRef.data()
    this.entryFormEnabled = club.entryFormEnabled
    this.entryFormMessage = club.entryFormMessage
    this.entryFormId = club.entryFormId

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
        this.loading = false
      })
  },

  methods: {
    async onSaveEntryFormDetails(event) {
      if (!event) return

      const club = JSON.parse(localStorage.club)
      await firestore
        .collection('clubs')
        .doc(club.id)
        .update({
          entryFormEnabled: event.entryFormEnabled,
          entryFormMessage: event.entryFormMessage
        })

      this.entryFormEnabled = event.entryFormEnabled
      this.entryFormMessage = event.entryFormMessage
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
