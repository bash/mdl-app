import { DefaultModule } from './modules/default'
import { FolderModule } from './modules/folder'
import { FileModule } from './modules/file'
import { UrlModule } from './modules/url'
import { ForumModule } from './modules/forum'

const modulesToComponent = {
  folder: FolderModule,
  resource: FileModule,
  url: UrlModule,
  forum: ForumModule
}

export const CourseModule = ({ module, token }) => {
  const moduleName = module.modname

  const Component = modulesToComponent.hasOwnProperty(moduleName)
    ? modulesToComponent[moduleName]
    : DefaultModule

  return <Component module={module} token={token} />
}
