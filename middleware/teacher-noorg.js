export default function({ store, redirect, route }) {
  if (
    route.name &&
    route.name.startsWith('teacher') &&
    route.name !== 'teacher-org' &&
    localStorage.org === undefined
  ) {
    // It's important I don't redirect if it's the teacher org site or else I end up in an infinite loop
    console.log(route)
    console.log(localStorage.org === undefined)
    redirect('/teacher/org')
  }
}
