/**
 * Dynamic Menu Item Component
 * Renders menu items based on type (subapp/external/category)
 * @module DynamicMenuItem
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MENU_ITEM_TYPES, EXTERNAL_OPEN_MODES } from '../../types/menuConfig.types';
import styles from './MenuItem.module.css';

export default function DynamicMenuItem({ node, level }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hasChildren = node.children && node.children.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (node.type === MENU_ITEM_TYPES.CATEGORY) {
      // Toggle dropdown for category
      setIsOpen(!isOpen);
    } else if (node.type === MENU_ITEM_TYPES.SUBAPP) {
      // Navigate to subapp
      const targetPath = `/app${node.config.route}`;
      console.log('[DynamicMenuItem] Navigate to subapp:', targetPath);
      navigate(targetPath);
      setIsOpen(false);
    } else if (node.type === MENU_ITEM_TYPES.EXTERNAL) {
      // Handle external link
      if (node.config.openMode === EXTERNAL_OPEN_MODES.NEW_TAB) {
        window.open(node.config.url, '_blank', 'noopener,noreferrer');
      } else {
        // Navigate to iframe wrapper route
        const targetPath = `/external/${encodeURIComponent(node.config.url)}`;
        navigate(targetPath);
      }
      setIsOpen(false);
    }
  };

  const handleChildClick = () => {
    setIsOpen(false);
  };

  // Check if current route matches this subapp
  const isActive = node.type === MENU_ITEM_TYPES.SUBAPP && 
                   location.pathname.startsWith(`/app${node.config.route}`);

  // If has children, render as dropdown
  if (hasChildren) {
    return (
      <div className={styles.menuGroup} ref={dropdownRef}>
        <div 
          className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
          onClick={handleClick}
        >
          {node.icon && <span className={styles.icon}>{node.icon}</span>}
          <span className={styles.text}>{node.label}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
            ▼
          </span>
        </div>

        {isOpen && (
          <div className={styles.dropdown}>
            {node.children.map(child => (
              <DynamicMenuItem
                key={child.id}
                node={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render as simple menu item
  return (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      title={node.label}
    >
      {node.icon && <span className={styles.icon}>{node.icon}</span>}
      <span className={styles.text}>{node.label}</span>
    </div>
  );
}