export default function({ store, redirect, route }) {
  if (
    !localStorage.currentUser &&
    route.name !== 'login' &&
    route.name !== 'logine2eanonymous' &&
    route.name !== 'logine2eemail' &&
    route.name !== 'clubsetup' &&
    route.name !== 'student-entry-id'
  ) {
    if (route.name === 'student-invite-id') {
      redirect(`/login?invite=${route.params.id}`)
    } else if (route.name === 'student-entry-id') {
      redirect(`/login?entryform=${route.params.id}`)
    } else {
      redirect('/login')
    }
  }
}
