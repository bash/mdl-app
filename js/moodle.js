// noinspection SpellCheckingInspection
const MOODLE_HOST = 'moodle.bbbaden.ch'
// noinspection SpellCheckingInspection
const MOODLE_SERVICE = 'moodle_mobile_app'

const buildSearchParams = (params) => {
  const searchParams = new URLSearchParams()

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

const callFunction = (token, functionName, params = {}) => {
  // noinspection SpellCheckingInspection
  const requestParams = Object.assign({}, params, {
    wsfunction: functionName,
    wstoken: token,
    moodlewsrestformat: 'json'
  })

  const url = `https://${MOODLE_HOST}/webservice/rest/server.php?${buildSearchParams(requestParams)}`

  return window.fetch(url)
    .then((resp) => rejectHttpErrors(resp))
    .then((resp) => resp.json())
}

export const authenticate = (username, password) => {
  const params = { username, password, service: MOODLE_SERVICE }
  const url = `https://${MOODLE_HOST}/login/token.php?${buildSearchParams(params)}`

  return window.fetch(url)
    .then((resp) => rejectHttpErrors(resp))
    .then((resp) => resp.json())
    .then((data) => rejectLoginErrors(data))
    .then(({ token }) => token)
}

export const getSiteInfo = (token) => callFunction(token, 'core_webservice_get_site_info')
export const getUserCourses = (token, userId) => callFunction(token, 'core_enrol_get_users_courses', { userid: userId })

export const getCourse = (token, userId, courseId) => getUserCourses(token, userId)
  .then((courses) => courses.find((course) => course.id === courseId))

export const getCourseContents = (token, courseId) => callFunction(token, 'core_course_get_contents', { 'courseid': courseId })
