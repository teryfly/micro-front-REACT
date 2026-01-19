# Menu Configuration Feature

## Overview
Dynamic menu configuration system allowing users to customize their application menu structure.

## Features
- ✅ User-specific menu configuration
- ✅ Tree structure with unlimited depth
- ✅ Three menu item types: SubApp, External Link, Category
- ✅ Drag-drop reordering
- ✅ Default app selection
- ✅ localStorage persistence (user-scoped)
- ✅ API-ready architecture

## Usage

### Access Menu Configuration
1. Click the ⚙️ icon in the top-right corner of the menu bar
2. You'll be navigated to `/menu-config` page

### Menu Item Types

#### 1. SubApp (子应用)
- Loads a remote micro-frontend application
- Required fields:
  - **应用ID**: Unique identifier (e.g., `governance-bc`)
  - **路由**: Route path (e.g., `/governance`)
  - **入口URL**: Module Federation entry URL (e.g., `http://localhost:7002/remoteEntry.js`)
  - **容器名**: Webpack container name (e.g., `eiaS0App`)

#### 2. External Link (外部链接)
- Links to external websites
- Required fields:
  - **URL**: External URL (must start with `http://` or `https://`)
  - **打开方式**: 
    - `新窗口打开`: Opens in new browser tab
    - `嵌入iframe`: Embeds in iframe within the app

#### 3. Category (分类)
- Organizes menu items into groups
- Can contain child items (SubApps, External Links, or nested Categories)
- No additional configuration required

### Operations

#### Add Root Menu Item
1. Click "添加根菜单" button
2. Fill in the form
3. Click "添加" to save

#### Add Child Menu Item
1. Find a Category item
2. Click "添加子项" button
3. Fill in the form
4. Click "添加" to save

#### Edit Menu Item
1. Click "编辑" button on any item
2. Modify fields
3. Click "保存" to save

#### Delete Menu Item
1. Click "删除" button on any item
2. Confirm deletion
3. All descendant items will also be deleted

#### Reorder Menu Items
1. Drag the ☰ handle on any menu item
2. Drop on another item to reorder

#### Set Default App
1. Find a SubApp item
2. Click "设为默认" button
3. This app will load on startup (home page)

### Save Configuration
1. Click "保存配置" button in the header
2. Page will reload to apply changes

### Reset to Default
1. Click "重置为默认" button
2. Confirm reset
3. Your custom configuration will be cleared
4. System default menu will be restored

## Initial Menu

The system comes with two default menu items:

1. **Governance BC** (默认应用)
   - Type: SubApp
   - Route: `/governance`
   - Entry: `http://localhost:7002/remoteEntry.js`
   - Container: `eiaS0App`

2. **示例远程子应用1**
   - Type: SubApp
   - Route: `/remote1`
   - Entry: `http://localhost:7001/remoteEntry.js`
   - Container: `remoteApp1`

## Data Storage

### Current Implementation (Phase 1)
- **Storage**: localStorage (user-scoped)
- **Key Format**: `MENU_CONFIG_USER_{userId}`
- **User ID**: Auto-generated UUID stored in `CURRENT_USER_ID`

### Future Implementation (Phase 2)
- **Storage**: Backend database
- **User ID**: From JWT authentication token
- **API Endpoints**: See `host-app/src/api/menuConfigApi.contract.md`

## API Integration (TODO)

When backend is ready, replace `menuConfigService.js` mock implementation:

```javascript
import apiClient from '../api/apiClient';

export const menuConfigService = {
  async getUserMenuConfig() {
    return await apiClient.get('/api/menu-config');
  },

  async updateUserMenuConfig(menuConfig) {
    return await apiClient.put('/api/menu-config', menuConfig);
  },

  async resetToDefault() {
    return await apiClient.post('/api/menu-config/reset');
  },
};
```

## Validation Rules

1. **Unique IDs**: All menu item IDs must be unique
2. **No Circular References**: Parent-child relationships must not form loops
3. **Valid Default App**: Default app must be a SubApp type
4. **Valid Routes**: SubApp routes must start with `/` and be unique
5. **Valid URLs**: External URLs must start with `http://` or `https://`
6. **Required Fields**: All type-specific fields must be provided

## Troubleshooting

### Menu not updating after save
- Check browser console for validation errors
- Verify all required fields are filled
- Try "重置为默认" and reconfigure

### SubApp not loading
- Verify the subapp is running on the specified port
- Check `entryUrl` points to correct `remoteEntry.js`
- Verify `containerName` matches webpack config `name` field
- Check browser Network tab for failed requests

### External link not working
- Verify URL starts with `http://` or `https://`
- Check if the external site allows iframe embedding (X-Frame-Options)
- Try "新窗口打开" mode if iframe fails

## File Structure

```
host-app/
├── src/
│   ├── api/
│   │   └── menuConfigApi.contract.md       # API specification
│   ├── components/
│   │   ├── MenuConfig/
│   │   │   ├── MenuTreeEditor.jsx          # Tree editor component
│   │   │   ├── MenuTreeEditor.module.css
│   │   │   ├── MenuItemForm.jsx            # Item form component
│   │   │   ├── MenuItemForm.module.css
│   │   │   └── index.js
│   │   ├── SubAppContainer/
│   │   │   ├── ExternalLinkContainer.jsx   # iframe wrapper
│   │   │   └── ExternalLinkContainer.module.css
│   │   └── TopMenuBar/
│   │       ├── DynamicMenuItem.jsx         # Dynamic menu renderer
│   │       └── TopMenuBar.jsx              # Updated with config icon
│   ├── pages/
│   │   ├── MenuConfigPage.jsx              # Menu config page
│   │   ├── MenuConfigPage.module.css
│   │   └── index.js
│   ├── services/
│   │   ├── menuConfigService.js            # Mock API service
│   │   └── index.js
│   ├── types/
│   │   └── menuConfig.types.js             # Type definitions
│   └── utils/
│       └── menuConfigInit.js               # Initialization logic
