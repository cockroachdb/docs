- Stored procedures
  - {% include_cached new-in.html version="v22.2" %} CockroachDB has support for [user-defined functions](user-defined-functions.html).
- Triggers.
- Events.
- `FULLTEXT` functions and indexes.
  - Depending on your use case, you may be able to get by using [trigram indexes](trigram-indexes.html) to do fuzzy string matching and pattern matching.
- Drop primary key.

    {{site.data.alerts.callout_info}}
    Each table must have a primary key associated with it. You can [drop and add a primary key constraint within a single transaction](drop-constraint.html#drop-and-add-a-primary-key-constraint).
    {{site.data.alerts.end}}
- XML functions.
- Column-level privileges.
- XA syntax.
- Creating a database from a template.
- [Dropping a single partition from a table](partitioning.html#known-limitations).
- Foreign data wrappers.
