export const CourseModuleTitle = ({ module }) => {
  return (
    <span class='course-module-title' title={module.name}>
      <img class='image' src={module.modicon} alt={module.modplural} />
      <span class='name'>{module.name}</span>
    </span>
  )
}

export const LinkedCourseModuleTitle = ({ module }) => {
  return (
    <a href={module.url} title={module.name}>
      <CourseModuleTitle module={module} />
    </a>
  )
}
