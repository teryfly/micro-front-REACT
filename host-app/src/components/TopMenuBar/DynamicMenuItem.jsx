/**
 * Dynamic Menu Item Component
 * Renders menu items based on type (subapp/external/category)
 * Supports nested menus (unlimited levels)
 * @module DynamicMenuItem
 */

 import React, { useState, useRef, useEffect } from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { MENU_ITEM_TYPES, EXTERNAL_OPEN_MODES } from '../../types/menuConfig.types';
 import styles from './MenuItem.module.css';
 
 export default function DynamicMenuItem({ node, level = 0, parentRef = null }) {
   const navigate = useNavigate();
   const location = useLocation();
   const [isOpen, setIsOpen] = useState(false);
   const [isHovering, setIsHovering] = useState(false);
   const menuItemRef = useRef(null);
   const timeoutRef = useRef(null);
 
   const hasChildren = node.children && node.children.length > 0;
   const isCategory = node.type === MENU_ITEM_TYPES.CATEGORY;
   
   // 判断是否需要 hover 触发（用于三级及以上菜单）
   const useHoverTrigger = level >= 1;
 
   // 清理定时器
   const clearTimeouts = () => {
     if (timeoutRef.current) {
       clearTimeout(timeoutRef.current);
       timeoutRef.current = null;
     }
   };
 
   // 处理 hover 打开
   const handleMouseEnter = () => {
     if (!useHoverTrigger || !hasChildren) return;
     clearTimeouts();
     setIsOpen(true);
   };
 
   const handleMouseLeave = () => {
     if (!useHoverTrigger) return;
     clearTimeouts();
     timeoutRef.current = setTimeout(() => {
       setIsOpen(false);
     }, 150);
   };
 
   // 点击外部关闭下拉菜单（仅用于一级菜单的点击触发）
   useEffect(() => {
     if (!useHoverTrigger && isOpen) {
       const handleClickOutside = (event) => {
         if (menuItemRef.current && !menuItemRef.current.contains(event.target)) {
           setIsOpen(false);
         }
       };
       document.addEventListener('mousedown', handleClickOutside);
       return () => {
         document.removeEventListener('mousedown', handleClickOutside);
       };
     }
   }, [isOpen, useHoverTrigger]);
 
   // 清理定时器
   useEffect(() => {
     return () => clearTimeouts();
   }, []);
 
   const handleClick = (e) => {
     e.preventDefault();
     e.stopPropagation();
 
     // 分类菜单：切换下拉菜单（仅在一级菜单使用点击触发）
     if (isCategory && !useHoverTrigger) {
       setIsOpen(!isOpen);
       return;
     }
 
     // 分类菜单且使用 hover 触发时，点击应该导航到某个默认页面或不做导航
     if (isCategory) {
       // 如果有第一个子菜单，可以导航到第一个子菜单
       if (hasChildren && node.children[0]) {
         handleMenuItemClick(node.children[0]);
       }
       return;
     }
 
     // 子应用或外部链接
     handleMenuItemClick(node);
   };
 
   const handleMenuItemClick = (menuNode) => {
     if (menuNode.type === MENU_ITEM_TYPES.SUBAPP) {
       const targetPath = `/app${menuNode.config.route}`;
       console.log('[DynamicMenuItem] Navigate to subapp:', targetPath);
       navigate(targetPath);
     } else if (menuNode.type === MENU_ITEM_TYPES.EXTERNAL) {
       if (menuNode.config.openMode === EXTERNAL_OPEN_MODES.NEW_TAB) {
         window.open(menuNode.config.url, '_blank', 'noopener,noreferrer');
       } else {
         const targetPath = `/external/${encodeURIComponent(menuNode.config.url)}`;
         navigate(targetPath);
       }
     }
     
     // 关闭所有打开的菜单
     setIsOpen(false);
   };
 
   const handleChildClick = () => {
     setIsOpen(false);
   };
 
   // 检查当前路由是否匹配
   const isActive = node.type === MENU_ITEM_TYPES.SUBAPP && 
                    location.pathname.startsWith(`/app${node.config.route}`);
 
   // 渲染带子菜单的项
   if (hasChildren) {
     const menuItemContent = (
       <div 
         className={`${styles.menuItem} ${isActive ? styles.active : ''} ${useHoverTrigger ? styles.hasSubmenu : ''}`}
         onClick={handleClick}
       >
         {node.icon && <span className={styles.icon}>{node.icon}</span>}
         <span className={styles.text}>{node.label}</span>
         {(isCategory || hasChildren) && (
           <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>
             ▼
           </span>
         )}
       </div>
     );
 
     // 根据触发方式选择不同的容器和事件处理
     if (useHoverTrigger) {
       // 三级及以上菜单：hover 触发
       return (
         <div 
           className={`${styles.submenu}`}
           ref={menuItemRef}
           onMouseEnter={handleMouseEnter}
           onMouseLeave={handleMouseLeave}
         >
           {menuItemContent}
           {isOpen && (
             <div className={styles.subDropdown}>
               {node.children.map(child => (
                 <DynamicMenuItem
                   key={child.id}
                   node={child}
                   level={level + 1}
                   parentRef={menuItemRef}
                 />
               ))}
             </div>
           )}
         </div>
       );
     } else {
       // 一级菜单：点击触发
       return (
         <div 
           className={styles.menuGroup} 
           ref={menuItemRef}
         >
           {menuItemContent}
           {isOpen && (
             <div className={styles.dropdown}>
               {node.children.map(child => (
                 <DynamicMenuItem
                   key={child.id}
                   node={child}
                   level={level + 1}
                   parentRef={menuItemRef}
                 />
               ))}
             </div>
           )}
         </div>
       );
     }
   }
 
   // 渲染普通菜单项（无子菜单）
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