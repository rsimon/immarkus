import pThrottle from 'p-throttle';

interface ThrottleConfig {

  limit: number;

  interval: number;

}

interface ThrottledLoaderOpts {

  callsPerSecond?: number;

}

const createThrottleManager = () => {

  // Default config: 5 calls/second
  let config: ThrottleConfig = {
    limit: 5,
    interval: 1000
  };
  
  let instance = pThrottle(config);

  const getInstance = () => instance;

  const setConfig = (updated: Partial<ThrottleConfig>) => {
    config = {...config, ...updated };
    instance = pThrottle(config);
  }

  const getConfig = () => ({ ...config });

  return {
    getInstance,
    getConfig,
    setConfig
  };

}

// Singleton instance
const throttleManager = createThrottleManager();

const updateThrottleConfig = (opts?: Partial<ThrottleConfig>) => {
  if (!opts) return;

  const current = throttleManager.getConfig();

  if (
    (opts.limit && opts.limit !== current.limit) ||
    (opts.interval && opts.interval !== current.interval)
  ) {
    console.log('updating throttle config!');
    throttleManager.setConfig({ ...current, ...opts });
  }
}

export const getThrottledLoader = (
  opts?: ThrottledLoaderOpts
) => {
  if (opts) {
    const throttleOpts = {
      limit: opts.callsPerSecond || 5,
      interval: 1000
    }

    updateThrottleConfig(throttleOpts);
  }

  const throttle = throttleManager.getInstance();

  const loadImage = throttle((url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  }));

  return { loadImage };

}