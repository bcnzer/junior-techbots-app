export default function({ store, redirect, route }) {
  if (
    route.name.startsWith('teacher') &&
    (!localStorage.orgName || !localStorage.orgId)
  ) {
    redirect('/teacher/org')
  }
}
