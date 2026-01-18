import React, { createContext, useContext, useMemo } from 'react';
import { RUN_MODES } from '../../shared/utils/modeDetector';

/**
 * Mode context
 * Provides running mode and event bus to child components
 */
export const ModeContext = createContext(null);

/**
 * Mode Provider - Provides running mode information
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.embedded=false] - Embedded mode flag
 * @param {Object} [props.eventBus] - Event bus reference
 * 
 * @example
 * <ModeProvider embedded={true} eventBus={eventBus}>
 *   <App />
 * </ModeProvider>
 */
export const ModeProvider = ({ children, embedded = false, eventBus = null }) => {
  const value = useMemo(() => ({
    mode: embedded ? RUN_MODES.EMBEDDED : RUN_MODES.STANDALONE,
    embedded,
    eventBus,
    isStandalone: !embedded,
    isEmbedded: embedded,
  }), [embedded, eventBus]);

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};

/**
 * Hook to access mode context
 * Provides running mode information to components
 * 
 * @returns {Object} Mode context value
 * @returns {string} return.mode - Running mode (standalone | embedded)
 * @returns {boolean} return.embedded - Embedded mode flag
 * @returns {boolean} return.isStandalone - Standalone mode flag
 * @returns {boolean} return.isEmbedded - Embedded mode flag
 * @returns {Object|null} return.eventBus - Event bus reference
 * 
 * @throws {Error} If used outside ModeProvider
 * 
 * @example
 * const { mode, isEmbedded, eventBus } = useMode();
 * 
 * if (isEmbedded) {
 *   // Embedded mode specific logic
 * }
 */
export const useMode = () => {
  const context = useContext(ModeContext);
  
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  
  return context;
};