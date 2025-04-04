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
