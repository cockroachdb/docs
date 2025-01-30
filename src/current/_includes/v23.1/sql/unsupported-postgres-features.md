- Stored procedures. CockroachDB has support for [user-defined functions]({{ page.version.version }}/user-defined-functions.md), which can be used for many of the same goals as stored procedures.
- Triggers. These must be implemented in your application logic.
- Events.
- Drop primary key.

    {{site.data.alerts.callout_info}}
    Each table must have a primary key associated with it. You can [drop and add a primary key constraint within a single transaction]({{ page.version.version }}/alter-table.md#drop-and-add-a-primary-key-constraint).
    {{site.data.alerts.end}}
- XML functions.
- Column-level privileges.
- XA syntax.
- Creating a database from a template.
- [Dropping a single partition from a table]({{ page.version.version }}/partitioning.md#known-limitations).
- Foreign data wrappers.
- Advisory Lock Functions (although some functions are defined with no-op implementations).
