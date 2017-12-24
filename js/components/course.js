import { Component } from 'preact'
import { getCourse, getCourseContents, getCourseUrl, canSelfEnrol, enrolSelf } from '../moodle'
import { CourseModule } from './course-module'
import { parseSummary } from '../helpers'
import { extract } from '../raw-html/extract'
import { RawHtml } from '../raw-html/render'

const sectionId = (id) => `section-${id}`
const DEFAULT_DESCRIPTION = 'Beschreiben Sie kurz und prägnant, worum es in diesem Kurs geht.'

// TODO: this needs to be waaay more functional
const groupModules = (modules) => {
  const groups = []

  let label = null
  let groupedModules = []

  const commit = () => {
    if (groupedModules.length > 0) {
      groups.push({
        label, modules: groupedModules
      })
    }

    groupedModules = []
  }

  modules.forEach((module) => {
    if (module.modname === 'label') {
      commit()
      label = module
    } else {
      groupedModules.push(module)
    }
  })

  commit()

  return groups
}

const normalizeIndentation = (modules) => {
  if (modules.every((module) => module.indent > 0)) {
    return modules.map((module) => {
      return { ...module, indent: module.indent - 1 }
    })
  }

  return modules
}

const CourseSummary = ({ summary, token }) => {
  const items = extract(summary || '')

  if (items.length === 0) return null

  return (
    <div class='course-summary'>
      <RawHtml items={items} token={token} />
    </div>
  )
}

// TODO: rename
const Label = ({ label, token }) => {
  const items = extract(label.description || '')

  return (
    <header class='header'>
      <RawHtml items={items} token={token} promoteFirst />
    </header>
  )
}

const CourseModuleGroup = ({ label, modules, token }) => {
  modules = normalizeIndentation(modules)

  return (
    <section class='course-module-group'>
      {label && <Label label={label} token={token} />}
      <ul class='modules'>
        {modules.map((module) => <CourseModule module={module} token={token} />)}
      </ul>
    </section>
  )
}

const CourseSection = ({ section, token }) => {
  const groups = groupModules(section.modules)

  // if (section.modules.length === 0) return null

  return (
    <section class='course-section' id={sectionId(section.id)}>
      <h2 class='title'>
        {section.name}
      </h2>
      <CourseSummary summary={section.summary} token={token} />
      {groups.map(({ label, modules }) => <CourseModuleGroup label={label} modules={modules} token={token} />)}
    </section>
  )
}

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

export class Course extends Component {
  componentDidMount () {
    this._fetch()
  }

  _fetch () {
    const { token, userId, id } = this.props

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

  render ({ id, token, debug }, { course, contents = [], state = CourseState.LOADING }) {
    if (debug) {
      return (
        <div>
          <header class='course-header'>
            <nav class='buttons'>
              <BlobButton state={this.state} />
            </nav>
          </header>
          <pre style='font-family: monospace; overflow: auto'>
            {JSON.stringify(this.state, null, 4)}
          </pre>
        </div>
      )
    }

    switch (state) {
      case CourseState.LOADING:
        return (
          <article>
            <header class='course-header'>
              <h1>Kurs {id}</h1>
              <p>Wird geladen...</p>
            </header>
          </article>
        )
      case CourseState.CAN_ENROL:
        return (
          <article>
            <header class='course-header'>
              <h1>Kurs {id}</h1>
              <p>Einschreiben möglich</p>
              <nav class='buttons'>
                <a href={getCourseUrl(id)} class='form-button'>
                  In Moodle anzeigen
                </a>
                <button onClick={() => this._onEnrol()} class='form-button'>
                  Einschreiben
                </button>
              </nav>
            </header>
          </article>
        )
      case CourseState.NOT_FOUND:
        return (
          <article>
            <header class='course-header'>
              <h1>Kurs {id}</h1>
              <p>Nicht gefunden</p>
            </header>
          </article>
        )
    }

    const summary = course && parseSummary(course.summary)
    const shouldShowSummary = summary && summary.text && !summary.text.includes(DEFAULT_DESCRIPTION)

    return (
      <article>
        <header class='course-header'>
          <h1>{course.fullname}</h1>
          <p>{shouldShowSummary && summary.text}</p>
          <nav class='buttons'>
            <a href={getCourseUrl(id)} class='form-button'>
              In Moodle anzeigen
            </a>
          </nav>
        </header>
        {contents.map((section) => <CourseSection section={section} token={token} />)}
      </article>
    )
  }
}
