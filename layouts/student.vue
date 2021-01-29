<template>
  <v-app>
    <!-- top menu of the app -->
    <v-app-bar fixed app>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" text x-large>
            {{ clubName }}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
              class="v-icon__svg"
            >
              <path d="M7,10L12,15L17,10H7Z"></path>
            </svg>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, index) in menuItems" :key="index">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-spacer />
      <v-btn v-if="showWarning" depressed small color="warning"
        >testing mode - usage is being recorded</v-btn
      >
      <user-avatar />
    </v-app-bar>

    <!-- main part of the app -->
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import userAvatar from '~/components/toolbar/useravatar'

export default {
  components: {
    userAvatar
  },

  data() {
    return {
      drawer: true,
      menuItems: [
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me 2' }
      ],
      items: [
        {
          icon: 'mdi-account-multiple',
          title: 'Groups',
          to: '/teacher/groups',
          datacy: 'menuGroup'
        },
        {
          icon: 'mdi-library',
          title: 'Lessons',
          to: '/teacher/lessons',
          datacy: 'menuLessons'
        },
        {
          icon: 'mdi-school',
          title: 'Students',
          to: '/teacher/students',
          datacy: 'menuStudents'
        },
        {
          icon: 'mdi-star',
          title: 'Achievements',
          to: '/teacher/achievements',
          datacy: 'menuAchievements'
        }
      ],
      miniVariant: false,
      title: 'Junior Techbots',
      bottomItems: [
        { icon: 'mdi-cog-outline', title: 'Settings', to: '/settings' },
        { icon: 'mdi-help-circle', title: 'Help', to: '/help' }
      ]
    }
  },

  computed: {
    clubName() {
      return JSON.parse(localStorage.club).name
    },
    showWarning() {
      return new URL(window.location.href).host === 'staging.juniortechbots.com'
    }
  }
}
</script>
