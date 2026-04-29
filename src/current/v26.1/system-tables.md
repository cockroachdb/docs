---
title: sql: add DOMAIN type support
summary: Based on my analysis of the provided diff, I found that **no system tables or views were detected** in this PR. The diff shows the addition of DOMAIN type support to CockroachDB, which includes:
toc: true
docs_area: reference.sql
---

Based on my analysis of the provided diff, I found that **no system tables or views were detected** in this PR. The diff shows the addition of DOMAIN type support to CockroachDB, which includes:

- New SQL grammar for `CREATE DOMAIN` and `DROP DOMAIN` statements
- Updates to the TypeDescriptor protobuf to support domain types
- Implementation of domain type functionality in the catalog system
- Updates to various SQL execution paths to handle domains

However, the changes are primarily focused on:
1. Adding new SQL syntax and grammar files
2. Extending existing type descriptor structures
3. Modifying SQL execution logic for type creation/deletion
4. Updating validation and hydration code for type descriptors

**No new system tables or views were introduced** in this PR. The changes are entirely related to adding a new SQL feature (DOMAIN types) without exposing any new system catalog tables or information schema views that would require reference documentation.

If you have a different PR that includes system table/view changes, please provide that diff instead and I'll be happy to generate the appropriate reference documentation.
