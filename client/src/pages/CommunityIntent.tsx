import { useState } from 'react';
import { useLocation } from 'wouter';

/**
 * OS-BAAAS-001A — Community Intent
 *
 * Scope: capture ONLY. This page produces a structured CommunityIntent
 * object in local runtime state. It does not persist, preview, confirm,
 * or create anything — that is explicitly out of scope for 001A and is
 * left for the (not-yet-implemented) OS-BAAAS-001B authority.
 *
 * No backend contract exists yet for this object. Wiring the handoff to
 * 001B is intentionally left as a TODO rather than invented here.
 */

type Visibility = 'public' | 'private';

export interface CommunityIntent {
  goal: string;
  name: string;
  description: string;
  category: string;
  audience: string;
  visibility: Visibility;
  coverImageUrl: string;
}

const EMPTY_INTENT: CommunityIntent = {
  goal: '',
  name: '',
  description: '',
  category: '',
  audience: '',
  visibility: 'public',
  coverImageUrl: '',
};

type Stage = 'goal' | 'define' | 'review';

export default function CommunityIntentPage() {
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<Stage>('goal');
  const [intent, setIntent] = useState<CommunityIntent>(EMPTY_INTENT);
  const [errors, setErrors] = useState<Partial<Record<keyof CommunityIntent, string>>>({});

  const updateField = <K extends keyof CommunityIntent>(field: K, value: CommunityIntent[K]) => {
    setIntent((prev) => ({ ...prev, [field]: value }));
  };

  const validateGoal = () => {
    if (!intent.goal.trim()) {
      setErrors({ goal: 'Tell us what you\u2019re trying to accomplish.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateDefine = () => {
    const nextErrors: Partial<Record<keyof CommunityIntent, string>> = {};
    if (!intent.name.trim()) nextErrors.name = 'Community name is required.';
    if (!intent.description.trim()) nextErrors.description = 'Add a short description or story.';
    if (!intent.category.trim()) nextErrors.category = 'Category is required.';
    if (!intent.audience.trim()) nextErrors.audience = 'Audience is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGoalContinue = () => {
    if (validateGoal()) setStage('define');
  };

  const handleDefineContinue = () => {
    if (validateDefine()) setStage('review');
  };

  const handleConfirmIntent = () => {
    // Exit condition for OS-BAAAS-001A: a valid structured Community
    // Intent exists in the runtime and can be handed to OS-BAAAS-001B.
    // No certified handoff contract exists yet, so we surface the
    // structured object here rather than inventing an endpoint.
    // eslint-disable-next-line no-console
    console.log('[CommunityIntent] structured intent ready for OS-BAAAS-001B:', intent);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Start a Community</h1>
          <p className="mt-1 text-muted-foreground">
            {stage === 'goal' && 'Before anything else — what are you trying to accomplish?'}
            {stage === 'define' && 'Now let\u2019s define your community.'}
            {stage === 'review' && 'Review your Community Intent.'}
          </p>
        </header>

        {stage === 'goal' && (
          <section className="rounded-lg border border-border bg-card p-6">
            <label className="mb-2 block text-sm font-medium" htmlFor="goal">
              What do I want to accomplish?
            </label>
            <textarea
              id="goal"
              rows={4}
              value={intent.goal}
              onChange={(e) => updateField('goal', e.target.value)}
              placeholder="e.g. Bring together members interested in supporting each other through the study-abroad process"
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
            {errors.goal && <p className="mt-1 text-sm text-destructive">{errors.goal}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setLocation('/organization')}
                className="rounded-md border border-border px-4 py-2 transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGoalContinue}
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a Community
              </button>
            </div>
          </section>
        )}

        {stage === 'define' && (
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4">
              <div className="text-sm font-medium text-muted-foreground">Your goal</div>
              <p className="mt-1 text-sm">{intent.goal}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="name">
                  Community name
                </label>
                <input
                  id="name"
                  type="text"
                  value={intent.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="description">
                  Description / story
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={intent.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="category">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={intent.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="e.g. Education, Mentorship, Local Support"
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">{errors.category}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Free text — no category taxonomy was found to validate against.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="audience">
                  Audience
                </label>
                <input
                  id="audience"
                  type="text"
                  value={intent.audience}
                  onChange={(e) => updateField('audience', e.target.value)}
                  placeholder="Who is this community for?"
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                {errors.audience && (
                  <p className="mt-1 text-sm text-destructive">{errors.audience}</p>
                )}
              </div>

              <div>
                <span className="mb-1 block text-sm font-medium">Visibility</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      checked={intent.visibility === 'public'}
                      onChange={() => updateField('visibility', 'public')}
                    />
                    Public
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="visibility"
                      checked={intent.visibility === 'private'}
                      onChange={() => updateField('visibility', 'private')}
                    />
                    Private
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="coverImageUrl">
                  Cover image URL <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="coverImageUrl"
                  type="url"
                  value={intent.coverImageUrl}
                  onChange={(e) => updateField('coverImageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  No file-upload backend was found, so this accepts a URL for now.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStage('goal')}
                className="rounded-md border border-border px-4 py-2 transition-colors hover:bg-accent"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDefineContinue}
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Review
              </button>
            </div>
          </section>
        )}

        {stage === 'review' && (
          <section className="rounded-lg border border-border bg-card p-6">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Goal</dt>
                <dd className="mt-0.5">{intent.goal}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Community name</dt>
                <dd className="mt-0.5">{intent.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-0.5">{intent.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="mt-0.5">{intent.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Audience</dt>
                <dd className="mt-0.5">{intent.audience}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Visibility</dt>
                <dd className="mt-0.5 capitalize">{intent.visibility}</dd>
              </div>
              {intent.coverImageUrl && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Cover image</dt>
                  <dd className="mt-0.5 break-all">{intent.coverImageUrl}</dd>
                </div>
              )}
            </dl>

            <p className="mt-5 text-sm text-muted-foreground">
              This captures your Community Intent. Readiness checks, preview, and
              community creation happen in a later step that isn&apos;t built yet.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStage('define')}
                className="rounded-md border border-border px-4 py-2 transition-colors hover:bg-accent"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmIntent}
                className="rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Save Community Intent
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
