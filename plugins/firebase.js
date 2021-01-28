import { firestore, auth } from '~/services/fireinit.js'

export default (context) => {
  auth.onAuthStateChanged((user) => {
    context.store.commit('user/setUser', user)

    // Force the JWT to update if there is a change in claims information, which will then be picked up by rules
    firestore
      .collection('user_claims')
      .doc(user.uid)
      .onSnapshot(async () => {
        // force a refresh of the ID token, which will pick up new claims
        await user.getIdTokenResult(true)
      })
  })
}
