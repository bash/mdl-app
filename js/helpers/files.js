export const fileUrl = (url, token) => {
  const parsedUrl = new window.URL(url)

  if (parsedUrl.protocol === 'data:') return parsedUrl

  // fix weird encoded pathnames
  let pathname = decodeURIComponent(parsedUrl.pathname)

  if (!pathname.startsWith('/webservice/pluginfile')) {
    pathname = pathname.replace('/pluginfile.php', '/webservice/pluginfile.php')
  }

  parsedUrl.pathname = pathname

  parsedUrl.searchParams.set('token', token)
  parsedUrl.searchParams.delete('forcedownload')

  return parsedUrl
}

export const shouldIgnoreFile = (filename) => {
  if (filename.startsWith('._')) return true

  return false
}
