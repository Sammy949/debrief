import Link from "next/link";
import { Brain } from "@phosphor-icons/react/dist/ssr";

/** The brand lockup: the Debrief mark + wordmark, linking home. Shared by the
 *  site nav and the debrief surfaces so the logo reads the same everywhere. */
export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Brain weight="duotone" className="size-5 text-amber" />
      <span className="font-serif text-xl tracking-tight text-ivory">Debrief</span>
    </Link>
  );
}
