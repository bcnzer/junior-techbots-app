<template>
  <v-app>
    <v-content>
      <v-container>
        <v-alert v-if="showWarning" type="warning">
          You are using a test environment. All usage is being recorded in
          detail
        </v-alert>
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  head() {
    return {
      title: 'Login type'
    }
  },

  computed: {
    showWarning() {
      return new URL(window.location.href).host === 'staging.juniortechbots.com'
    }
  }
}
</script>
