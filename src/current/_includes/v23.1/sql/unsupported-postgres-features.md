- Stored procedures. CockroachDB has support for [user-defined functions](user-defined-functions.html), which can be used for many of the same goals as stored procedures.
- Triggers.
- Events.
- Drop primary key.

    {{site.data.alerts.callout_info}}
    Each table must have a primary key associated with it. You can [drop and add a primary key constraint within a single transaction](alter-table.html#drop-and-add-a-primary-key-constraint).
    {{site.data.alerts.end}}
- XML functions.
- Column-level privileges.
- XA syntax.
- Creating a database from a template.
- [Dropping a single partition from a table](partitioning.html#known-limitations).
- Foreign data wrappers.
