<template>
  <v-btn @click="googleSignIn">
    <v-img height="18" width="18" src="/google.svg" class="mr-2"></v-img>
    Sign in with Google
  </v-btn>
</template>

<script>
export default {
  name: 'GoogleButton',

  methods: {
    googleSignIn() {
      this.$emit('on-google-sign-in')
    }
  }
}
</script>
