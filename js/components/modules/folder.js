import { fileUrl, fileIconComponent } from '../../helpers/files'
import { FolderIcon } from '../icons/folder'
import { ModuleWrap } from './wrap'

const File = ({ file, token }) => {
  const Icon = fileIconComponent(file.mimetype)

  return (
    <li class='file'>
      <a href={fileUrl(file.fileurl, token)}>
        <Icon class='icon' />
        {file.filename}
      </a>
    </li>
  )
}

export const FolderModule = ({ module, token }) => {
  return (
    <ModuleWrap module={module}>
      <details class='course-module-box'>
        <summary class='summary'>
          <span class='course-module-title'>
            <FolderIcon class='image' size='24' />
            <span class='name'>{module.name}</span>
          </span>
        </summary>
        <div class='content'>
          <ul class='file-list'>
            {module.contents.map((file) => <File file={file} token={token} />)}
          </ul>
        </div>
      </details>
    </ModuleWrap>
  )
}
