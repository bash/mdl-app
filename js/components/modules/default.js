import { LinkedCourseModuleTitle } from '../course-module-title'
import { ModuleWrap } from './wrap'

export const DefaultModule = ({ module }) => {
  return (
    <ModuleWrap module={module}>
      <LinkedCourseModuleTitle module={module} />
    </ModuleWrap>
  )
}
