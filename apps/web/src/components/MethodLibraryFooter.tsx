import { Link } from "react-router-dom";
import { getMethodDeepLibrary } from "@/data/methodDeepLibraries";
import { getMethodReferenceLibrary } from "@/data/methodReferenceLibraries";
import { MethodDeepLibraryPanel } from "@/components/MethodDeepLibraryPanel";
import { MethodReferenceLibraryPanel } from "@/components/MethodReferenceLibraryPanel";

type Props = {
  methodId: string;
};

export function MethodLibraryFooter({ methodId }: Props) {
  const referenceLibrary = getMethodReferenceLibrary(methodId);
  const deepLibrary = getMethodDeepLibrary(methodId);

  return (
    <>
      {referenceLibrary && <MethodReferenceLibraryPanel library={referenceLibrary} />}
      {deepLibrary && <MethodDeepLibraryPanel library={deepLibrary} />}
      <Link className="method-module-back" to="/methods">
        返回占法列表
      </Link>
    </>
  );
}
