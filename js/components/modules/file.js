import { fileUrl } from '../../helpers/files'
import { ModuleWrap } from './wrap'
import { FileIcon } from '../file-icon'

export const FileModule = ({ module, token }) => {
  const file = module.contents[0]

  return (
    <ModuleWrap module={module}>
      <a href={fileUrl(file.fileurl, token)} title={module.name}>
        <span class='course-module-title'>
          <FileIcon mimeType={file.mimetype} class='image' size='24' />
          <span class='name'>{module.name}</span>
        </span>
      </a>
    </ModuleWrap>
  )
}
