---
title: docs: document pg_dump compatibility mode from PR #167973
summary: Changes to Existing System Tables
toc: true
docs_area: reference.sql
---

## Changes to Existing System Tables

This PR introduces the `pg_dump_compatibility` session variable that affects how existing `pg_catalog` tables report their OID values and content:

### Affected Tables

The following existing `pg_catalog` tables now have modified behavior when `pg_dump_compatibility` is set to `'postgres'`:

- `pg_cast` - OIDs remapped to PostgreSQL-compatible values
- `pg_am` - Access method names changed (e.g., `prefix` → `btree`, `inverted` → `heap`)
- `pg_class` - Table OIDs remapped for compatibility
- `pg_tablespace` - Tablespace OIDs remapped
- `pg_depend` - Dependency OIDs remapped for proper view resolution
- `pg_shdepend` - Shared dependency OIDs remapped
- `pg_description` - Object description OIDs remapped
- `pg_shdescription` - Shared description OIDs remapped

### Session Variable

**New session variable**: `pg_dump_compatibility`

**Values**:
- `'off'` (default) - Standard CockroachDB behavior
- `'postgres'` - PostgreSQL-compatible OIDs and hidden CockroachDB-specific objects
- `'cockroachdb'` - PostgreSQL-compatible OIDs but retain CockroachDB-specific syntax

### Example Usage

{% include_cached copy-clipboard.html %}
~~~ sql
-- Enable pg_dump compatibility
SET pg_dump_compatibility = 'postgres';

-- pg_cast now returns PostgreSQL-compatible OIDs
SELECT oid FROM pg_cast LIMIT 5;
----
  oid
-------
  2034
  2035
  2036
  2037
  2038

-- pg_am returns standard PostgreSQL access method names
SELECT oid, amname FROM pg_am;
----
 oid |  amname
-----+---------
 403 | btree
   2 | heap

-- Reset to default behavior
SET pg_dump_compatibility = 'off';
~~~

### Benefits

This change allows `pg_dump` to:
- Recognize CockroachDB's catalog objects as PostgreSQL-compatible built-ins
- Properly resolve view dependencies during dump operations
- Generate dumps that can run on PostgreSQL servers (when using `'postgres'` mode)

**See also**:
- [Session variables]({% link {{ page.version.version }}/session-variables.md %})
- [pg_dump documentation]({% link {{ page.version.version }}/backup-and-restore.md %})
