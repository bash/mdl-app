export const FormInput = ({ label, addClass, ...props }) => {
  const className = addClass ? `form-input ${addClass}` : 'form-input'

  return (
    <label class={className}>
      <span class='label'>{label}</span>
      <input class='input' {...props} />
    </label>
  )
}
