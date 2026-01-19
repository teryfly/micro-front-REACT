/**
 * External Link Container Component
 * Renders external URLs in iframe
 * @module ExternalLinkContainer
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './ExternalLinkContainer.module.css';

export default function ExternalLinkContainer() {
  const { encodedUrl } = useParams();
  
  let url = '';
  let error = null;

  try {
    url = decodeURIComponent(encodedUrl);
    
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      error = '无效的URL格式';
    }
  } catch (err) {
    error = 'URL解析失败';
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>⚠️ 加载失败</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <iframe
        src={url}
        className={styles.iframe}
        title="External Content"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        allow="fullscreen"
      />
    </div>
  );
}