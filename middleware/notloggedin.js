export default function({ store, redirect, route }) {
  if (!localStorage.currentUser && route.name !== 'login') {
    redirect('/login')
  }
}
