import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Route Synchronization Hook
 * Syncs route changes between sub-app and host app in embedded mode
 * Prevents infinite sync loops with debouncing and source tracking
 * 
 * @param {Function} onRouteChange - Route change callback to host app
 * @param {Object} eventBus - Event bus for receiving route sync messages
 * @param {boolean} embedded - Embedded mode flag
 * 
 * @example
 * useRouteSync(props.onRouteChange, props.eventBus, true);
 */
export const useRouteSync = (onRouteChange, eventBus, embedded) => {
  const location = useLocation();
  const navigate = useNavigate();
  const lastSyncedRoute = useRef(null);
  const syncInProgress = useRef(false);
  const debounceTimer = useRef(null);

  /**
   * Notify host app of route changes
   */
  const notifyHostApp = useCallback((routeState) => {
    if (!embedded || !onRouteChange) return;

    // Prevent sync loop
    if (syncInProgress.current) {
      return;
    }

    // Debounce route changes (100ms)
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const routeKey = `${routeState.pathname}${routeState.search}${routeState.hash}`;
      
      // Skip if same as last synced route
      if (lastSyncedRoute.current === routeKey) {
        return;
      }

      lastSyncedRoute.current = routeKey;

      if (process.env.NODE_ENV === 'development') {
        console.log('📤 [RouteSync] Notifying host app:', routeState);
      }

      onRouteChange(routeState);
    }, 100);
  }, [embedded, onRouteChange]);

  /**
   * Monitor local route changes and notify host app
   */
  useEffect(() => {
    if (!embedded) return;

    const routeState = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      scrollPosition: window.scrollY,
    };

    notifyHostApp(routeState);
  }, [location, embedded, notifyHostApp]);

  /**
   * Listen for route sync messages from host app
   */
  useEffect(() => {
    if (!embedded || !eventBus) return;

    const handleRouteSync = (data) => {
      const { pathname, search = '', hash = '' } = data;
      const newRoute = `${pathname}${search}${hash}`;
      const currentRoute = `${location.pathname}${location.search}${location.hash}`;

      // Skip if already on this route
      if (newRoute === currentRoute) {
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📥 [RouteSync] Received from host app:', data);
      }

      // Set sync flag to prevent loop
      syncInProgress.current = true;

      // Navigate to new route
      navigate(newRoute, { replace: true });

      // Reset sync flag after navigation
      setTimeout(() => {
        syncInProgress.current = false;
      }, 200);
    };

    eventBus.on('host:route:sync', handleRouteSync);

    return () => {
      eventBus.off('host:route:sync', handleRouteSync);
    };
  }, [embedded, eventBus, navigate, location]);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
};