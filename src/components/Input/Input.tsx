import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false,
  className = ''
}) => {
  return React.createElement('div', { className: 'mb-4' },
    label && React.createElement('label', { 
      className: 'block text-sm font-medium text-gray-700 mb-2' 
    },
      label,
      required && React.createElement('span', { className: 'text-red-500 ml-1' }, '*')
    ),
    React.createElement('input', {
      type: type,
      className: `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
      } ${className}`,
      placeholder: placeholder,
      value: value,
      onChange: onChange
    }),
    error && React.createElement('p', { 
      className: 'mt-1 text-sm text-red-600' 
    }, error)
  );
};

export default Input;