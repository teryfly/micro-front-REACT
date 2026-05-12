/**
 * Logo组件
 * 显示应用Logo和标题
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Logo.module.css';

export default function Logo({ branding = {} }) {
  const navigate = useNavigate();
  const { logo = '🏠', title = '主应用', showTitle = true } = branding;

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.logo} onClick={handleClick}>
      <span className={styles.logoIcon}>{logo}</span>
      {showTitle && <span className={styles.logoTitle}>{title}</span>}
    </div>
  );
}