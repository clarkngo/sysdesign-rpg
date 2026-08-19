# Asset archive

When replacing or deleting any file under `src/assets/` (except this `archive/` tree), **move the previous file here first**. Do not `rm` active assets without an archive copy.

## Layout

```
src/assets/archive/
  YYYY-MM-DD-short-reason/
    <original-filenames>
    MANIFEST.md
```

## Steps

1. Create `src/assets/archive/YYYY-MM-DD-<reason>/`.
2. Copy/move the outgoing asset(s) into that folder (keep original names).
3. Write a short `MANIFEST.md` listing what changed and what replaced them.
4. Then write the new files into `src/assets/`.

Active game assets stay flat in `src/assets/`. Only retired versions live under `archive/`.
