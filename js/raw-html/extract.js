// Example matches:
// · apples
// 1. apples
// 2. oranges
// TODO: maybe allow more characters
const LIST_START_REGEX = /^·[\s+]/

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

const normalizeListValue = (value) => {
  return normalizeValue(value.replace(LIST_START_REGEX, ''))
}

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

const groupConsecutiveLists = (blocks, block) => {
  const previous = blocks[blocks.length - 1]

  if (previous && previous.type === 'list' && block.type === 'list') {
    previous.items = [...previous.items, ...block.items]
  } else {
    blocks.push(block)
  }

  return blocks
}

const convertBlocksToLists = (items, item) => {
  if (item.value == null || !LIST_START_REGEX.test(item.value)) return [...items, item]

  const value = normalizeListValue(item.value)
  const previousItem = items[items.length - 1]

  // joins consecutive lists (only if converted from block) together
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
      const text = extractText(node)
      
      return text && normalizeListValue(text)
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

const processTable = (node) => {
  const rows = Array.from(node.querySelectorAll('tr'))
                    .map(($row) => Array.from($row.querySelectorAll('th, td')))

  const mappedRows = rows.map((row) => {
    return row.map((column) => ({
      span: column.colSpan,
      items: handleRoot(column),
    }))
  })

  return { type: 'table', rows: mappedRows }
}

const processBlockQuote = (node) => {
  const reduceItems = (items, item) => {
    if (item.type === 'blockquote') {
      return [
        ...items,
        ...item.items
      ]
    }

    return [...items, item]
  }

  const items = handleRoot(node).reduce(reduceItems, [])

  return { type: 'blockquote', items }
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
  if (node.matches('span, strong, b, i, em, font, u, sup, sub, strike, div')) return processNodes(node.childNodes)

  if (node.matches('img')) return processImage(node)

  if (node.matches('br')) return processBreak(node)

  if (node.matches('table')) return processTable(node)

  if (node.matches('blockquote')) return processBlockQuote(node)

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
    .map((item) => normalizeValues(convertTextToBlock(item)))
    .filter((item) => blockHasValue(item) && item.type !== 'break')
    .reduce(groupConsecutiveLists, [])
}

export const extract = (html) => {
  return handleRoot(createDocumentFragment(html))
    .reduce(convertBlocksToLists, [])
}
