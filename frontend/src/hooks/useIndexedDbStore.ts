import { useEffect, useState } from "react";

// 页面挂载时并行触发若干 store 的 load（底层走 IndexedDB），全部就绪后返回 true。
export function useIndexedDbStore(loaders: Array<() => Promise<void>>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    setReady(false);
    Promise.all(loaders.map((load) => load().catch(() => undefined))).finally(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready;
}
