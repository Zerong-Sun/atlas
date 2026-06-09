import { Stack } from "expo-router";
import { LibraryBrowser } from "@/components/LibraryBrowser";
import { Screen } from "@/components/ui/Screen";

export default function LibraryScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "书库" }} />
      <Screen scroll>
        <LibraryBrowser />
      </Screen>
    </>
  );
}
