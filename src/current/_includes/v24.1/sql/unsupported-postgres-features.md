### `CREATE DOMAIN`

CockroachDB does not support `CREATE DOMAIN`. Tracking issue: [cockroachdb/cockroach#108659](https://github.com/cockroachdb/cockroach/issues/108659).

### PostgreSQL range types

CockroachDB does not support PostgreSQL range types. Tracking issue: [cockroachdb/cockroach#128638](https://github.com/cockroachdb/cockroach/issues/128638).

### Other unsupported features

- Triggers. These must be implemented in your application logic.
- Events.
- Drop primary key.

    {{site.data.alerts.callout_info}}
    Each table must have a primary key associated with it. You can [drop and add a primary key constraint within a single transaction]({% link {{ page.version.version }}/alter-table.md %}#drop-and-add-a-primary-key-constraint).
    {{site.data.alerts.end}}
- XML functions.
- Column-level privileges.
- XA syntax.
- Creating a database from a template.
- [Dropping a single partition from a table]({% link {{ page.version.version }}/partitioning.md %}#known-limitations).
- Foreign data wrappers.
- Advisory Lock Functions (although some functions are defined with no-op implementations).
