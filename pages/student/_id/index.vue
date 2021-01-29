<template>
  <v-layout column justify-center align-center>
    <v-flex xs12>
      <div class="text-center my-5">
        <v-img src="../../bot-hi.png" width="256"></v-img>
      </div>
    </v-flex>
    <v-flex xs12>
      <div class="headline">
        Hello!
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  layout: 'student',

  head() {
    return { title: 'Student' }
  }
}
</script>
