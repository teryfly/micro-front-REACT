import React, { createContext, useContext, useEffect } from 'react';
import { setApiBaseUrl } from '../../core/api/client';

const ApiContext = createContext(null);

export function ApiProvider({ children, apiBaseUrl }) {
  useEffect(() => {
    if (apiBaseUrl) setApiBaseUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  return (
    <ApiContext.Provider value={{ apiBaseUrl }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  return useContext(ApiContext);
}
