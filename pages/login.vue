<template lang="html">
  <div>
    <v-row align="center" justify="center" class="mt-5">
      <v-img src="/bots/bot5.png" max-width="128"></v-img>
    </v-row>
    <v-row align="center" justify="center" class="mt-5 mb-2">
      <div class="display-1">Junior Techbot</div>
    </v-row>
    <v-row align="center" justify="center">
      <div class="display-2 mb-5">Teacher</div>
    </v-row>
    <v-row align="center" justify="center">
      <div id="firebaseui-auth-container" />
    </v-row>
  </div>
</template>

<script>
import * as firebase from 'firebase/app'
import 'firebase/auth'
import * as firebaseui from 'firebaseui'
import { auth } from '@/services/fireinit.js'

export default {
  layout: 'minimal',

  mounted() {
    const authui = new firebaseui.auth.AuthUI(auth)

    const uiConfig = {
      signInSuccessUrl: '/org',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    }

    authui.start('#firebaseui-auth-container', uiConfig)
  }
}
</script>
