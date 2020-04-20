<template>
  <v-container>
    <v-row>
      <v-col cols="12" xs="12" sm="12" lg="8" xl="6" class="mx-auto">
        <div v-if="loading">
          <v-skeleton-loader
            type="image, paragraph, text, article, button"
          ></v-skeleton-loader>
        </div>

        <div v-if="!loading && createOrg">
          <v-img
            src="/bots/robots small.png"
            width="330"
            class="mx-auto"
          ></v-img>
          <div class="display-1 mt-5">
            Enter the name of your org, school or club
          </div>
          <div class="body-1 my-2">
            You will be able to create multiple groups under this club
          </div>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="clubName"
              :rules="[(v) => !!v || 'Name is required']"
              :disabled="savingOrg"
              placeholder="Example: Discovery School Code Club"
              required
              class="mt-3"
            ></v-text-field>
            <v-textarea
              v-model="clubDescription"
              :disabled="savingOrg"
              placeholder="Description"
            ></v-textarea>
            <v-btn
              :disabled="!valid || savingOrg"
              @click="addOrg()"
              color="primary"
              >Create</v-btn
            >
          </v-form>
        </div>
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

  head() {
    return { title: 'Teacher Org' }
  },

  data() {
    return {
      valid: false,
      clubName: null,
      clubDescription: null,
      loading: true,
      createOrg: false,
      pickOrg: false,
      savingOrg: false,
      teacherRecordId: null
    }
  },

  async mounted() {
    const currentUserUid = JSON.parse(localStorage.currentUser).uid
    let teacherRecord = await firestore
      .collection('teachers')
      .where('uid', '==', currentUserUid)
      .get()

    if (teacherRecord.docs.length > 0) {
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

    if (teacherRecord.clubs === undefined) {
      // User account exists but they don't have an org so ask them to create one
      this.createClub = true
      this.loading = false
    } else if (teacherRecord.clubs.length === 1) {
      // Just one so just use that one and move on
      const club = await firestore
        .collection('clubs')
        .doc(teacherRecord.clubs[0])
        .get()

      const clubData = club.data()
      localStorage.group = JSON.stringify({
        id: club.id,
        name: clubData.name,
        entryFormId: clubData.entryFormId,
        entryFormEnabled: clubData.entryFormEnabled,
        entryFormMessage: clubData.entryFormMessage
      })
      this.$router.push('/teacher')
    } else {
      // There's more than one so we need to ask which one the user wants to use
      // TODO - allow user to pick their org while also allowing to create a new one
      this.pickOrg = true
      this.loading = false
    }
  },

  methods: {
    async addOrg() {
      if (!this.$refs.form.validate()) {
        return
      }

      this.savingOrg = true
      const entryId = uuidv4().substring(0, 8)
      const currentUserUid = JSON.parse(localStorage.currentUser).uid
      const newClub = await firestore.collection('clubs').add({
        name: this.clubName,
        description: this.clubDescription,
        teachers: [currentUserUid],
        uid: currentUserUid,
        entryFormId: entryId
      })

      await firestore
        .collection('teachers')
        .doc(this.teacherRecordId)
        .update({
          clubs: firebase.firestore.FieldValue.arrayUnion(newClub.id)
        })

      localStorage.org = JSON.stringify({
        id: newClub.id,
        name: this.clubName,
        entryFormId: entryId
      })
      this.$router.push('/')

      this.savingOrg = false
    }
  }
}
</script>
