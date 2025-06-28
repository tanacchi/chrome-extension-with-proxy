import '@testing-library/jest-dom';

// Mock chrome APIs
global.chrome = {
  runtime: {
    getURL: (path: string) => `chrome-extension://test/${path}`,
  },
  tabs: {
    create: () => {},
  },
  storage: {
    local: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve(),
      onChanged: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
  },
} as any;