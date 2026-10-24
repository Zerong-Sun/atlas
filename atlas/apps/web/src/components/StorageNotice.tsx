import { useSyncExternalStore } from "react";
import { getStorageNotice, subscribeStorageNotice } from "@/lib/persistentStore";

export function StorageNotice() {
  const message = useSyncExternalStore(subscribeStorageNotice, getStorageNotice, () => "");
  return message ? <div className="storage-notice" role="status">{message}</div> : null;
}
