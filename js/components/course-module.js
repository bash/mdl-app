import { DefaultModule } from './modules/default'
import { FolderModule } from './modules/folder'
import { FileModule } from './modules/file'
import { UrlModule } from './modules/url'

const modulesToComponent = {
  folder: FolderModule,
  resource: FileModule,
  url: UrlModule
}

export const CourseModule = ({ module, token }) => {
  const moduleName = module.modname

  const Component = modulesToComponent.hasOwnProperty(moduleName)
    ? modulesToComponent[moduleName]
    : DefaultModule

  return <Component module={module} token={token} />
}
