<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row>
          <v-img
            class="my-5 mx-auto"
            max-width="300"
            src="/bots/robot-sorry2.png"
          ></v-img>
        </v-row>
        <v-row>
          <div class="display-1 mt-3 mx-auto">
            We're sorry, something went wrong
          </div>
        </v-row>
        <v-row>
          <div v-if="error.statusCode === 404" class="headline mt-3 mx-auto">
            Error: {{ pageNotFound }}
          </div>
          <div v-else class="headline mt-3 mx-auto">
            Error code {{ error.statusCode }}
          </div>
        </v-row>
        <v-row>
          <div class="mt-3 mx-auto">
            {{ errorDetail }}
          </div>
        </v-row>
        <v-row>
          <NuxtLink class="mt-3 mx-auto" to="/">
            Home page
          </NuxtLink>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },
  computed: {
    errorDetail() {
      if (location.hostname === 'localhost') {
        return this.error
      }
      return ''
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
