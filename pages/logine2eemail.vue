<template lang="html">
  <div>
    <v-row align="center" justify="center" class="mt-5">
      <v-img src="/bots/bot5.png" max-width="128"></v-img>
    </v-row>
    <v-row align="center" justify="center" class="my-5">
      <div class="display-2">Junior Techbots</div>
    </v-row>
    <v-row align="center" justify="center" class="my-5">
      <div class="display-1">Email login</div>
    </v-row>
  </div>
</template>

<script>
import * as firebase from 'firebase/app'

export default {
  layout: 'minimal',

  async mounted() {
    if (location.hostname !== 'localhost') {
      this.$router.push('/login')
    }

    // NOTE - the moment I sign in anonymously the DB is set to my remote DB. Not my
    // local emulator, which sucks. As such I MUST use my online staging DB and
    // not the emulator
    localStorage.anonymousLogin = true
    await firebase
      .auth()
      .signInWithEmailAndPassword(
        localStorage.loginUsername,
        localStorage.loginPassword
      )

    localStorage.removeItem('loginUsername')
    localStorage.removeItem('loginPassword')
  }
}
</script>
