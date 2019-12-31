<template>
  <v-layout>
    <v-flex text-xs-center>
      <h1>Logging out...</h1>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  layout: 'auth',

  mounted() {
    this.$store.dispatch('user/signOut').then(() => {
      this.$router.push('/login')
    })
  }
}
</script>
