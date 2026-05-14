---
title: docs: document subset-unique foreign key constraints from PR #169132
summary: Based on the PR diff, I don't see any new or changed system tables or views being introduced. The pull request is focused on adding support for subset-unique foreign keys through:
toc: true
docs_area: reference.sql
---

Based on the PR diff, I don't see any new or changed system tables or views being introduced. The pull request is focused on adding support for subset-unique foreign keys through:

1. A new cluster setting `sql.subset_unique_fks.enabled`
2. Changes to foreign key validation logic
3. Updates to schema changer behavior

However, the cluster setting `sql.subset_unique_fks.enabled` is already documented in the auto-generated settings files shown in the diff. Since this is a cluster setting (not a system table/view) and it's already in the auto-generated documentation, no additional reference documentation for system tables or views is needed for this PR.

The PR introduces behavioral changes to foreign key creation but does not add new system tables or views that would require reference documentation in the format requested.
