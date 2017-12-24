import { FileTextIcon } from './icons/file-text'
import { ImageIcon } from './icons/image'
import { Volume2Icon } from './icons/volume-2'
import * as fileIconImport from './icons/file'
import { PackageIcon } from './icons/package'
import { FilmIcon } from './icons/film'
import { PdfIcon } from './icons/pdf'

const mimeTypeToIcon = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileTextIcon,
  'application/msword': FileTextIcon,
  'text/plain': FileTextIcon,
  'application/zip': PackageIcon,
  'application/x-rar-compressed': PackageIcon,
  'application/pdf': PdfIcon
}

const fileIconComponent = (mimeType) => {
  if (mimeTypeToIcon.hasOwnProperty(mimeType)) return mimeTypeToIcon[mimeType]
  if (mimeType && mimeType.startsWith('image/')) return ImageIcon
  if (mimeType && mimeType.startsWith('text/')) return FileTextIcon
  if (mimeType && mimeType.startsWith('audio/')) return Volume2Icon
  if (mimeType && mimeType.startsWith('video/')) return FilmIcon

  return fileIconImport.FileIcon
}

export const FileIcon = ({ mimeType, ...props }) => {
  const Icon = fileIconComponent(mimeType)

  return <Icon {...props} />
}
