import React from 'react';

export default function FormInput({
  label,
  id,
  type = 'text',
  name,
  required = false,
  autoFocus = false,
  tabIndex,
  autoComplete,
  placeholder,
  value,
  onChange,
  error,
  className = '',
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'form-input-error' : ''}`}
      />
      {error && <p className="form-error-text">{error}</p>}
    </div>
  );
}