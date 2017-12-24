import { extract } from '../raw-html/extract'
import { RawHtml } from '../raw-html/render'
import { CourseModule } from './course-module'

/** when all modules are indented, we remove the indentation common to all modules */
const normalizeIndentation = (modules) => {
  const commonIndent = Math.min(...modules.map(({ indent }) => indent))

  return modules.map((module) => {
    return { ...module, indent: module.indent - commonIndent }
  })
}

const Label = ({ label, token }) => {
  const items = extract(label.description || '')

  return (
    <header class='header'>
      <RawHtml items={items} token={token} promoteFirst />
    </header>
  )
}

export const CourseSection = ({ label, modules, token }) => {
  const normalizedModules = normalizeIndentation(modules)

  // TODO: change css class name
  return (
    <section class='course-module-group'>
      {label && <Label label={label} token={token} />}
      <ul class='modules'>
        {normalizedModules.map((module) => <CourseModule module={module} token={token} />)}
      </ul>
    </section>
  )
}
