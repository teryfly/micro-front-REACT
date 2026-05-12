// EIA-S0-app/src/index.js
// Load global CSS variables (CSS Modules are injected globally by style-loader)
import './shared/ui/common.module.css';

// 异步导入,确保共享模块先初始化
import('./bootstrap');