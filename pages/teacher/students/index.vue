<template>
  <v-container>
    <v-row>
      <v-col cols="12" xs="12" class="mx-auto">
        <div v-if="loading">
          <v-skeleton-loader
            type="button, table"
            min-width="300"
          ></v-skeleton-loader>
        </div>

        <div v-if="!loading">
          <v-dialog v-model="showDialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="primary" dark>Invite Student</v-btn>
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
                  <v-btn @click="showDialog = false" :disabled="saving"
                    >Close</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-form>
          </v-dialog>
        </div>
      </v-col>
    </v-row>
    <v-row v-if="!loading">
      <v-col cols="12" xs="12" class="mx-auto">
        <v-data-table
          :headers="headers"
          :items="students"
          v-if="hasStudents"
          show-group-by
        >
          <template v-slot:item.action="{ item }">
            <v-icon @click="editItem(item)" small class="mr-2">
              edit
            </v-icon>
            <v-icon @click="deleteItem(item)" small>
              delete
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
      <div v-if="!hasStudents" class="headline mx-auto">
        No students have joined
      </div>
      <snackbar />
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import uuidv4 from 'uuid/v4'
import { firestore } from '@/services/fireinit.js'
import snackbar from '@/components/snackbar'

export default {
  layout: 'teacher',

  components: {
    snackbar
  },

  data() {
    return {
      valid: false,
      loading: true,
      sendingEmail: false,
      showDialog: false,
      saving: false,
      dialogEmail: null,
      dialogEmailRules: [
        (v) => !!v || 'E-mail is required',
        (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      ],
      showSnackbar: false,
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Class', value: 'class' }
      ],
      students: []
    }
  },

  computed: {
    hasStudents() {
      return this.students !== undefined && this.students.length > 0
    }
  },

  async mounted() {
    this.loading = true
    await firestore
      .collection('students')
      .where('organizations', 'array-contains', localStorage.orgId)
      .onSnapshot((querySnapshot) => {
        this.students = []
        querySnapshot.docs.forEach((doc) => {
          this.students.push({
            name: doc.data().displayName,
            class: null
          })
        })
        this.loading = false
      })
  },

  methods: {
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
          orgName: localStorage.orgName,
          orgId: localStorage.orgId,
          inviteId: uuidv4().substring(0, 8)
        })

      this.dialogEmail = null
      this.showDialog = false
      this.saving = false
      this.$store.commit('snackbar/setSnack', 'Invite sent')
    }
  }
}
</script>
