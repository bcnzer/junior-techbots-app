export default function({ store, redirect, route }) {
  if (
    route.name &&
    route.name.startsWith('teacher') &&
    !route.name !== 'teacher-org' &&
    (!localStorage.orgName || !localStorage.orgId)
  ) {
    // It's important I don't redirect if it's the teacher org site or else I end up in an infinite loop
    redirect('/teacher/org')
  }
}
