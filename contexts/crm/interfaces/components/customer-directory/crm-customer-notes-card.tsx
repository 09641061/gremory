"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { updateCustomerNotesAction } from "@/contexts/crm/interfaces/actions/update-customer-notes.action";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";

export interface CrmCustomerNotesCardProps {
  customerId: string;
  establishmentId: string;
  initialNotes?: string | null;
}

export function CrmCustomerNotesCard({
  customerId,
  establishmentId,
  initialNotes = "",
}: CrmCustomerNotesCardProps) {
  const t = useCrmTranslations();
  const [notes, setNotes] = React.useState(initialNotes ?? "");
  const [prevInitialNotes, setPrevInitialNotes] = React.useState(initialNotes);
  const [savingNotes, setSavingNotes] = React.useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = React.useState(false);

  if (initialNotes !== prevInitialNotes) {
    setPrevInitialNotes(initialNotes);
    setNotes(initialNotes ?? "");
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSavedSuccess(false);

    try {
      const res = await updateCustomerNotesAction(customerId, establishmentId, notes);
      if (res.status === "success") {
        setNotesSavedSuccess(true);
        setTimeout(() => setNotesSavedSuccess(false), 3000);
      }
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{t.masterDetail.notesTitle}</CardTitle>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="h-8 text-xs"
        >
          {savingNotes ? t.masterDetail.savingNotes : t.masterDetail.saveNotes}
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Textarea
          placeholder={t.masterDetail.notesPlaceholder}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          className="text-sm resize-none"
        />
        {notesSavedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <Check className="size-3.5" />
            {t.masterDetail.notesSaved}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
