export default function({ store, redirect, route }) {
  if (
    !localStorage.currentUser &&
    route.name !== 'login' &&
    route.name !== 'clubsetup'
  ) {
    if (route.name === 'student-invite-id') {
      redirect(`/login?invite=${route.params.id}`)
    } else {
      redirect('/login')
    }
  }
}
