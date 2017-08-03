import { extract } from './components/raw-html/extract'

export const parseSummary = (summary) => {
  const extracted = extract(summary)

  const images = extracted.filter(({ type }) => type === 'image')
  const text = extracted.find(({ type }) => type === 'block')

  return { images, text: text && text.value }
}
