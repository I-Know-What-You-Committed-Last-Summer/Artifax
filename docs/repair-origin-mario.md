Summary
-------

On 2026-05-26 I removed a malformed remote branch named `origin/Mario` that was confusing local git clients and VS Code. To preserve its content a backup branch was created and pushed as `backup/origin-Mario`.

Actions performed
-----------------

- Created local branch `backup/origin-Mario` from `refs/remotes/origin/origin/Mario`.
- Pushed `backup/origin-Mario` to remote.
- Deleted the malformed remote branch `origin/Mario`.
- Deleted the local branch named `origin/Mario`.
- Fetched and pruned remote refs.

Why
---

The remote contained a branch literally named `origin/Mario` which conflicted with the normal `origin/Mario` tracking name. This caused the persistent ahead/behind indicator in VS Code and could block pulls from other branches.

How to recover
---------------

If you need to restore the exact content of the malformed branch, the backup is available as `backup/origin-Mario` on the remote. To restore it as a normal branch named `Mario` run:

```bash
git fetch origin
git checkout -b Mario origin/backup/origin-Mario
git push -u origin Mario
```

Notes
-----

No source files were modified as part of this fix. Backend and frontend were built locally to verify repository health.
