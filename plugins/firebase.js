import { auth } from '~/services/fireinit.js'

export default (context) => {
  auth.onAuthStateChanged((user) => {
    // user.getIdTokenResult().then(console.log)
    context.store.commit('user/setUser', user)
  })
}
