"use client";

import { useEffect, useState } from "react";

type SubmitIdeaPayload = {
  title: string;
  summary: string;
  authorLabel: string;
};

type SubmitIdeaModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: SubmitIdeaPayload) => void;
};

export function SubmitIdeaModal({
  open,
  onClose,
  onSubmit,
}: SubmitIdeaModalProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [authorLabel, setAuthorLabel] = useState("Shared locally in dashboard");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSummary("");
      setAuthorLabel("Shared locally in dashboard");
    }
  }, [open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0 && summary.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Local workflow entry
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Submit Idea</h2>
            <p className="mt-2 text-sm text-slate-300">
              This is a local-only interaction surface. No backend or persistence is used in this slice.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-200">Idea title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              placeholder="Enter a short idea title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">Idea summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              placeholder="Describe the idea in a few sentences"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-200">Author label</label>
            <input
              value={authorLabel}
              onChange={(e) => setAuthorLabel(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              placeholder="Shared locally in dashboard"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                summary: summary.trim(),
                authorLabel: authorLabel.trim() || "Shared locally in dashboard",
              })
            }
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to local pipeline
          </button>
        </div>
      </div>
    </div>
  );
}
