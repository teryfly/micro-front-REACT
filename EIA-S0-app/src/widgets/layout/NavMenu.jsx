import React from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../app/routes/routeConfig';

/**
 * Navigation menu component
 * Renders navigation links from route configuration
 */
const NavMenu = () => {
  const uniqueRoutes = routes.filter((route, index, self) => 
    index === self.findIndex(r => r.label === route.label)
  );

  const navListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const navItemStyle = {
    margin: 0,
  };

  const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    color: 'var(--color-text, #333)',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
    cursor: 'pointer',
  };

  const navLinkActiveStyle = {
    ...navLinkStyle,
    backgroundColor: 'var(--color-primary, #1890ff)',
    color: 'var(--color-text-inverse, white)',
    fontWeight: 600,
  };

  const navIconStyle = {
    fontSize: '20px',
    flexShrink: 0,
  };

  const navLabelStyle = {
    flex: 1,
    fontSize: '14px',
  };

  return (
    <ul style={navListStyle}>
      {uniqueRoutes.map(({ path, label, icon }) => (
        <li key={path} style={navItemStyle}>
          <NavLink
            to={path}
            style={({ isActive }) => isActive ? navLinkActiveStyle : navLinkStyle}
            aria-current={({ isActive }) => isActive ? 'page' : undefined}
          >
            {icon && <span style={navIconStyle} aria-hidden="true">{icon}</span>}
            <span style={navLabelStyle}>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default NavMenu;