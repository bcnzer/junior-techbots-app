import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/analytics'
import 'firebase/performance'
import 'firebase/storage'

const firebaseConfig =
  process.env.NODE_ENV === 'production'
    ? {
        apiKey: 'AIzaSyCbobsqPSkxwZvGTH9tpfDKf_YkZxWVhYI',
        authDomain: 'junior-techbots.firebaseapp.com',
        databaseURL: 'https://junior-techbots.firebaseio.com',
        projectId: 'junior-techbots',
        storageBucket: 'junior-techbots.appspot.com',
        messagingSenderId: '73508477942',
        appId: '1:73508477942:web:31b7275be36292371885d7',
        measurementId: 'G-2ZHG2KRZY3'
      }
    : {
        apiKey: 'AIzaSyCpMgVp8QgtZGSCq2AKjWVIiUbtQmsa1wA',
        authDomain: 'junior-techbots-staging.firebaseapp.com',
        databaseURL: 'https://junior-techbots-staging.firebaseio.com',
        projectId: 'junior-techbots-staging',
        storageBucket: 'junior-techbots-staging.appspot.com',
        messagingSenderId: '68735873522',
        appId: '1:68735873522:web:d281a895c70030be137b6b',
        measurementId: 'G-M7T3CFNF74'
      }

// Initialize Firebase

// eslint-disable-next-line no-unused-vars
let app = null
if (!firebase.apps.length) {
  // eslint-disable-next-line no-console
  app = firebase.initializeApp(firebaseConfig)
}

firebase.analytics()
export const auth = firebase.auth()
export const firestore = firebase.firestore()
export const perf = firebase.performance()
export const storage = firebase.storage()
export default firebase
