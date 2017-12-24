import { CourseSection } from './course-section'
import { extract } from '../raw-html/extract'
import { RawHtml } from '../raw-html/render'

const topicId = (id) => `topic-${id}`

/** Devides modules into sections (every label generates a new section) */
const moduleSections = (modules) => {
  const reducer = (groups, module) => {
    if (module.modname === 'label') {
      return [...groups, { label: module, modules: [] }]
    }

    const last = groups.pop()

    return [...groups, {
      label: last.label,
      modules: [...last.modules, module]
    }]
  }

  return modules.reduce(reducer, [{ modules: [] }])
                .filter(({ modules }) => modules.length > 0)
}

const Summary = ({ summary = '', token }) => {
  const items = extract(summary)

  if (items.length === 0) return null

  return (
    <div class='summary'>
      <RawHtml items={items} token={token} />
    </div>
  )
}

export const CourseTopic = ({ topic, token }) => {
  const sections = moduleSections(topic.modules)

  // TODO: css class needs to be renamed
  return (
    <section class='course-section' id={topicId(topic.id)}>
      <header class='header'>
        <h2 class='title'>
          {topic.name}
        </h2>
        <Summary summary={topic.summary} token={token} />
      </header>
      {sections.map((section) => <CourseSection {...section} token={token} />)}
    </section>
  )
}
