import { Component } from 'preact'
import { getCourse, getCourseContents } from '../moodle'
import { CourseModule } from './course-module'
import { parseSummary } from '../helpers'
import { fileUrl } from '../helpers/files'
import { extract } from '../raw-html/extract'

const sectionId = (id) => `section-${id}`

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
    <div class='course-summary block-content'>
      {items.map((item) => <Item item={item} token={token} />)}
    </div>
  )
}

// TODO: rename and move
// TODO: experiment with making first block h3
const Item = ({ item, token }) => {
  if (item.type === 'block') {
    return <p>{item.value}</p>
  }

  if (item.type === 'list') {
    return <ul>{item.items.map((value) => <li>{value}</li>)}</ul>
  }

  if (item.type === 'image') {
    return <img src={fileUrl(item.src, token)} alt={item.alt} title={item.title} />
  }

  console.warn('item not recognized', item)
}

// TODO: rename
const Label = ({ label, token }) => {
  const items = extract(label.description || '')
  const firstItem = items[0]

  if (firstItem && firstItem.type === 'block') {
    return (
      <header class='header block-content'>
        <h3 class='title'>{firstItem.value}</h3>
        {items.slice(1).map((item) => <Item item={item} token={token} />)}
      </header>
    )
  }

  return (
    <header class='header block-content'>
      {items.map((item) => <Item item={item} token={token} />)}
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

  if (section.modules.length === 0) return null

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

export class Course extends Component {
  componentDidMount () {
    const { token, userId, id } = this.props

    getCourse(token, userId, id)
      .then((course) => this.setState({ course }))

    getCourseContents(token, id)
      .then((contents) => this.setState({ contents }))
  }

  // noinspection JSCheckFunctionSignatures
  render ({ id, token }, { course, contents = [] }) {
    if (course == null) {
      return (
        <article>
          <header class='course-header'>
            <h1>Kurs {id}</h1>
            <p>Wird geladen...</p>
          </header>
        </article>
      )
    }

    const summary = parseSummary(course.summary)

    return (
      <article>
        <header class='course-header'>
          <h1>{course.fullname}</h1>
          <p>{summary.text}</p>
        </header>
        {contents.map((section) => <CourseSection section={section} token={token} />)}
      </article>
    )
  }
}
