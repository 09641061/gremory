import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { KoduStaIcon } from "@/contexts/shared/interfaces/components/icons/kodu";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import type { IamAuthBrand } from "../i18n";

/**
 * Left side of the authentication screens: brand, product promise and the
 * Kodu mascot. It never carries form controls, so it is hidden on small
 * screens where the form takes the whole viewport.
 */
export function AuthBrandPanel({ brand }: { brand: IamAuthBrand }) {
  return (
    <aside className="hidden w-[58%] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(140deg,#e9f9f3_0%,#d5f0e5_48%,#c0e7d5_100%)] px-12 py-12 lg:flex xl:px-16 xl:py-14">
      <Button
        nativeButton={false}
        variant="ghost"
        size="sm"
        render={<Link href="/" />}
        className="h-9 w-fit gap-2 px-2.5 font-bold tracking-tight text-[#0c211b] hover:bg-transparent"
      >
        <ArrowLeftIcon data-icon="inline-start" />
        {brand.name}
        <span className="sr-only">· {brand.backToHome}</span>
      </Button>

      <div className="flex flex-col items-start gap-10">
        <KoduStaIcon size={196} />

        <div className="space-y-4">
          <p className="max-w-md text-[34px] font-extrabold leading-[1.1] tracking-tight text-[#0c211b] xl:text-[40px]">
            {brand.tagline}
          </p>
          <p className="max-w-md text-[15px] leading-relaxed text-[#3d6158]">
            {brand.description}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#4b7168]">{brand.footer}</p>
    </aside>
  );
}
