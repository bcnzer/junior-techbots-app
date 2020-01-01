<template>
  <v-container>
    <div v-if="loading">
      <v-row>
        <v-col class="mx-auto">
          <v-skeleton-loader type="heading"></v-skeleton-loader>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-col>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-skeleton-loader type="image"></v-skeleton-loader>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-row>
        <v-col class="text-center">
          <h1>
            Login as...
          </h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-card class="mx-auto py-2" max-width="300" elevation="12">
            <v-img
              src="bots/student-portrait.png"
              max-width="200"
              class="mx-auto"
            ></v-img>

            <v-card-actions>
              <v-btn color="primary" class="mx-auto" large>
                Student
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" xs="6" sm="6" md="6" lg="6" xl="6" class="mx-auto">
          <v-card class="mx-auto py-2" max-width="300" elevation="12">
            <v-img
              src="bots/teacher-portrait.png"
              max-width="200"
              class="mx-auto"
            ></v-img>

            <v-card-actions>
              <v-btn color="primary" class="mx-auto" large>
                Teacher
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import firebase from 'firebase/app'
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  data() {
    return {
      valid: false,
      loading: true
    }
  },

  async mounted() {
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    const teacherRecord = await firestore
      .collection('teachers')
      .where('uid', '==', currentUserUid)
      .get()
    // const studentRecord = await firestore
    //   .collection('teachers')
    //   .where('uid', '==', currentUserUid)
    //   .get()

    if (teacherRecord.docs.length > 0) {
      this.teacherRecordId = teacherRecord.docs[0].id
    }

    this.loading = false
  },

  methods: {
    async addOrg() {
      if (!this.$refs.form.validate()) {
        return
      }

      this.savingOrg = true
      const newOrg = await firestore.collection('organizations').add({
        name: this.orgName,
        description: this.orgDescription,
        teachers: [localStorage.currentUser.uid],
        uid: localStorage.currentUser.uid
      })

      await firestore
        .collection('teachers')
        .doc(this.teacherRecordId)
        .update({
          organizations: firebase.firestore.FieldValue.arrayUnion(newOrg.id)
        })

      localStorage.orgId = newOrg.id
      localStorage.orgName = this.orgName
      this.$router.push('/')

      this.savingOrg = false
    }
  }
}
</script>
