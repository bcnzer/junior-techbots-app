<template>
  <v-layout column justify-center align-center>
    <v-flex xs12>
      <div class="text-center my-5">
        <v-img src="bots/bot5.png" width="128"></v-img>
      </div>
    </v-flex>
    <v-flex xs12>
      <div class="headline">
        Teacher site for managing classes, students and the projects they will
        work on
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  layout: 'teacher',

  head() {
    return { title: 'Classes' }
  },

  data: () => ({
    he: true
  })
}
</script>
