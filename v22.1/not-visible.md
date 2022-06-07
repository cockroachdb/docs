---
title: NOT VISIBLE
summary: The NOT VISIBLE property specifies the column will not be returned when using SELECT * to retrieve all columns.
toc: true
---

The `NOT VISIBLE` property specifies a column won't be returned when using `*` in a [`SELECT` clause](select-clause.html). With this property, you can control the display of keys in [geo-partitioned tables](partitioning.html) that could be exposed to client ORMs and other automated tools that inspect the SQL schema.

## Details

- If running `SELECT * FROM <table>;` against a table containing columns set to `NOT VISIBLE`, then those columns will not be displayed in the final result set.

  For example, the `users` table of the [`movr` database](movr.html) contains the `credit_card` column. We may not want users to see that column when running `SELECT * FROM users;`, so let's hide it:

  ~~~ sql
  > ALTER TABLE users ALTER COLUMN credit_card SET NOT VISIBLE;
  ~~~

  Let's try running a `SELECT *`:

  ~~~ sql
  > SELECT * FROM users WHERE city = 'rome';
  ~~~

  ~~~
  id                                     | city |       name        |            address
  ---------------------------------------+------+-------------------+--------------------------------
  e6666666-6666-4800-8000-00000000002d   | rome | Misty Adams       | 82289 Natasha River Suite 12
  eb851eb8-51eb-4800-8000-00000000002e   | rome | Susan Morse       | 49364 Melissa Squares Suite 4
  f0a3d70a-3d70-4000-8000-00000000002f   | rome | Victoria Jennings | 31562 Krista Squares Suite 62
  f5c28f5c-28f5-4000-8000-000000000030   | rome | Eric Perez        | 57624 Kelly Forks
  fae147ae-147a-4000-8000-000000000031   | rome | Richard Bullock   | 21194 Alexander Estate
  (5 rows)
  ~~~

- The column is still selectable if named directly in the `target_elem` parameter:

  ~~~ sql
  > SELECT id, credit_card FROM users WHERE city = 'rome';
  ~~~

  ~~~
  id                                     | credit_card
  ---------------------------------------+--------------
  e6666666-6666-4800-8000-00000000002d   | 4418943046
  eb851eb8-51eb-4800-8000-00000000002e   | 0655485426
  f0a3d70a-3d70-4000-8000-00000000002f   | 2232698265
  f5c28f5c-28f5-4000-8000-000000000030   | 2620636730
  fae147ae-147a-4000-8000-000000000031   | 2642076323
  (5 rows)
  ~~~

- The column is also shown with a `NOT VISIBLE` flag after running [`SHOW CREATE TABLE`](show-create.html#show-the-create-table-statement-for-a-table-with-a-hidden-column) on that table.

## Syntax

You can only apply the `NOT VISIBLE` property to individual columns.

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/release-22.1/grammar_svg/not_visible_column_level.html %}
</div>

 Parameter | Description
-----------|-------------
 `table_name` | The name of the table you're creating.
 `column_name` | The name of the constrained column.
 `column_type` | The constrained column's [data type](data-types.html).
 `column_constraints` | Any other column-level [constraints](constraints.html) you want to apply to this column.
 `column_def` | Definitions for any other columns in the table.
 `table_constraints` | Any table-level [constraints](constraints.html) you want to apply.

## See also

- [Constraints](constraints.html)
- [`DROP CONSTRAINT`](drop-constraint.html)
- [`CHECK` constraint](check.html)
- [`DEFAULT` constraint](default-value.html)
- [`REFERENCES` constraint (Foreign Key)](foreign-key.html)
- [`PRIMARY KEY` constraint](primary-key.html)
- [`UNIQUE` constraint](unique.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`NULL HANDLING`](null-handling.html)
