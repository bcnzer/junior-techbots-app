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
          <v-img src="bot-hi.png" width="256" class="mx-auto"></v-img>
          <div class="display-1 mt-5">
            Enter the name of your org, school or club
          </div>
          <div class="body-1 my-2">
            You will be able to create multiple classes under this organization
          </div>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="orgName"
              :rules="[(v) => !!v || 'Name is required']"
              :disabled="savingOrg"
              placeholder="Example: Discovery School Code Club"
              required
              class="mt-3"
            ></v-text-field>
            <v-textarea
              v-model="orgDescription"
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
import firebase from 'firebase/app'
import uuidv4 from 'uuid/v4'
import { firestore } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  head() {
    return { title: 'Teacher Org' }
  },

  data() {
    return {
      valid: false,
      orgName: null,
      orgDescription: null,
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
      teacherRecord = await firestore.collection('teachers').add({
        uid: currentUserUid
      })
      this.teacherRecordId = teacherRecord.id
      teacherRecord = teacherRecord.docs[0].data()
    }

    if (teacherRecord.organizations === undefined) {
      // User account exists but they don't have an org so ask them to create one
      this.createOrg = true
      this.loading = false
    } else if (teacherRecord.organizations.length === 1) {
      // Just one so just use that one and move on
      const org = await firestore
        .collection('organizations')
        .doc(teacherRecord.organizations[0])
        .get()

      localStorage.orgId = org.id
      localStorage.orgName = org.data().name
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
      const newOrg = await firestore.collection('organizations').add({
        name: this.orgName,
        description: this.orgDescription,
        teachers: [localStorage.currentUser.uid],
        uid: localStorage.currentUser.uid,
        entryFormId: uuidv4().substring(0, 8)
      })

      // Add a default class, so that there is at least one
      await firestore
        .collection('organizations')
        .doc(newOrg.id)
        .collection('classes')
        .add({ name: 'default' })

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
