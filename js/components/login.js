import { Component } from 'preact'
import { authenticate, getSiteInfo } from '../moodle'
import { FormInput } from './form-input'

export class Login extends Component {
  _onSubmit (event) {
    const formData = new window.FormData(event.target)
    const username = formData.get('username')
    const password = formData.get('password')

    event.preventDefault()

    const token = authenticate(username, password)
    const siteInfo = token.then((token) => getSiteInfo(token))

    this.setState({ isLoading: true })

    Promise.all([token, siteInfo])
      .then(([token, siteInfo]) => {
        this.props.onLogin({ token, siteInfo })
        this.setState({ isLoading: false })
      })
      .catch(() => {
        this.setState({ isLoading: false })
      })
  }

  // noinspection JSCheckFunctionSignatures
  render ({ onLogin }, { hasError, isLoading }) {
    return (
      <form class='form-wrap' onSubmit={this._onSubmit.bind(this)}>
        <h1>Login</h1>
        <FormInput addClass='-margin-after' label='Username' type='text' name='username' placeholder='Username' />
        <FormInput addClass='-margin-after' label='Password' type='password' name='password' placeholder='Password' />
        <button class='form-button' type='submit' disabled={isLoading}>
          Login
        </button>
      </form>
    )
  }
}
