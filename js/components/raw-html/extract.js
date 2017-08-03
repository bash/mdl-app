const createDocumentFragment = (html) => {
  const template = document.createElement('template')
  template.innerHTML = html
  return template.content
}

/** trims whitespace and removes leading dots */
const normalizeValue = (value) => {
  return value
    .trim()
    .replace(/^[.]/, '')
    .replace(/\n/g, ' ')
    .trim()
}

const LIST_START_REGEX = /^(·|([0-9]+\.))/

/** extracts text from a root node */
const extractText = (root) => {
  const text = handleRoot(root).find(({ type }) => type === 'block')

  return text && text.value
}

const groupConsecutiveTextItems = (items, item) => {
  const previousItem = items[items.length - 1]

  if (previousItem && previousItem.type === 'text' && item.type === 'text') {
    previousItem.value += item.value
  } else {
    items.push(item)
  }

  return items
}

const convertBlocksToLists = (items, item) => {
  if (item.value == null || !LIST_START_REGEX.test(item.value)) return [...items, item]

  const value = normalizeValue(item.value.replace(LIST_START_REGEX, ''))
  const previousItem = items[items.length - 1]

  // joins consecutive (converted) lists together
  if (previousItem && previousItem.type === 'list' && previousItem.fromBlock) {
    previousItem.items.push(value)
    return items
  }

  return [...items, { type: 'list', items: [value], fromBlock: true }]
}

const processList = (node) => {
  const items = Array
    .from(node.querySelectorAll(':scope > li'))
    .map((node) => {
      // list items only support plain text
      return extractText(node)
    })

  return { type: 'list', items }
}

const processImage = (node) => {
  return { type: 'image', src: node.src, alt: node.alt, title: node.title }
}

const processTextNode = (node) => {
  return { type: 'text', value: node.textContent }
}

const processParagraph = (node) => {
  return [{ type: 'break' }, ...processNodes(node.childNodes), { type: 'break' }]
}

const processBreak = () => {
  return { type: 'break' }
}

const processNode = (node) => {
  if (node.nodeType === window.Node.COMMENT_NODE) return null
  if (node.nodeType === window.Node.TEXT_NODE) return processTextNode(node)

  // headings and paragraphs are treated as paragraphs
  // TODO: not sure if it's a good idea to include <pre> tags here
  if (node.matches('p, h1, h2, h3, h4, h5, h6, pre')) return processParagraph(node)

  if (node.matches('ul, ol')) return processList(node)

  // we're treating formatting tags and <div>s as 'transparent' nodes
  // TODO: add more tags here
  if (node.matches('span, strong, b, i, em, font, div')) return processNodes(node.childNodes)

  if (node.matches('img')) return processImage(node)

  if (node.matches('br')) return processBreak(node)

  // TODO: needs support for tables

  console.warn('unknown element found during extraction', node)

  return null
}

const processNodes = (nodes) => {
  return Array.from(nodes)
    .map((node) => processNode(node))
    .reduce((a, b) => a.concat(b), [])
}

const handleRoot = (root) => {
  const convertTextToBlock = (item) => item.type === 'text' ? { ...item, type: 'block' } : item
  const normalizeValues = (item) => item.value != null ? { ...item, value: normalizeValue(item.value) } : item
  const blockHasValue = (item) => item.type === 'block' ? item.value : true

  return processNodes(root.childNodes)
    .filter((item) => item != null)
    .reduce(groupConsecutiveTextItems, [])
    .map((item) => convertTextToBlock(item))
    .map((item) => normalizeValues(item))
    .filter((item) => blockHasValue(item))
    .filter((item) => item.type !== 'break')
}

export const extract = (html) => {
  return handleRoot(createDocumentFragment(html))
    .reduce(convertBlocksToLists, [])
}
