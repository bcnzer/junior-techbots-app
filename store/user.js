import { auth } from '@/services/fireinit.js'

export const state = () => ({
  currentUserId: null
})

export const mutations = {
  setUser(state, newUser) {
    localStorage.removeItem('org') // Doing this temporarily, for my test users
    if (newUser == null) {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('club')
      state.currentUserId = null
    } else {
      const userToSave = {
        displayName: newUser.displayName,
        email: newUser.email,
        uid: newUser.uid,
        photoURL: newUser.photoURL,
        emailVerified: newUser.emailVerified
      }

      // if (localStorage.anonymousLogin) {
      //   // Anonymous login does not have the following information, which we need elsewhere such as the
      //   // club setup and the main screen, so I always bung in the same details
      //   userToSave.displayName = 'LocalTester Chartrand'
      //   userToSave.email = 'mytestemail@gmail.com'
      //   userToSave.photoURL =
      //     'https://lh3.googleusercontent.com/a-/AOh14Ghd0zqWpSJxEJOPcyZ2BLdyuInhvfWsLbA_O67-'
      // }
      localStorage.currentUser = JSON.stringify(userToSave)
      state.currentUserId = newUser.uid
    }
  }
}

export const actions = {
  signOut({ commit }) {
    auth
      .signOut()
      .then(() => {
        commit('setUser', null)
      })
      .catch((error) => {
        this.$sentry.captureException(error)
      })
  }
}
