import { getMethodDeepLibrary } from "@/data/methodDeepLibraries";
import { getMethodReferenceLibrary } from "@/data/methodReferenceLibraries";
import { getMethodModuleKit } from "@/data/methodModuleKits";
import { getMethodModule } from "@/data/methodModules";
import { getMethodOperationLibrary } from "@/data/methodOperationLibraries";

export function isPreviewWorkbenchReady(id: string): boolean {
  const module = getMethodModule(id);
  const kit = getMethodModuleKit(id);
  const operationLibrary = getMethodOperationLibrary(id);
  const deepLibrary = getMethodDeepLibrary(id);
  const referenceLibrary = getMethodReferenceLibrary(id);

  return Boolean(module && kit && operationLibrary && (deepLibrary || referenceLibrary));
}
