<template>
  <v-app>
    <!-- side menu -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      fixed
      app
      dark
    >
      <v-layout column fill-height>
        <v-list>
          <v-list-item key="teacher" to="/">
            <v-list-item-action>
              <img
                src="~/static/logo32x32.png"
                width="24"
                alt="Junior Techbots"
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title class="amber--text">
                Junior Techbots
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.to"
            clipped="true"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-spacer />

        <v-list>
          <v-list-item
            v-for="(item, i) in bottomItems"
            :to="item.to"
            :key="i"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-btn @click.stop="miniVariant = !miniVariant">
          <v-icon
            v-html="miniVariant ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          />
        </v-btn>
      </v-layout>
    </v-navigation-drawer>

    <!-- top menu of the app -->
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="clubName" />
      <v-spacer />
      <v-btn v-if="showWarning" depressed small color="warning"
        >testing mode - usage is being recorded</v-btn
      >
      <user-avatar />
    </v-app-bar>

    <!-- main part of the app -->
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
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
      items: [
        {
          icon: 'mdi-library',
          title: 'Lessons',
          to: '/teacher/lessons'
        },
        {
          icon: 'mdi-account-multiple',
          title: 'Groups',
          to: '/teacher/groups'
        },
        {
          icon: 'mdi-school',
          title: 'Students',
          to: '/teacher/students'
        },
        {
          icon: 'mdi-star',
          title: 'Achievements',
          to: '/teacher/achievements'
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
