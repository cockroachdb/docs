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
* LISTEN, UNLISTEN and NOTIFY
- `COPY [table] TO [file]` syntax.
- Variadic parameters in procedures:

``` sql
CREATE PROCEDURE examle(VARIADIC a INT[]) LANGUAGE SQL AS 'SELECT 1';
```

- Variadic parameters in functions:

``` sql
CREATE OR REPLACE FUNCTION example(VARIADIC a INT[]) RETURNS INT AS 'SELECT 1' LANGUAGE SQL;
```

- Table inheritance:

``` sql
CREATE TABLE cities (
  name            TEXT,
  population      FLOAT,
  altitude        INT
);

CREATE TABLE capitals (
	state           CHAR(2)
) INHERITS (cities);
```

- Range types:

``` sql
CREATE TABLE ranges (
  ts TSRANGE,
  n NUMRANGE
);

INSERT INTO ranges (ts, n) VALUES
  ('[2024-01-01 00:00, 2024-01-31 23:59)', numrange(1, 20));
```

- Multiranges:

``` sql
SELECT nummultirange(numrange(1, 10), numrange(2, 20));
-- {[1,20)}
```

* Underscores for thousand separators

``` sql
CREATE TABLE thousands (
  n INT
);

INSERT INTO thousands (n) VALUES
  (1_000),
  (1_000_000),
  (1_000_000_000);
```