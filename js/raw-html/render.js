import { fileUrl } from '../helpers/files'

const ItemComponentForType = (type) => {
  switch (type) {
    case 'block':
      return Block
    case 'list':
      return List
    case 'image':
      return Image
    case 'table':
      return Table
    case 'blockquote':
      return BlockQuote
  }
}

const shouldPromote = (item, i) => {
  // we only promote blocks that are the first item
  return i === 0 && item.type === 'block'
}

export const RawHtml = ({ items, promoteFirst = false, token }) => {
  return (
    <div class='block-content'>
      {items.map((item, i) => (
        <Item
          item={item}
          promoted={promoteFirst && shouldPromote(item, i)}
          token={token} />
      ))}
    </div>
  )
}

const Item = ({ item, ...props }) => {
  const Component = ItemComponentForType(item.type)

  if (Component) {
    return <Component {...item} {...props} />
  }

  console.warn('item not recognized', item)
  return null
}

const Block = ({ value, promoted }) => {
  if (promoted) {
    return <h3>{value}</h3>
  }

  return <p>{value}</p>
}

const List = ({ items }) => {
  return (
    <ul>
      {items.map((value) => <li>{value}</li>)}
    </ul>
  )
}

const Image = ({ src, alt, title, token }) => {
  return <img src={fileUrl(src, token)} alt={alt} title={title} />
}

const Table = ({ rows, ...props }) => {
  return (
    <table>
      {rows.map((columns) => <TableRow columns={columns} {...props} />)}
    </table>
  )
}

const TableRow = ({ columns, ...props }) => {
  return (
    <tr>
      {columns.map((items) => <TableColumn items={items} {...props} />)}
    </tr>
  )
}

const TableColumn = ({ items, ...props }) => {
  return (
    <td>
      {items.map((item) => <Item item={item} {...props} />)}
    </td>
  )
}

const BlockQuote = ({ items, ...props }) => {
  return (
    <blockquote>
      {items.map((item) => <Item item={item} {...props} />)}
    </blockquote>
  )
}
