import { Component } from 'preact'
import { getUserCourses } from '../moodle'
import { Link } from 'preact-router'

const courseLink = (id) => `/course/${id}`

const Course = ({ course }) => {
  return (
    <li class='item'>
      <Link href={courseLink(course.id)}>
        {course.fullname}
      </Link>
    </li>
  )
}

export class Courses extends Component {
  componentDidMount () {
    const { token, userId } = this.props

    getUserCourses(token, userId)
      .then((courses) => {
        this.setState({ courses })
      })
  }

  // noinspection JSCheckFunctionSignatures
  render (_, { courses = [] }) {
    return (
      <div>
        <h1>Kurse</h1>
        <ul class='course-list'>
          {courses.map((course) => <Course course={course} />)}
        </ul>
      </div>
    )
  }
}
