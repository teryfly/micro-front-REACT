/**
 * 顶部菜单栏组件
 * 从用户菜单配置动态渲染，支持多级菜单
 */

 import React, { useEffect, useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { menuConfigService } from '../../services/menuConfigService';
 import Logo from './Logo';
 import DynamicMenuItem from './DynamicMenuItem';
 import UserInfo from './UserInfo';
 import styles from './TopMenuBar.module.css';

 export default function TopMenuBar() {
   const navigate = useNavigate();
   const [menuConfig, setMenuConfig] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     loadMenuConfig();
   }, []);

   const loadMenuConfig = async () => {
     try {
       setLoading(true);
       const data = await menuConfigService.getUserMenuConfig();
       setMenuConfig(data.menuConfig);
       console.log('[TopMenuBar] Menu config loaded:', data);
     } catch (error) {
       console.error('[TopMenuBar] Failed to load menu config:', error);
     } finally {
       setLoading(false);
     }
   };

   const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleConfigClick = () => {
    navigate('/menu-config');
  };

  const handleAllAppsClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSearchText('');
    setSelectedCategory('all');
  };

  const filteredMenuTree = React.useMemo(() => {
    if (!menuConfig) return [];
    let items = [...menuConfig.items];

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      items = items.filter(item =>
        item.label.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    return buildMenuTree(items);
  }, [menuConfig, searchText, selectedCategory]);

  const categories = React.useMemo(() => {
    if (!menuConfig) return [];
    const cats = new Set(menuConfig.items.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [menuConfig]);

   const menuTree = React.useMemo(() => {
     if (!menuConfig) return [];
     return buildMenuTree(menuConfig.items);
   }, [menuConfig]);

   if (loading) {
     return (
       <div className={styles.menuBar}>
         <div className={styles.leftSection}>
           <Logo branding={{ logo: '🏠', title: '主应用' }} />
         </div>
       </div>
     );
   }

   return (
     <div className={styles.menuBar}>
       <div className={styles.leftSection}>
         <Logo branding={{ logo: '🏠', title: '主应用' }} />

         <div className={styles.menuList}>
           {menuTree.slice(0, 6).map(node => (
             <DynamicMenuItem
               key={node.id}
               node={node}
               level={0}
             />
           ))}
         </div>
       </div>

       <div className={styles.rightSection}>
        <div
          className={styles.configIcon}
          onClick={handleAllAppsClick}
          title="全部应用"
        >
          <span>📱</span>
        </div>
        <div
          className={styles.configIcon}
          onClick={handleConfigClick}
          title="菜单配置"
        >
          <span>⚙️</span>
        </div>
        <UserInfo />
      </div>

      {drawerOpen && (
        <div className={styles.drawerOverlay} onClick={handleDrawerClose}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>全部应用</h2>
              <button className={styles.drawerCloseBtn} onClick={handleDrawerClose}>✕</button>
            </div>

            <div className={styles.drawerContent}>
              <div className={styles.searchSection}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="搜索应用..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>

              <div className={styles.categorySection}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
              </div>

              <div className={styles.menuGrid}>
                {filteredMenuTree.map(node => (
                  <DynamicMenuItem
                    key={node.id}
                    node={node}
                    level={0}
                    isDrawer={true}
                  />
                ))}
                {filteredMenuTree.length === 0 && (
                  <div className={styles.emptyState}>暂无应用</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
     </div>
   );
 }

 /**
  * 构建树形结构
  */
 function buildMenuTree(items) {
   const map = {};
   const roots = [];

   // 创建映射
   items.forEach(item => {
     map[item.id] = { ...item, children: [] };
   });

   // 建立父子关系
   items.forEach(item => {
     if (item.parentId && map[item.parentId]) {
       map[item.parentId].children.push(map[item.id]);
     } else {
       roots.push(map[item.id]);
     }
   });

   // 排序
   const sortByOrder = (arr) => {
     arr.sort((a, b) => (a.order || 0) - (b.order || 0));
     arr.forEach(item => {
       if (item.children && item.children.length > 0) {
         sortByOrder(item.children);
       }
     });
   };

   sortByOrder(roots);
   return roots;
 }
