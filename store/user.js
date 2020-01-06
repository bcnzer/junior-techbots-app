import { auth } from '@/services/fireinit.js'
export const state = () => ({
  currentUserId: null
})

export const mutations = {
  setUser(state, newUser) {
    if (newUser == null) {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('org')
      state.currentUserId = null
    } else {
      localStorage.currentUser = JSON.stringify({
        displayName: newUser.displayName,
        email: newUser.email,
        uid: newUser.uid,
        photoURL: newUser.photoURL,
        emailVerified: newUser.emailVerified
      })
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
