import { FileTextIcon } from '../components/icons/file-text'
import { ImageIcon } from '../components/icons/image'
import { Volume2Icon } from '../components/icons/volume-2'
import { FileIcon } from '../components/icons/file'
import { PackageIcon } from '../components/icons/package'
import { FilmIcon } from '../components/icons/film'
import { PdfIcon } from '../components/icons/pdf'

const mimeTypeToIcon = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileTextIcon,
  'application/msword': FileTextIcon,
  'text/plain': FileTextIcon,
  'application/zip': PackageIcon,
  'application/x-rar-compressed': PackageIcon,
  'application/pdf': PdfIcon
}

export const fileIconComponent = (mimeType) => {
  if (mimeTypeToIcon.hasOwnProperty(mimeType)) return mimeTypeToIcon[mimeType]
  if (mimeType && mimeType.startsWith('image/')) return ImageIcon
  if (mimeType && mimeType.startsWith('text/')) return FileTextIcon
  if (mimeType && mimeType.startsWith('audio/')) return Volume2Icon
  if (mimeType && mimeType.startsWith('video/')) return FilmIcon

  return FileIcon
}

export const fileUrl = (url, token) => {
  const parsedUrl = new window.URL(url)

  if (parsedUrl.protocol === 'data:') return parsedUrl

  parsedUrl.searchParams.set('token', token)
  parsedUrl.searchParams.delete('forcedownload')

  return parsedUrl
}
