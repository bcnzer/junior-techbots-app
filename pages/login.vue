<template lang="html">
  <div>
    <v-row align="center" justify="center" class="mt-5">
      <v-img src="/bots/bot5.png" max-width="128"></v-img>
    </v-row>
    <v-row align="center" justify="center" class="my-5">
      <div class="display-1">Junior Techbot</div>
    </v-row>
    <v-row align="center" justify="center">
      <v-btn @click="googleSignIn" color="white">
        <v-img
          height="18"
          width="18"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          class="mr-3"
        ></v-img>
        Sign in with Google
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import * as firebase from 'firebase/app'
// import { authui } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  methods: {
    googleSignIn() {
      this.provider = new firebase.auth.GoogleAuthProvider()
      firebase
        .auth()
        .signInWithPopup(this.provider)
        .then((result) => {
          if (this.$route.query.redirect === 'clubsetup') {
            this.$router.push('/clubsetup')
          } else if (this.$route.query.invite) {
            this.$router.push(`/student/invite/${this.$route.query.invite}`)
          } else {
            this.$router.push('/')
          }
        })
        .catch((error) => {
          this.$sentry.captureException(error)
          console.log(error)
        })
    }
  }
}
</script>
