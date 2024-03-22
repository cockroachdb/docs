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
- LISTEN, UNLISTEN and NOTIFY
- `COPY [table] TO [file]` syntax.
- PL/python
- Deferrable constraints
- Exclusion constraints
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

- Underscores for thousand separators

``` sql
CREATE TABLE thousands (
  n INT
);

INSERT INTO thousands (n) VALUES
  (1_000),
  (1_000_000),
  (1_000_000_000);
```

- Table access methods

``` sql
CREATE ACCESS METHOD heap TYPE TABLE HANDLER heap_tableam_handler;

CREATE TABLE example(
  name text
) USING heap;
```

- Set `LOGGED/UNLOCKED`

``` sql
CREATE TABLE example (
  name TEXT
);

ALTER TABLE example SET LOGGED;
ALTER TABLE example SET UNLOGGED;
```

- ALTER object IF EXISTS

``` sql
ALTER TABLE IF EXISTS does_not_exist
ADD COLUMN v TEXT NOT NULL;

ALTER TABLE IF EXISTS does_not_exist
ADD COLUMN IF NOT EXISTS v TEXT NOT NULL;
```

- WITHIN GROUP

``` sql
CREATE TABLE example AS
	SELECT generate_series(1,20) AS val;

-- Supported
WITH subset AS (
	SELECT val,
		ntile(4) OVER (ORDER BY val) AS tile
	FROM example
)
SELECT max(val)
FROM subset GROUP BY tile ORDER BY tile;

-- Unsupported
SELECT unnest(percentile_disc(array[0.25,0.5,0.75,1])
  WITHIN GROUP (ORDER BY val))
FROM example;
```