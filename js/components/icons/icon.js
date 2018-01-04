export const Icon = ({ children, label, fill, stroke, size, style, ...props }) => {
  return (
    <svg
      preserveAspectRatio='xMidYMid meet'
      viewBox='0 0 24 24'
      fill={fill || 'none'}
      stroke={stroke || 'currentColor'}
      height={size}
      width={size}
      role='img'
      aria-label={label}
      {...props}
      style={{
        verticalAlign: 'middle',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinjoin: 'round',
        ...style
      }}
    >{children}</svg>
  )
}
