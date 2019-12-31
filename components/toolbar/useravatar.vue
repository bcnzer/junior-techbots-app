<template>
  <div v-if="user" class="text-xs-center">
    <v-menu :close-on-content-click="false" offset-x>
      <template v-slot:activator="{ on }">
        <v-btn slot="activator" v-on="on" icon>
          <v-avatar v-if="user.photoURL" size="32">
            <img :src="user.photoURL" />
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-img
          v-if="user.photoURL"
          :src="user.photoURL"
          alt="Junior Techbot"
          width="256"
        ></v-img>
        <v-card-title>
          {{ displayName }}
        </v-card-title>
        <v-card-text v-if="user.email">
          <div>
            {{ user.email }}
          </div>
        </v-card-text>
        <v-divider />
        <v-spacer />

        <v-card-actions>
          <v-btn @click="signOut" class="ml-2 my-1">
            Sign out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',

  computed: {
    user() {
      return JSON.parse(localStorage.currentUser)
    },
    displayName() {
      const currentUser = JSON.parse(localStorage.currentUser)
      if (currentUser) {
        return currentUser.displayName
      }

      return null
    }
  },

  methods: {
    signOut() {
      this.$store.dispatch('user/signOut').then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>
