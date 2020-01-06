<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-skeleton-loader type="table" min-width="300"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-data-table :headers="headers" :items="students" v-if="hasStudents">
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Students</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>

              <student-entry-form></student-entry-form>
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
                        >Save</v-btn
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
            </v-toolbar>
          </template>

          <template slot="no-data">
            No students have joined. Invite some!
          </template>

          <template v-slot:item.action="{ item }">
            <v-icon @click="showEditStudent(item)" small class="mr-3">
              mdi-pencil
            </v-icon>
            <v-icon @click="removeStudent(item)" small>
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
      <snackbar />
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'
import StudentEntryForm from '@/components/teacher/StudentEntryForm'

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
      valid: false,
      loading: true,
      sendingEmail: false,
      showEmailDialog: false,
      saving: false,
      dialogEmail: null,
      dialogEmailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      showSnackbar: false,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Class', value: 'class' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      students: [],
      showStudentEditDialog: false,
      dialogStudentDisplayName: null,
      dialogCurrentStudent: null
    }
  },

  computed: {
    hasStudents() {
      return this.students !== undefined && this.students.length > 0
    }
  },

  async mounted() {
    await firestore
      .collection('students')
      .where(
        'organizations',
        'array-contains',
        JSON.parse(localStorage.org).orgId
      )
      .onSnapshot((querySnapshot) => {
        this.students = []
        querySnapshot.docs.forEach((doc) => {
          const student = doc.data()
          this.students.push({
            uid: student.uid,
            recordId: doc.id,
            name: student.displayName,
            class: ''
          })
        })
        this.loading = false
      })
  },

  methods: {
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
      // TODO - implement this properly
      await firestore
        .collection('students')
        .doc(student.recordId)
        .update({
          organizations: firebase.firestore.FieldValue.arrayRemove(
            JSON.parse(localStorage.org).orgId
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
          email: this.dialogEmail,
          organizations: firebase.firestore.FieldValue.arrayUnion(
            JSON.parse(localStorage.org).orgId
          )
        })

        studentId = newStudent.id
      } else {
        studentId = studentRecord.docs[0].id
      }

      const org = JSON.parse(localStorage.org)
      await firestore
        .collection('students')
        .doc(studentId)
        .collection('invites')
        .add({
          invitedOn: new Date(),
          invitedBy: JSON.parse(localStorage.currentUser).uid,
          email: this.dialogEmail,
          orgName: org.orgName,
          orgId: org.orgId
        })

      this.dialogEmail = null
      this.showEmailDialog = false
      this.saving = false
      this.$store.commit('snackbar/setSnack', 'Invite sent')
    }
  }
}
</script>
