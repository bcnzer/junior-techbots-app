<template>
  <v-snackbar v-model="show" :bottom="true" :timeout="3000">
    {{ message }}
    <v-btn @click="show = false" color="primary">
      Close
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Snackbar',

  data: () => ({
    show: false,
    message: ''
  }),

  created() {
    // Use the snackbar by setting a text string via the store (as seen in the commit below)
    this.$store.watch(
      (state) => state.snackbar.snack,
      () => {
        const msg = this.$store.state.snackbar.snack
        if (msg !== '') {
          this.show = true
          this.message = this.$store.state.snackbar.snack
          this.$store.commit('snackbar/setSnack', '')
        }
      }
    )
  }
}
</script>
