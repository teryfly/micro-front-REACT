# Menu Configuration API Contract

## Overview
RESTful API for user-specific menu configuration management.

**Base URL**: `/api/menu-config`

---

## Authentication
All endpoints require authentication. User identity is extracted from JWT token in `Authorization` header.

```http
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get User Menu Configuration

**GET** `/api/menu-config`

**Description**: 
- Retrieves current user's menu configuration
- If user has no custom config, returns system default menu
- System default includes: `governance BC` (EIA-S0-app) and `示例远程子应用1` (remote-app)

**Request Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response 200 OK**:
```json
{
  "userId": "user-uuid",
  "menuConfig": {
    "version": "1.0.0",
    "defaultAppId": "governance-bc",
    "items": [
      {
        "id": "menu-item-uuid-1",
        "type": "subapp",
        "label": "Governance BC",
        "icon": "📋",
        "order": 1,
        "parentId": null,
        "config": {
          "appId": "governance-bc",
          "route": "/governance",
          "entryUrl": "http://localhost:7002/remoteEntry.js",
          "containerName": "eiaS0App"
        }
      },
      {
        "id": "menu-item-uuid-2",
        "type": "subapp",
        "label": "示例远程子应用1",
        "icon": "🔵",
        "order": 2,
        "parentId": null,
        "config": {
          "appId": "remote-app-1",
          "route": "/remote1",
          "entryUrl": "http://localhost:7001/remoteEntry.js",
          "containerName": "remoteApp1"
        }
      }
    ]
  },
  "isDefault": true,
  "lastModified": "2024-01-01T00:00:00Z"
}
```

**Response Fields**:
- `userId`: User UUID
- `menuConfig.version`: Config schema version
- `menuConfig.defaultAppId`: Default app to load on startup
- `menuConfig.items[]`: Menu item array
  - `id`: Unique menu item ID
  - `type`: `"subapp"` | `"external"` | `"category"`
  - `label`: Display name
  - `icon`: Emoji or icon identifier
  - `order`: Sort order (integer)
  - `parentId`: Parent menu item ID (null for root)
  - `config`: Type-specific configuration
- `isDefault`: `true` if using system default, `false` if user customized

---

### 2. Update User Menu Configuration

**PUT** `/api/menu-config`

**Description**: 
- Saves user's custom menu configuration
- Validates menu structure (no circular references, valid app configs)
- Returns validation errors if any

**Request Headers**:
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "version": "1.0.0",
  "defaultAppId": "governance-bc",
  "items": [
    {
      "id": "menu-item-uuid-1",
      "type": "subapp",
      "label": "Governance BC",
      "icon": "📋",
      "order": 1,
      "parentId": null,
      "config": {
        "appId": "governance-bc",
        "route": "/governance",
        "entryUrl": "http://localhost:7002/remoteEntry.js",
        "containerName": "eiaS0App"
      }
    }
  ]
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Menu configuration saved successfully",
  "userId": "user-uuid",
  "lastModified": "2024-01-01T00:00:00Z"
}
```

**Response 400 Bad Request**:
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid menu configuration",
  "errors": [
    {
      "field": "items[2].parentId",
      "message": "Circular reference detected"
    }
  ]
}
```

---

### 3. Reset to Default Menu

**POST** `/api/menu-config/reset`

**Description**: 
- Deletes user's custom configuration
- Reverts to system default menu

**Request Headers**:
```http
Authorization: Bearer <jwt_token>
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Menu configuration reset to default",
  "userId": "user-uuid"
}
```

---

## Data Models

### Menu Item Types

#### Type: `subapp` (Sub-Application)
```typescript
{
  "type": "subapp",
  "config": {
    "appId": string,           // Unique app identifier
    "route": string,           // Route path (e.g., "/governance")
    "entryUrl": string,        // Module Federation entry URL
    "containerName": string    // Webpack container name
  }
}
```

#### Type: `external` (External Link)
```typescript
{
  "type": "external",
  "config": {
    "url": string,             // External URL
    "openMode": "newTab" | "iframe"  // Open in new tab or embedded iframe
  }
}
```

#### Type: `category` (Menu Category/Folder)
```typescript
{
  "type": "category",
  "config": {}  // No additional config, children in parentId relationship
}
```

---

## Validation Rules

1. **Unique IDs**: All menu item IDs must be unique
2. **No Circular References**: `parentId` chain must not form a loop
3. **Valid Default App**: `defaultAppId` must reference an existing `subapp` type item
4. **Valid Routes**: SubApp routes must start with `/` and be unique
5. **Valid URLs**: External URLs must be valid HTTP/HTTPS URLs
6. **Order Uniqueness**: Order values should be unique per level (recommended, not enforced)

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Menu configuration validation failed |
| `CIRCULAR_REFERENCE` | Detected circular reference in menu tree |
| `INVALID_DEFAULT_APP` | Default app ID does not exist or is not a subapp |
| `DUPLICATE_ROUTE` | Multiple subapps with same route |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `SERVER_ERROR` | Internal server error |

---

## TODO List for Backend Implementation

### ✅ Phase 1: Database Schema
- [ ] Create `user_menu_config` table
  - `user_id` (UUID, FK to users table)
  - `config_json` (JSONB, stores full menu structure)
  - `version` (VARCHAR, config schema version)
  - `is_default` (BOOLEAN, whether using system default)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)

- [ ] Create `system_default_menu` table
  - `id` (UUID, PK)
  - `config_json` (JSONB, default menu structure)
  - `version` (VARCHAR)
  - `effective_from` (TIMESTAMP)
  - `created_at` (TIMESTAMP)

### ✅ Phase 2: API Implementation
- [ ] Implement `GET /api/menu-config`
  - Extract `userId` from JWT token
  - Query `user_menu_config` by `user_id`
  - If not found, return `system_default_menu`
  - Set `isDefault: true/false` in response

- [ ] Implement `PUT /api/menu-config`
  - Extract `userId` from JWT token
  - Validate menu structure (see validation rules)
  - Upsert `user_menu_config` record
  - Return success or validation errors

- [ ] Implement `POST /api/menu-config/reset`
  - Extract `userId` from JWT token
  - Delete user's custom config record
  - Return success

### ✅ Phase 3: Validation Logic
- [ ] Implement circular reference detection algorithm
- [ ] Validate `defaultAppId` exists and is `subapp` type
- [ ] Validate route uniqueness across subapps
- [ ] Validate URL formats for external links

### ✅ Phase 4: Initial Data Seeding
- [ ] Create migration script to insert system default menu:
  ```sql
  INSERT INTO system_default_menu (config_json, version) VALUES (
    '{
      "version": "1.0.0",
      "defaultAppId": "governance-bc",
      "items": [
        {
          "id": "default-menu-1",
          "type": "subapp",
          "label": "Governance BC",
          "icon": "📋",
          "order": 1,
          "parentId": null,
          "config": {
            "appId": "governance-bc",
            "route": "/governance",
            "entryUrl": "http://localhost:7002/remoteEntry.js",
            "containerName": "eiaS0App"
          }
        },
        {
          "id": "default-menu-2",
          "type": "subapp",
          "label": "示例远程子应用1",
          "icon": "🔵",
          "order": 2,
          "parentId": null,
          "config": {
            "appId": "remote-app-1",
            "route": "/remote1",
            "entryUrl": "http://localhost:7001/remoteEntry.js",
            "containerName": "remoteApp1"
          }
        }
      ]
    }',
    '1.0.0'
  );
  ```

### ✅ Phase 5: Testing & Documentation
- [ ] Write API integration tests
- [ ] Document authentication requirements
- [ ] Create Postman/Swagger collection
