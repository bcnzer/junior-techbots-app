export default function({ store, redirect, route }) {
  if (
    route.name &&
    route.name.startsWith('teacher') &&
    route.name !== 'teacher-club' &&
    localStorage.group === undefined
  ) {
    // It's important I don't redirect if it's the teacher group site or else I end up in an infinite loop
    redirect('/teacher/club')
  }
}
