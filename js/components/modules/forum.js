import { MessageSquareIcon } from '../icons/message-square'
import { ModuleWrap } from './wrap'

export const ForumModule = ({ module }) => {
  return (
    <ModuleWrap module={module}>
      <a href={module.url} title={module.title}>
        <span class='course-module-title'>
          <MessageSquareIcon class='image' size='24' />
          <span class='name'>{module.name}</span>
        </span>
      </a>
    </ModuleWrap>
  )
}
