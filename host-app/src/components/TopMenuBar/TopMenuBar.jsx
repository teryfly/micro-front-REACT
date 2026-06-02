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
 import { MENU_ITEM_TYPES, EXTERNAL_OPEN_MODES } from '../../types/menuConfig.types';

 import { Carousel, Tree, ConfigProvider } from 'antd';
 import 'antd/dist/reset.css';



export default function TopMenuBar() {
  const navigate = useNavigate();
  const [menuConfig, setMenuConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeKeys, setTreeKeys] = useState([]);

  useEffect(() => {
    loadMenuConfig();
  }, []);
  React.useMemo(() => {
    // 初始化或路由变化时，根据当前路由设置树形菜单选中项
    console.log('0000000000000000000000000000000000000', location.pathname);
    if (!menuConfig) return [];
    menuConfig.items.map((item) => {
      if (item.type === MENU_ITEM_TYPES.SUBAPP) {
        if (location.pathname.startsWith(`/app${item.config.route}`)) {
          setTreeKeys([item.id]);
        }
      }
    })
  }, [menuConfig, location.pathname]);


  const loadMenuConfig = async () => {
    try {
      setLoading(true);
      const data = await menuConfigService.getUserMenuConfig();
      setMenuConfig(data.menuConfig);
    //  console.log('[TopMenuBar] Menu config loaded:', data);
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
  
  const filteredMenuTreeToUrl = React.useMemo(() => {
    if ((!filteredMenuTree || filteredMenuTree.length === 0)) return [];
    const list = []
    function traverseTree(node) {
      node.map((item) => {
        if (item.config?.entryUrl) {
          list.push(item);
        }
        if (item.children && item.children.length > 0) {
          traverseTree(item.children);
        }
      })
    }
    traverseTree(filteredMenuTree)
    return list
  }, [filteredMenuTree]);

  // Carousel 数据处理
  // 递归过滤函数：保留匹配项及其父级路径
  const filterData = (items, searchTerm) => {
    if (!searchTerm.trim()) return items; // 无搜索词时返回全部
    return items.reduce((acc, item) => {
      // 检查当前项是否匹配
      const isSelfMatch = item.label.toLowerCase().includes(searchTerm.toLowerCase());
      // 递归过滤子项
      const filteredChildren = filterData(item.children, searchTerm);
      // 如果当前项匹配，或者有匹配的子项，则保留当前项
      if (isSelfMatch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren // 保留匹配的子项
        });
      }
      return acc;
    }, []);
  };
  // 缓存过滤结果
  const filteredList = React.useMemo(() => {
    if (!menuConfig) return [];
    let items = [...menuConfig.items]; 
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }
    const originalList = buildMenuTree(items);
    return filterData(originalList, searchText);
  }, [menuConfig, searchText, selectedCategory]);

  const carouselFilteredMenuTree = React.useMemo(() => {
    if ((!filteredList || filteredList.length === 0)) return [];
    const convertTo2DArray = (array, groupSize = 3) => {
      return array.reduce((result, item, index) => {
        const groupIndex = Math.floor(index / groupSize);
        if (!result[groupIndex]) {
          result[groupIndex] = [];
        }
        result[groupIndex].push(item);
        return result;
      }, []);
    };
    const list = convertTo2DArray(filteredList, 3)
    return list
  }, [filteredList]);
  
  // 点击树节点触发事件
  const handleTreeSelect = (selectedKeys, selectedNodes) => { 
    console.log('selectedNodes', selectedNodes.selectedNodes[0]);
    setTreeKeys(selectedKeys);
    const menuNode = selectedNodes.selectedNodes[0] || {};
    if (menuNode.type === MENU_ITEM_TYPES.SUBAPP) {
      const targetPath = `/app${menuNode.config.route}`;
      navigate(targetPath);
    } else if (menuNode.type === MENU_ITEM_TYPES.EXTERNAL) {
      if (menuNode.config.openMode === EXTERNAL_OPEN_MODES.NEW_TAB) {
        window.open(menuNode.config.url, '_blank', 'noopener,noreferrer');
      } else {
        const targetPath = `/external/${encodeURIComponent(menuNode.config.url)}`;
        navigate(targetPath);
      }
    }
  };


  const categories = React.useMemo(() => {
    if (!menuConfig) return [];
    // menuConfig.items[0].category = 'C';
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

              {
                filteredMenuTree.length ===0 ? 
                <div className={styles.emptyState}>暂无应用</div>
                : <div>
                    <div className={styles.menuGrid}>
                      {filteredMenuTreeToUrl.map(node => (
                        <DynamicMenuItem
                          key={node.id}
                          node={node}
                          level={0}
                          isDrawer={true}
                        />
                      ))}
                    </div>
                    <div className={styles.carouselFilteredMenu}>
                      <ConfigProvider
                        theme={{
                          components: {
                            Carousel: {
                              arrowSize: 24,      // 修改箭头的大小
                              arrowOffset: 5,     // 修改箭头离边界的距离
                              dotActiveWidth: 10, // 修改激活态指示点宽度
                              dotHeight: 10,      // 修改指示点高度
                              dotWidth: 10,       // 修改指示点宽度 
                              dotOffset: 5,       // 修改指示点离边界的距离
                            },
                          },
                        }} 
                      >
                        <Carousel arrows={true}>
                          {carouselFilteredMenuTree && carouselFilteredMenuTree.map((carouselItem, c) => (
                            <div key={c} className={styles.carouselFilteredMenuRow}>
                              {carouselItem.map((item) => (
                                <div key={item.id} className={styles.carouselFilteredMenuTree}>
                                  <Tree 
                                    key={treeKeys[0] ? treeKeys[0] : item.id}
                                    treeData={[item]}
                                    defaultExpandAll={true}
                                    defaultSelectedKeys={treeKeys}
                                    fieldNames={{
                                      title: 'label',
                                      key: 'id',
                                      children: 'children',
                                    }}
                                    onSelect={handleTreeSelect}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </Carousel>
                      </ConfigProvider>
                    </div>
                </div>
              }
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
