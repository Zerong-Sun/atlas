import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFT_PREFIX = "@atlas/method_draft:";
const GUIDE_PREFIX = "@atlas/method_guide_seen:";

export async function getMethodDraft<T>(methodId: string): Promise<Partial<T> | null> {
  const raw = await AsyncStorage.getItem(`${DRAFT_PREFIX}${methodId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<T>;
  } catch {
    return null;
  }
}

export async function setMethodDraft<T>(methodId: string, draft: Partial<T>): Promise<void> {
  await AsyncStorage.setItem(`${DRAFT_PREFIX}${methodId}`, JSON.stringify(draft));
}

export async function clearMethodDraft(methodId: string): Promise<void> {
  await AsyncStorage.removeItem(`${DRAFT_PREFIX}${methodId}`);
}

export async function getMethodGuideSeen(methodId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${GUIDE_PREFIX}${methodId}`)) === "1";
}

export async function setMethodGuideSeen(methodId: string, seen: boolean): Promise<void> {
  await AsyncStorage.setItem(`${GUIDE_PREFIX}${methodId}`, seen ? "1" : "0");
}
