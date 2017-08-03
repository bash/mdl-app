export const ModuleWrap = ({ module, children }) => {
  const classNames = `course-module -indent-${module.indent}`

  return (
    <li class={classNames} data-mod-name={module.modname}>
      {children}
    </li>
  )
}
