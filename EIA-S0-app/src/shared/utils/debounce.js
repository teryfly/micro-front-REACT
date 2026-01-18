/**
 * Debounce Utility
 * Delays function execution until after specified wait time
 * @module debounce
 */

/**
 * Create debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {Object} [options] - Debounce options
 * @param {boolean} [options.leading=false] - Execute on leading edge
 * @param {boolean} [options.trailing=true] - Execute on trailing edge
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   searchAPI(query);
 * }, 300);
 * 
 * debouncedSearch('hello'); // Waits 300ms before executing
 */
export const debounce = (func, wait, options = {}) => {
  const { leading = false, trailing = true } = options;
  
  let timeout;
  let lastArgs;
  let lastThis;
  let lastCallTime;
  let lastInvokeTime = 0;

  const invokeFunc = (time) => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    
    return func.apply(thisArg, args);
  };

  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : undefined;
  };

  const remainingWait = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return timeWaiting;
  };

  const shouldInvoke = (time) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      timeSinceLastInvoke >= wait
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time) => {
    timeout = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return undefined;
  };

  const debounced = function(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = setTimeout(timerExpired, wait);
    }
    return undefined;
  };

  debounced.cancel = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = undefined;
  };

  debounced.flush = () => {
    return timeout === undefined ? undefined : trailingEdge(Date.now());
  };

  return debounced;
};

/**
 * Create throttled function
 * Limits function execution to once per specified time period
 * 
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   handleScroll();
 * }, 100);
 */
export const throttle = (func, wait) => {
  return debounce(func, wait, { leading: true, trailing: false });
};