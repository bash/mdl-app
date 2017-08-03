import { LinkIcon } from '../icons/link'
import { ModuleWrap } from './wrap'

export const UrlModule = ({ module }) => {
  const link = module.contents[0]

  return (
    <ModuleWrap module={module}>
      <a href={link.fileurl} title={module.name}>
        <span class='course-module-title'>
          <LinkIcon class='image' size='24' />
          <span class='name'>{module.name}</span>
        </span>
      </a>
    </ModuleWrap>
  )
}
