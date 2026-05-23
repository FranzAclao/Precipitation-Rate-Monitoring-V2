import { useEffect, useState } from "react";
import {
  getFloodSnapshot,
  subscribeFloodData,
  startFloodSubscriptions,
} from "./floodData/firebaseSubscription";

export function useFloodData() {
  const [data, setData] = useState(getFloodSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeFloodData(setData);
    setData(getFloodSnapshot());
    startFloodSubscriptions();

    return unsubscribe;
  }, []);

  return data;
}
