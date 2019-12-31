import { auth } from '~/services/fireinit.js'

export default (context) => {
  auth.onAuthStateChanged((user) => {
    context.store.commit('user/setUser', user)
  })
}
