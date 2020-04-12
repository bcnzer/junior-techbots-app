<template>
  <v-app>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      title: 'Login type'
    }
  },

  head() {
    return {
      title: this.title
    }
  }
}
</script>
