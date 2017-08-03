import { Component } from 'preact'
import { authenticate, getSiteInfo } from '../moodle'

export class Login extends Component {
  _onSubmit (event) {
    const formData = new window.FormData(event.target)
    const username = formData.get('username')
    const password = formData.get('password')

    event.preventDefault()

    const token = authenticate(username, password)
    const siteInfo = token.then((token) => getSiteInfo(token))

    Promise.all([token, siteInfo])
      .then(([token, siteInfo]) => {
        this.props.onLogin({ token, siteInfo })
      })
  }

  // noinspection JSCheckFunctionSignatures
  render ({ onLogin }, { hasError }) {
    return (
      <form onSubmit={this._onSubmit.bind(this)}>
        <label>
          Username
          <input type='text' name='username' placeholder='Username' />
        </label>
        <br />
        <label>
          Password
          <input type='password' name='password' placeholder='Password' />
        </label>
        <button type='submit'>
          Login
        </button>
      </form>
    )
  }
}
