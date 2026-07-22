import { LibraryBrowser } from "@/components/LibraryBrowser";
import { Screen } from "@/components/ui/Screen";

export default function LibraryTabScreen() {
  return (
    <Screen scroll>
      <LibraryBrowser showTitle />
    </Screen>
  );
}
