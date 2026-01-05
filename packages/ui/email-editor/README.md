# UI Email Editor

## State architecture

- Document store (`useEmailDocStore`): canonical MJML node map + patch-based undo history.
- UI store (`useEmailUIStore`): ephemeral interaction state (selection, hover, drag).
- Selector-first hooks live in `src/store` and are exported from `@kompaniya/ui-email-editor/store`.

## Adding document actions

- Add document mutations in `packages/ui/email-editor/src/store/email-doc-store.ts`.
- Wrap changes in `commitDoc` so Immer patches are recorded for undo/redo.
- Keep mutations scoped to the `doc` tree; no-op mutations should produce no patches.
- Use `setDoc` or `setFromMjmlJson` for bulk replace/import flows.

## Undo/redo behavior

- History entries store Immer patches (no full snapshots).
- Only document-changing actions are undoable.
- `history.maxHistory` caps the number of stored entries (oldest entries drop first).
- Undo/redo does not restore UI selection or hover state.
