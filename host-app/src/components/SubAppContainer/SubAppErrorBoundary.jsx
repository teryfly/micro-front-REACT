/**
 * 子应用错误边界组件
 * 捕获子应用渲染错误，防止影响主应用
 */

import React from 'react';
import ErrorFallback from './ErrorFallback';

export default class SubAppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SubAppErrorBoundary] 捕获子应用错误:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 上报错误到监控系统（预留接口）
    if (window.__MICRO_APP_ERROR_REPORTER__) {
      window.__MICRO_APP_ERROR_REPORTER__({
        appId: this.props.appConfig.id,
        error: error.toString(),
        stack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          appConfig={this.props.appConfig}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}