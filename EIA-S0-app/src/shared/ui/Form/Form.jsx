import React from 'react';
import styles from './Form.module.css';

/**
 * Form wrapper component
 * Prevents default form submission and provides loading state
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler
 * @param {React.ReactNode} props.children - Form fields
 * @param {boolean} [props.loading=false] - Submission loading state
 * 
 * @example
 * <Form onSubmit={handleSubmit} loading={isSubmitting}>
 *   <Input name="email" label="Email" />
 *   <Button type="submit">Submit</Button>
 * </Form>
 */
const Form = ({ onSubmit, children, loading = false, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} {...props}>
      <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
        {children}
      </fieldset>
    </form>
  );
};

export default Form;