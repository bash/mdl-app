import { Component } from 'preact'
import { route, Router } from 'preact-router'
import { Login } from './login'
import { Courses } from './courses'
import { Course } from './course'

const RouteGuard = ({ guard, redirectTo, children, ...props }) => {
  if (guard()) return children[0](props)

  route({ url: redirectTo, replace: true })

  return null
}

const NotFound = () => <h1>Not Found</h1>

export class App extends Component {
  constructor (props) {
    super(props)

    this.state.token = props.storage.getItem('token')
    this.state.userId = props.storage.getItem('userId')
  }

  _onLogin ({ token, siteInfo }) {
    const userId = siteInfo['userid']

    this.setState({ token, userId })

    this.props.storage.setItem('token', token)
    this.props.storage.setItem('userId', userId)
    this.props.storage.setItem('siteInfo', JSON.stringify(siteInfo))

    route('/')
  }

  // noinspection JSCheckFunctionSignatures
  render ({ storage }, { token, userId, debug }) {
    const isLoggedIn = () => token != null
    const isLoggedOut = () => !isLoggedIn()

    return (
      <main class='app-shell'>
        <Router>
          <RouteGuard path='/' guard={isLoggedIn} redirectTo='/login'>
            {() => <Courses token={token} userId={userId} />}
          </RouteGuard>
          <RouteGuard path='/course/:id' guard={isLoggedIn} redirectTo='/login'>
            {({ id }) => <Course token={token} userId={userId} id={Number.parseInt(id)} />}
          </RouteGuard>
          <RouteGuard path='/course/:id/debug' guard={isLoggedIn} redirectTo='/login'>
            {({ id }) => <Course token={token} userId={userId} id={Number.parseInt(id)} debug />}
          </RouteGuard>
          <RouteGuard path='/login' guard={isLoggedOut} redirectTo='/'>
            {() => <Login onLogin={this._onLogin.bind(this)} />}
          </RouteGuard>
          <NotFound default />
        </Router>
      </main>
    )
  }
}
