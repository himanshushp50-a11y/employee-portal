// Vite 8's ESM/CJS interop mishandles the default export of
// `redux-persist/lib/storage` in this project, so we implement the
// same minimal localStorage-backed engine redux-persist expects.
const storage = {
  getItem(key: string): Promise<string | null> {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string): Promise<void> {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string): Promise<void> {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default storage;
