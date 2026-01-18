import React, { createContext, useContext } from 'react';

/**
 * Communication context
 * Provides communication manager to child components
 */
export const CommunicationContext = createContext(null);

/**
 * Communication Provider - Provides communication manager
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {CommunicationManager} props.commManager - Communication manager instance
 * 
 * @example
 * <CommunicationProvider commManager={commManager}>
 *   <App />
 * </CommunicationProvider>
 */
export const CommunicationProvider = ({ children, commManager }) => {
  return (
    <CommunicationContext.Provider value={commManager}>
      {children}
    </CommunicationContext.Provider>
  );
};

/**
 * Hook to access communication manager
 * 
 * @returns {CommunicationManager|null} Communication manager instance
 * 
 * @example
 * const commManager = useCommunication();
 * 
 * if (commManager) {
 *   commManager.send('custom:event', { data: 'value' });
 * }
 */
export const useCommunication = () => {
  return useContext(CommunicationContext);
};