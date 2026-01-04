import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../app/routes/routeConfig';
import styles from './Layout.module.css';

/**
 * Navigation menu component
 * Renders navigation links from route configuration.
 */
const NavMenu = () => {
  // Remove duplicates (e.g., "/" and "/doctype" share same label)
  const uniqueRoutes = useMemo(() => {
    return routes.filter((route, index, self) => (
      index === self.findIndex((r) => r.label === route.label)
    ));
  }, []);

  return (
    <ul className={styles.navList}>
      {uniqueRoutes.map(({ path, label, icon }) => (
        <li key={path} className={styles.navItem}>
          <NavLink
            to={path}
            className={({ isActive }) => (
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            )}
          >
            {icon && <span className={styles.navIcon} aria-hidden="true">{icon}</span>}
            <span className={styles.navLabel}>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default NavMenu;