---
title: CREATE TYPE
summary: The CREATE TYPE statement creates a new, enumerated data type in a database.
toc: true
---

<span class="version-tag">New in v20.2:</span> The `CREATE TYPE` [statement](sql-statements.html) creates a new, [enumerated data type](enum.html) in a database.

## Synopsis

<div>
  {% include {{ page.version.version }}/sql/diagrams/create_type.html %}
</div>

## Parameters

Parameter | Description
----------|------------
`type_name` | The name of the type.
`opt_enum_val_list` | A list of values that make up the type's enumerated set.

## Example

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts(balance,status) VALUES (500.50,'open'),(0.00,'closed'),(1.25,'inactive');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts;
~~~

~~~
                   id                  | balance |  status
---------------------------------------+---------+-----------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
  60928059-ef75-47b1-81e3-25ec1fb6ff10 |    0.00 | closed
  71ae151d-99c3-4505-8e33-9cda15fce302 |    1.25 | inactive
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW CREATE TABLE accounts;
~~~

~~~
  table_name |                create_statement
-------------+--------------------------------------------------
  accounts   | CREATE TABLE public.accounts (
             |     id UUID NOT NULL DEFAULT gen_random_uuid(),
             |     balance DECIMAL NULL,
             |     status public.status NULL,
             |     CONSTRAINT "primary" PRIMARY KEY (id ASC),
             |     FAMILY "primary" (id, balance, status)
             | )
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE status='open';
~~~

~~~
                   id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
~~~

## See also

- [`ENUM`](enum.html)
- [Data types](data-types.html)
- [`SHOW ENUMS`](show-enums.html)
- [`DROP TYPE`](drop-type.html)
