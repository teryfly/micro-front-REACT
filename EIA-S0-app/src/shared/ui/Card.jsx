import React from 'react';
import styles from './Card.module.css';

/**
 * Card container component
 * Container with border, shadow, and optional title
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.title] - Optional card title
 * 
 * @example
 * <Card title="User Details">
 *   <p>Content goes here</p>
 * </Card>
 */
const Card = ({ children, title }) => {
  return (
    <div className={styles.card}>
      {title && <div className={styles.cardHeader}>{title}</div>}
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
};

export default Card;