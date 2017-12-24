// noinspection SpellCheckingInspection
const MOODLE_HOST = 'moodle.bbbaden.ch'
// noinspection SpellCheckingInspection
const MOODLE_SERVICE = 'moodle_mobile_app'

const buildSearchParams = (params) => {
  const searchParams = new window.URLSearchParams()

  Object.entries(params)
    .forEach(([name, value]) => searchParams.append(name, value))

  return searchParams
}

const rejectHttpErrors = (resp) => {
  if (resp.status >= 200 && resp.status < 300) return resp

  return Promise.reject(new Error(`http status ${resp.status}`))
}

const rejectLoginErrors = (data) => {
  const { error } = data

  if (error == null) return data

  return Promise.reject(new Error(error))
}

const functionUrl = (token, functionName, params = {}) => {
  const requestParams = Object.assign({}, params, {
    wsfunction: functionName,
    wstoken: token,
    moodlewsrestformat: 'json'
  })

  return `https://${MOODLE_HOST}/webservice/rest/server.php?${buildSearchParams(requestParams)}`
}

const callFunction = (token, functionName, params = {}) => {
  const url = functionUrl(token, functionName, params)

  return window.fetch(url)
    .then((resp) => rejectHttpErrors(resp))
    .then((resp) => resp.json())
}

export const authenticate = (username, password) => {
  const formData = new window.FormData()

  formData.append('username', username)
  formData.append('password', password)
  formData.append('service', MOODLE_SERVICE)

  const url = `https://${MOODLE_HOST}/login/token.php`

  return window.fetch(url, { method: 'POST', body: formData })
    .then((resp) => rejectHttpErrors(resp))
    .then((resp) => resp.json())
    .then((data) => rejectLoginErrors(data))
    .then(({ token }) => token)
}

export const getSiteInfo = (token) => callFunction(token, 'core_webservice_get_site_info')
export const getUserCourses = (token, userId) => callFunction(token, 'core_enrol_get_users_courses', { userid: userId })

export const getCourse = (token, userId, courseId) => {
  return getUserCourses(token, userId)
           .then((courses) => courses.find((course) => course.id === courseId))
}

export const canSelfEnrol = (token, courseId) => {
  return callFunction(token, 'core_enrol_get_course_enrolment_methods', { courseid: courseId })
           .then((methods) => {
             const selfEnrolment = Array.isArray(methods) && methods.find((method) => {
               return method.type === 'self' && method.status === true
             })

             return selfEnrolment
           })
}

export const enrolSelf = (token, courseId) => {
  return callFunction(token, 'enrol_self_enrol_user', { courseid: courseId })
}

export const getCourseContents = (token, courseId) => {
  return callFunction(token, 'core_course_get_contents', { 'courseid': courseId })
           .then((contents) => {
             return Array.isArray(contents) ? contents : null
           })
}

export const getCourseUrl = (id) => `https://${MOODLE_HOST}/course/view.php?id=${id}`

export const uploadFile = (token, name, type, content) => {
  const params = { token, filearea: 'draft', itemid: 0 }
  const url = `https://${MOODLE_HOST}/webservice/upload.php?${buildSearchParams(params)}`
  const formData = new window.FormData()

  formData.append(
    'file',
    new window.File([content], name, { type })
  )

  const fetchOptions = {
    method: 'POST',
    body: formData
  }

  return window.fetch(url, fetchOptions)
    .then((resp) => rejectHttpErrors(resp))
    .then((resp) => resp.json())
}
