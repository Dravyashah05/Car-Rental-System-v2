import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  defaultVisible?: boolean
}

function PasswordInput({ defaultVisible = false, disabled, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(defaultVisible)

  return (
    <div className="password-input">
      <input {...props} disabled={disabled} type={isVisible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        disabled={disabled}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default PasswordInput

