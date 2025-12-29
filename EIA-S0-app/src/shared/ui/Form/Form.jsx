import React from 'react';

/**
 * Form wrapper component
 */
const Form = ({ onSubmit, children, loading = false, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && onSubmit) {
      onSubmit(e);
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  return (
    <form style={formStyle} onSubmit={handleSubmit} {...props}>
      <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
        {children}
      </fieldset>
    </form>
  );
};

export default Form;