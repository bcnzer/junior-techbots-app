<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12">
        <v-row align="center" justify="center">
          <v-skeleton-loader
            type="image, paragraph, button"
            min-width="300"
          ></v-skeleton-loader>
        </v-row>
      </v-col>
    </v-row>
    <v-row v-if="!loading && !validInvite" align="center" justify="center">
      <h1>Invalid invitation</h1>
    </v-row>
    <div v-if="!loading && validInvite">
      <v-img
        src="/bots/robots small.png"
        max-width="300"
        class="mx-auto my-5"
      ></v-img>
      <v-row>
        <div class="headline mx-auto">
          Are you sure you want to join
          <span class="font-weight-bold">{{ clubName }}</span
          >?
        </div>
      </v-row>
      <v-row>
        <div class="mx-auto mt-5">
          <v-btn
            @click="acceptInvite()"
            :disabled="saving"
            :loading="waitingYes"
            color="primary"
            class="mr-2"
            >Yes</v-btn
          >
          <v-btn
            @click="denyInvite()"
            :disabled="saving"
            :loading="waitingNo"
            class="ml-2"
            >No</v-btn
          >
        </div>
      </v-row>
    </div>
  </v-container>
</template>

<script>
// The form used by the email invite
import { firestore } from '@/services/fireinit.js'
import firebase from 'firebase/app'

export default {
  layout: 'minimal',

  head() {
    return { title: 'Invite' }
  },

  data() {
    return {
      loading: true,
      validInvite: false,
      studentId: null,
      inviteId: null,
      invite: null,
      saving: false,
      waitingYes: false,
      waitingNo: false
    }
  },

  computed: {
    clubName() {
      if (!this.invite) return null
      return this.invite.clubName
    }
  },

  async mounted() {
    if (this.$route.params.id) {
      const studentRecord = await firestore
        .collection('students')
        .where('email', '==', JSON.parse(localStorage.currentUser).email)
        .get()

      if (!studentRecord.empty) {
        this.studentId = studentRecord.docs[0].id
        console.log(this.studentId)
        const invite = await firestore
          .collection('students')
          .doc(this.studentId)
          .collection('invites')
          .where('inviteId', '==', this.$route.params.id)
          .get()

        if (!invite.empty) {
          this.inviteId = invite.docs[0].id
          this.invite = invite.docs[0].data()
          this.validInvite = true
        }
      }
    }

    this.loading = false
  },

  methods: {
    async acceptInvite() {
      // Add the org to the student's list or clubs and delete the invite
      this.saving = true
      this.waitingYes = true

      const userInfo = JSON.parse(localStorage.currentUser)
      console.log(userInfo)

      await firestore
        .collection('students')
        .doc(this.studentId)
        .update({
          clubs: firebase.firestore.FieldValue.arrayUnion(this.invite.clubId),
          photoURL: userInfo.photoURL,
          displayName: userInfo.displayName,
          uid: userInfo.uid
        })

      await firestore
        .collection('students')
        .doc(this.studentId)
        .collection('invites')
        .doc(this.inviteId)
        .delete()

      this.$router.push('/student')
    },

    async denyInvite() {
      // Delete the invite record and redirect
      this.saving = true
      this.waitingNo = true

      await firestore
        .collection('students')
        .doc(this.studentId)
        .collection('invites')
        .doc(this.inviteId)
        .delete()

      this.$router.push('/')
    }
  }
}
</script>
