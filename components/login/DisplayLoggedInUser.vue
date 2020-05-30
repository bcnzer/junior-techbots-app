<template>
  <div>
    <div v-if="currentUser">
      <div v-if="!hideText">
        Junior Techbots uses Google to sign in. {{ additionalMessage }}
      </div>
      <v-list>
        <v-list-item>
          <v-list-item-avatar class="mr-5">
            <v-img :src="currentUserPhoto"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              v-html="currentUserDisplayName"
            ></v-list-item-title>
            <v-list-item-subtitle
              v-html="currentUserEmail"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <div v-if="!hideText">
        If you have multiple Google accounts, click here to sign in and pick one
      </div>
    </div>
    <div v-else>
      <div v-if="!hideText">
        Please login with your Google account
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisplayLoggedInUser',

  props: {
    currentUser: {
      type: Object,
      default: null
    },
    additionalMessage: {
      type: String,
      default: null
    },
    hideText: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    currentUserPhoto() {
      if (!this.currentUser) return
      return this.currentUser.photoURL
    },
    currentUserDisplayName() {
      if (!this.currentUser) return
      return this.currentUser.displayName
    },
    currentUserEmail() {
      if (!this.currentUser) return
      return this.currentUser.email
    }
  }
}
</script>
