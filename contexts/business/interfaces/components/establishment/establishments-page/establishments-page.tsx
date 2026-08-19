"use client";

import { useMemo, useState } from "react";
import { EstablishmentsSearchBar } from "./establishments-search-bar";
import { EstablishmentListCard } from "./establishment-list-card";
import { EstablishmentDetailCard } from "./establishment-detail-card";
import { deleteEstablishmentAction } from "@/contexts/business/interfaces/actions/establishment.actions";
import { DeleteConfirmDialog } from "@/contexts/shared/interfaces/components/delete-confirm-dialog";
import { useEntityDelete } from "@/contexts/shared/interfaces/components/hooks/use-entity-delete";

export type EstablishmentListItem = {
  id: string;
  name: string;
  photoUrl: string | null;
  timeZone: string | null;
  ownerAvailableForScheduling?: boolean;
};

export function EstablishmentsPage({
  establishments,
  selectedEstablishment,
  initialSelectedEstablishmentId,
  canUpdateMap = {},
  canDeleteMap = {},
  defaultCanUpdate = true,
  canCreate = true,
}: {
  establishments: EstablishmentListItem[];
  selectedEstablishment?: EstablishmentListItem | null;
  initialSelectedEstablishmentId?: string;
  canUpdateMap?: Record<string, boolean>;
  canDeleteMap?: Record<string, boolean>;
  defaultCanUpdate?: boolean;
  canCreate?: boolean;
}) {
  const [filter, setFilter] = useState("");
  const [selectedEstId, setSelectedEstId] = useState<string | null>(
    initialSelectedEstablishmentId ?? null,
  );
  const { targetId: deleteTargetId, requestDelete, dialogProps } = useEntityDelete(
    deleteEstablishmentAction,
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
  const deleteTarget = deleteTargetId
    ? establishments.find((est) => est.id === deleteTargetId)
    : null;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      {/* Columna izquierda. En móvil no hay sitio para las dos columnas, así que
          la selección sustituye a la lista y "Cancel"/"Back" vuelve a ella. */}
      <div
        className={`w-full space-y-6 lg:flex lg:h-(--app-page-viewport-height) lg:flex-1 lg:flex-col ${
          selectedEst ? "hidden lg:flex" : ""
        }`}
      >
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
          canUpdateMap={canUpdateMap}
          canDeleteMap={canDeleteMap}
          defaultCanUpdate={defaultCanUpdate}
          onSelect={setSelectedEstId}
          onDelete={requestDelete}
        />
      </div>

      {deleteTarget ? (
        <DeleteConfirmDialog
          {...dialogProps}
          entityLabel="establishment"
          entityName={deleteTarget.name}
        >
          <input type="hidden" name="id" value={deleteTarget.id} />
        </DeleteConfirmDialog>
      ) : null}

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
        className={selectedEst ? "" : "hidden lg:block"}
      />
    </section>
  );
}
