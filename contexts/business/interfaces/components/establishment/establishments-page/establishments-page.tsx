"use client";

import { useMemo, useState } from "react";
import { EstablishmentsSearchBar } from "./establishments-search-bar";
import { EstablishmentListCard } from "./establishment-list-card";
import { EstablishmentDetailCard } from "./establishment-detail-card";

export type EstablishmentListItem = {
  id: string;
  name: string;
  photoUrl: string | null;
  timeZone: string | null;
};

export function EstablishmentsPage({
  establishments,
  selectedEstablishment,
  initialSelectedEstablishmentId,
  canUpdateMap = {},
  defaultCanUpdate = true,
  canCreate = true,
}: {
  establishments: EstablishmentListItem[];
  selectedEstablishment?: EstablishmentListItem | null;
  initialSelectedEstablishmentId?: string;
  canUpdateMap?: Record<string, boolean>;
  defaultCanUpdate?: boolean;
  canCreate?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [selectedEstId, setSelectedEstId] = useState<string | null>(
    initialSelectedEstablishmentId ?? null,
  );

  const filteredEstablishments = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return establishments;
    return establishments.filter((est) =>
      est.name.toLowerCase().includes(normalized)
    );
  }, [filter, establishments]);

  const selectedEst =
    (selectedEstablishment?.id === selectedEstId ? selectedEstablishment : null) ??
    establishments.find((est) => est.id === selectedEstId) ??
    null;
  const canUpdateSelected = selectedEst ? (canUpdateMap[selectedEst.id] ?? defaultCanUpdate) : defaultCanUpdate;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      {/* Columna izquierda */}
      <div className="w-full space-y-6 lg:flex-1 lg:flex lg:flex-col lg:h-[calc(100vh-10rem)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between shrink-0">
          <div>
            <h1 className="page-title">Establishments</h1>
            <p className="page-description mt-2">
              Search, create, and manage the places where your business operates.
            </p>
          </div>
        </div>

        <EstablishmentsSearchBar value={filter} onChange={setFilter} canCreate={canCreate} />

        <EstablishmentListCard
          establishments={establishments}
          filteredEstablishments={filteredEstablishments}
          selectedEstId={selectedEstId}
          onSelect={setSelectedEstId}
        />
      </div>

      {/* Columna derecha */}
      <EstablishmentDetailCard
        key={
          selectedEst
            ? `${selectedEst.id}-${selectedEst.timeZone ?? ""}-${selectedEst.name}-${selectedEst.photoUrl ?? ""}`
            : "empty"
        }
        establishment={selectedEst}
        canUpdate={canUpdateSelected}
        onCancel={() => setSelectedEstId(null)}
      />
    </section>
  );
}
