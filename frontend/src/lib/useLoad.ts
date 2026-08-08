import { useEffect } from "react";

/**
 * Runs an async loader on mount (and whenever `loader` changes).
 * The loader resolves on a microtask, so state updates never happen
 * synchronously inside the effect body.
 */
export function useLoad(loader: () => Promise<void>) {
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) return loader();
    });
    return () => {
      active = false;
    };
  }, [loader]);
}
