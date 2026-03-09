---
title: ENUM
summary: CockroachDB's ENUM data types comprise a set of values.
toc: true
docs_area: reference.sql
---

A [user-defined `ENUM` data type]({% link {{ page.version.version }}/create-type.md %}#create-an-enumerated-data-type) consists of a set of enumerated, static values.

## Syntax

To declare a new enumerated data type, use [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %}#create-an-enumerated-data-type):

~~~ sql
> CREATE TYPE <name> AS ENUM ('<value1>', '<value2>', ...);
~~~

where `<name>` is the name of the new type, and `<value1>, <value2>, ...` are string literals that make up the type's set of static values.

{{site.data.alerts.callout_info}}
You can qualify the `<name>` of an enumerated type with a [database and schema name]({% link {{ page.version.version }}/sql-name-resolution.md %}) (e.g., `db.typename`). After the type is created, it can only be referenced from the database that contains the type.
{{site.data.alerts.end}}

To show all `ENUM` types in the database, including all `ENUMS` created implicitly for [multi-region databases]({% link {{ page.version.version }}/multiregion-overview.md %}), use [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

To modify an `ENUM` type, use [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TYPE <name> ADD VALUE '<value>';
~~~

where `<value>` is a string literal to add to the existing list of type values. You can also use `ALTER TYPE` to rename types, rename type values, set a type's schema, or change the type owner's [role specification]({% link {{ page.version.version }}/grant.md %}).

To drop the type, use [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
> DROP TYPE <name>;
~~~

## Required privileges

- To [create a type]({% link {{ page.version.version }}/create-type.md %}) in a database, a user must have the `CREATE` [privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#managing-privileges) on the database.
- To [drop a type]({% link {{ page.version.version }}/drop-type.md %}), a user must be the owner of the type.
- To [alter a type]({% link {{ page.version.version }}/alter-type.md %}), a user must be the owner of the type.
- To [grant privileges]({% link {{ page.version.version }}/grant.md %}) on a type, a user must have the `GRANT` privilege and the privilege that they want to grant.
- To create an object that depends on a type, a user must have the `USAGE` privilege on the type.

## Example

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE status AS ENUM ('open', 'closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

~~~
  schema |  name  |        value
---------+--------+-----------------------
  public | status | open|closed|inactive
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance DECIMAL,
        status status
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO accounts(balance,status) VALUES (500.50,'open'), (0.00,'closed'), (1.25,'inactive');
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
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
             |     CONSTRAINT accounts_pkey PRIMARY KEY (id ASC)
             | )
(1 row)
~~~


## Supported casting and conversion

`ENUM` data type values can be [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) to [`STRING`s]({% link {{ page.version.version }}/string.md %}).

Values can be cast explicitly or implicitly. For example, the following [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statements are equivalent:

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE status::STRING='open';
~~~

~~~
                   id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE status='open';
~~~

~~~
                   id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
(1 row)
~~~

### Comparing enumerated types

To compare two enumerated types, you must explicitly cast both types as `STRING`s. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TYPE inaccessible AS ENUM ('closed', 'inactive');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status inaccessible,
        message STRING
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO notifications(status, message) VALUES ('closed', 'This account has been closed.'),('inactive', 'This account is on hold.');
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status = notifications.status;
~~~

~~~
ERROR: unsupported comparison operator: <status> = <inaccessible>
SQLSTATE: 22023
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status::STRING = notifications.status;
~~~

~~~
ERROR: unsupported comparison operator: <string> = <inaccessible>
SQLSTATE: 22023
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
> SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status::STRING = notifications.status::STRING;
~~~

~~~
                   id                  |            message
---------------------------------------+--------------------------------
  285336c4-ca1f-490d-b0df-146aae94f5aa | This account is on hold.
  583157d5-4f34-43e5-a4d4-51db77feb391 | This account has been closed.
(2 rows)
~~~

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [`CREATE TYPE`]({% link {{ page.version.version }}/create-type.md %})
- [`ALTER TYPE`]({% link {{ page.version.version }}/alter-type.md %})
- [`SHOW ENUMS`]({% link {{ page.version.version }}/show-enums.md %})
- [`DROP TYPE`]({% link {{ page.version.version }}/drop-type.md %})
