import React from 'react';
import { APP_CONFIG } from '../../shared/constants/app.constants';
import styles from './Layout.module.css';

/**
 * Application header component
 *
 * @param {Object} props
 * @param {Function} props.onMenuClick - Menu toggle handler
 */
const Header = ({ onMenuClick }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.menuButton}
          onClick={onMenuClick}
          aria-label="Toggle menu"
          type="button"
        >
          ☰
        </button>
        <h1 className={styles.appName}>{APP_CONFIG.NAME}</h1>
      </div>

      <div className={styles.headerRight}>
        <span className={styles.version}>v{APP_CONFIG.VERSION}</span>

        {/* User info placeholder - will be enhanced in later phases */}
        <div className={styles.userInfo} aria-label="User info">
          <span>👤 Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;