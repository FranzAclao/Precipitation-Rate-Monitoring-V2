import { onValue, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { ALLOWED_NODE_PATHS, DEFAULT_STATE } from "./constants";
import { buildFloodState } from "./builders";

let sharedState = DEFAULT_STATE;
let sharedLiveRoot = {};
let sharedUnsubs = [];
const sharedListeners = new Set();

function emitSharedState(nextState) {
  sharedState = nextState;
  sharedListeners.forEach((listener) => listener(nextState));
}

export function getFloodSnapshot() {
  return sharedState;
}

export function subscribeFloodData(listener) {
  sharedListeners.add(listener);
  return () => {
    sharedListeners.delete(listener);
  };
}

export function startFloodSubscriptions() {
  if (sharedUnsubs.length > 0) return;

  sharedUnsubs = ALLOWED_NODE_PATHS.map((path) => {
    const nodeRef = ref(database, path);
    return onValue(
      nodeRef,
      (snap) => {
        sharedLiveRoot[path] = snap.val() || {};
        emitSharedState(buildFloodState({ ...sharedLiveRoot }));
      },
      (error) => {
        console.error(`RTDB read failed for ${path}:`, error?.code || error?.message || error);
        emitSharedState({
          ...sharedState,
          loading: false,
        });
      }
    );
  });
}
