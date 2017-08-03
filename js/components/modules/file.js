import { fileIconComponent, fileUrl } from '../../helpers/files'
import { ModuleWrap } from './wrap'

export const FileModule = ({ module, token }) => {
  const file = module.contents[0]
  const Icon = fileIconComponent(file.mimetype)

  return (
    <ModuleWrap module={module}>
      <a href={fileUrl(file.fileurl, token)} title={module.name}>
        <span class='course-module-title'>
          <Icon class='image' size='24' />
          <span class='name'>{module.name}</span>
        </span>
      </a>
    </ModuleWrap>
  )
}
