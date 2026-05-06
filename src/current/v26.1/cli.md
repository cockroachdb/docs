---
title: docs: document pg_get_function_sqlbody function from PR #169716
summary: Analysis
toc: true
docs_area: reference.cli
---

## Analysis

This PR implements a new SQL builtin function and improves an existing SQL shell feature, but does not add new CLI commands. Specifically:

1. **New SQL Function**: The PR adds `pg_get_function_sqlbody(oid) -> text` as a PostgreSQL-compatible builtin function (this is SQL functionality, not CLI)

2. **Improved `\df+` Output**: The PR modifies the existing `\df+` meta-command in the SQL shell to use the new function for better PostgreSQL compatibility, but `\df+` was already a supported command

3. **No New CLI Commands**: The changes are in:
   - SQL builtin function implementation (`pkg/sql/sem/builtins/`)
   - SQL shell meta-command behavior (`pkg/cli/clisqlshell/describe.go`)
   - Generated SQL function documentation (`docs/generated/sql/functions.md`)

## CLI Context

The `\df+` command is a psql-style meta-command that lists functions with detailed information. This PR improves its "Source code" column by using:
```sql
COALESCE(p.prosrc, pg_catalog.pg_get_function_sqlbody(p.oid)) AS "Source code"
```
instead of just `p.prosrc`, providing better PostgreSQL compatibility.

## Recommendation

No CLI command reference documentation is needed for this PR. The changes improve existing SQL shell functionality and add a SQL builtin function, but do not introduce new CLI commands.

The extraction correctly identified "(No CLI commands detected in diff)" - this PR enhances SQL functionality rather than adding CLI commands.
