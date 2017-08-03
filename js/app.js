import { render } from 'preact'
import { App } from './components/app'

render(<App storage={window.localStorage} />, document.body)
