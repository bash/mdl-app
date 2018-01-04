import { Component } from 'preact'
import { getCourse, getCourseContents, getCourseUrl, canSelfEnrol, enrolSelf } from '../moodle'
import { parseSummary } from '../helpers'
import { CourseTopic } from './course-topic'

const DEFAULT_SUMMARY = 'Beschreiben Sie kurz und prägnant, worum es in diesem Kurs geht.'

const CourseState = {
  LOADING: 'LOADING',
  NOT_FOUND: 'NOT_FOUND',
  CAN_ENROL: 'CAN_ENROL',
  LOADED: 'LOADED'
}

const fetchCourse = (token, userId, id) => {
  const course = getCourse(token, userId, id)
  const contents = getCourseContents(token, id)

  const canEnrol = Promise.all([course, contents])
                          .then(([course, contents]) => {
                            if (course != null) return false
                            if (contents != null) return false

                            return canSelfEnrol(token, id)
                          })

  return Promise.all([course, contents, canEnrol])
                .then(([course, contents, canEnrol]) => {
                  return { course, contents, canEnrol }
                })
}

const BlobButton = ({ state }) => {
  const raw = JSON.stringify(state, null, 2)
  const blob = new window.Blob([raw], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)

  return (
    <a href={url} class='form-button'>
      Show Blob
    </a>
  )
}

const MoodleLinkButton = ({ id }) => {
  return (
    <a href={getCourseUrl(id)} class='form-button'>
      In Moodle anzeigen
    </a>
  )
}

const Loading = ({ id }) => {
  return (
    <article>
      <header class='course-header'>
        <h1>Kurs {id}</h1>
        <p>Wird geladen...</p>
      </header>
    </article>
  )
}

const Enrol = ({ id, onEnrol }) => {
  return (
    <article>
      <header class='course-header'>
        <h1>Kurs {id}</h1>
        <p>Einschreiben möglich</p>
        <nav class='buttons'>
          <MoodleLinkButton id={id} />
          <button onClick={onEnrol} class='form-button'>
            Einschreiben
          </button>
        </nav>
      </header>
    </article>
  )
}

const Debug = ({ state }) => {
  return (
    <div>
      <header class='course-header'>
        <nav class='buttons'>
          <BlobButton state={state} />
        </nav>
      </header>
      <pre style='font-family: monospace; overflow: auto'>
        {JSON.stringify(state, null, 4)}
      </pre>
    </div>
  )
}

const NotFound = ({ id }) => {
  return (
    <article>
      <header class='course-header'>
        <h1>Kurs {id}</h1>
        <p>Nicht gefunden</p>
      </header>
    </article>
  )
}

const CourseDetails = ({ id, token, course, contents = [] }) => {
  const summary = parseSummary(course.summary)
  const shouldShowSummary = summary && summary.text && !summary.text.includes(DEFAULT_SUMMARY)

  return (
    <article>
      <header class='course-header'>
        <h1>{course.fullname}</h1>
        <p>{shouldShowSummary && summary.text}</p>
        <nav class='buttons'>
          <MoodleLinkButton id={id} />
        </nav>
      </header>
      {contents.map((topic) => <CourseTopic topic={topic} token={token} />)}
    </article>
  )
}

export class Course extends Component {
  constructor (props, context) {
    super(props, context)

    this.setState({ state: CourseState.LOADING })
  }

  componentDidMount () {
    this._fetch()
  }

  _fetch () {
    const { token, userId, id } = this.props

    // early return for NaN values (for invalid routes)
    if (Number.isNaN(id)) {
      this.setState({ state: CourseState.NOT_FOUND })
      return
    }

    return fetchCourse(token, userId, id)
      .then(({ course, contents, canEnrol }) => {
        const state = (() => {
          if (canEnrol) return CourseState.CAN_ENROL

          // immediately after enrolling the course is not yet available in the list
          // but it's contents can be fetched... we want to prevent a not found in that case
          if (course == null && contents == null) return CourseState.NOT_FOUND

          return CourseState.LOADED
        })()

        this.setState({ state, course, contents })
      })
  }

  _onEnrol () {
    const { token, id } = this.props

    this.setState({ state: CourseState.LOADING })

    return enrolSelf(token, id)
             .then(() => this._fetch())
  }

  render ({ id, token, debug }, { course, contents = [], state }) {
    if (debug) return <Debug state={{id, token, debug, ...this.state}} />

    switch (state) {
      case CourseState.LOADING:
        return <Loading id={id} />
      case CourseState.CAN_ENROL:
        return <Enrol id={id} onEnrol={() => this._onEnrol()} />
      case CourseState.NOT_FOUND:
        return <NotFound id={id} />
    }

    return <CourseDetails id={id} token={token} course={course} contents={contents} />
  }
}
