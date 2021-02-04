<template lang="html">
  <div>
    <v-row align="center" justify="center" class="mt-5">
      <v-img src="/bots/bot5.png" max-width="128"></v-img>
    </v-row>
    <v-row align="center" justify="center" class="my-5">
      <div class="display-2">Junior Techbots</div>
    </v-row>
    <v-row align="center" justify="center" class="my-5">
      <div class="display-1">Anonymous login</div>
    </v-row>
  </div>
</template>

<script>
import firebase from 'firebase/app'
export default {
  layout: 'minimal',
  async mounted() {
    if (location.hostname !== 'localhost') {
      this.$router.push('/login')
    }

    await this.$store.dispatch('user/signOut')
    await firebase
      .auth()
      .signInWithEmailAndPassword(
        'benchartrand+localhost@gmail.com',
        'localhost'
      )
  }
}
</script>
