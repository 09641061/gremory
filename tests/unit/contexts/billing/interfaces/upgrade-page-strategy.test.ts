import { Suspense } from "react";
import { describe, expect, it } from "vitest";

import * as upgradePageModule from "@/app/(protected)/upgrade/page";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

describe("UpgradePage cache strategy", () => {
  it("keeps request-bound billing work behind a Suspense boundary", () => {
    const page = upgradePageModule.default();

    expect(page.type).toBe(Suspense);
    expect(page.props.children.type).toBeTypeOf("function");
    expect(page.props.children.type.name).toBe("UpgradePageContent");
    expect(page.props.fallback.type).toBe(PageLoading);
  });

  it("does not opt the entire route out of instant rendering", () => {
    expect("instant" in upgradePageModule).toBe(false);
  });
});
