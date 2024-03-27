- Triggers. These must be implemented in your application logic
- Events
- Drop primary key

    {{site.data.alerts.callout_info}}
    Each table must have a primary key associated with it. You can [drop and add a primary key constraint within a single transaction]({% link {{ page.version.version }}/alter-table.md %}#drop-and-add-a-primary-key-constraint).
    {{site.data.alerts.end}}
- ALTER TABLE ... ADD UNIQUE/PRIMARY KEY USING INDEX
- XML functions
- Column-level privileges
- XA syntax
- Creating a database from a template
- [Dropping a single partition from a table]({% link {{ page.version.version }}/partitioning.md %}#known-limitations)
- Foreign data wrappers
- Advisory Lock Functions (although some functions are defined with no-op implementations)
- LISTEN, UNLISTEN and NOTIFY
- `COPY [table] TO [file]` syntax
- PL/python
- Deferrable constraints
- Exclusion constraints
- Updatable views (e.g. INSERT, UPDATE, DELETE against a view)
- Variadic parameters in procedures
- Variadic parameters in functions
- Table inheritance
- Range types
- Multiranges
- Underscores for thousand separators
- Table access methods
- Set `LOGGED/UNLOCKED`
- ALTER object IF EXISTS
- WITHIN GROUP
- MERGE
- CREATE TEMPORARY TABLE ... ON COMMIT DELETE ROWS
- CREATE TEMPORARY TABLE ... ON COMMIT DROP
- Typed tables (e.g. `CREATE TABLE hgv OF vehicle_type;`)
- UNIQUE NULLS DISTINCT/NOT DISTINCT
- CREATE STATISTICS - most-common values (MCV) statistics
- GROUPING SETS, CUBE and ROLLUP support
- Large Objects (lo_create etc.)