import { useCallback, useEffect, useState } from "react";
import { clearAllStores } from "../utils/persistence";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useEmergencySwapStore } from "../stores/EmergencySwapStore";

/**
 * 应用启动时把 IndexedDB（或 localStorage 降级）中的数据水合进所有 zustand store，
 * 之后各页面共享同一份内存态；写入动作各自落库，刷新后仍在。
 */
export function useIndexedDbStore() {
  const [ready, setReady] = useState(false);

  const hydrate = useCallback(async () => {
    setReady(false);
    await Promise.all([
      useFixtureStore.getState().load(),
      useCueSceneStore.getState().load(),
      useTimelineTrackStore.getState().load(),
      useShowProjectStore.getState().load(),
      useEmergencySwapStore.getState().load()
    ]);
    setReady(true);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const resetLocalData = useCallback(async () => {
    await clearAllStores();
    await hydrate();
  }, [hydrate]);

  return { ready, resetLocalData };
}
