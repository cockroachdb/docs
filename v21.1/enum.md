---
title: ENUM
summary: ENUM data types comprise a set of values.
toc: true
---

 User-defined `ENUM` [data types](data-types.html) consist of a set of enumerated, static values.

{{site.data.alerts.callout_danger}}
Clusters with `ENUM` types that are running [alpha testing releases](../releases/#testing-releases) of v20.2 will not be able to upgrade to beta testing releases or [production releases](../releases/#production-releases) of v20.2 due to internal representation changes.
{{site.data.alerts.end}}

## Syntax

To declare a new `ENUM` data type, use [`CREATE TYPE`](create-type.html):

~~~ sql
> CREATE TYPE <name> AS ENUM ('<value1>', '<value2>', ...);
~~~

where `<name>` is the name of the new type, and `<value1>, <value2>, ...` are string literals that make up the type's set of static values.

{{site.data.alerts.callout_info}}
You can qualify the `<name>` of an enumerated type with a [database and schema name](sql-name-resolution.html) (e.g., `db.typename`). After the type is created, it can only be referenced from the database that contains the type.
{{site.data.alerts.end}}

To show all `ENUM` types in the database, use [`SHOW ENUMS`](show-enums.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

To modify an `ENUM` type, use [`ALTER TYPE`](alter-type.html):

{% include copy-clipboard.html %}
~~~ sql
> ALTER TYPE <name> ADD VALUE '<value>';
~~~

where `<value>` is a string literal to add to the existing list of type values. You can also use `ALTER TYPE` to rename types, rename type values, set a type's schema, or change the type owner's [role specification](grant-roles.html).

To drop the type, use [`DROP TYPE`](drop-type.html):

{% include copy-clipboard.html %}
~~~ sql
> DROP TYPE <name>;
~~~

## Required privileges

- To [create a type](create-type.html) in a database, a user must have the `CREATE` [privilege](authorization.html#assign-privileges) on the database.
- To [drop a type](drop-type.html), a user must be the owner of the type.
- To [alter a type](alter-type.html), a user must be the owner of the type.
- To [grant privileges](grant.html) on a type, a user must have the `GRANT` privilege and the privilege that they want to grant.
- To create an object that depends on a type, a user must have the `USAGE` privilege on the type.

## Known limitations

[Partitions](partitioning.html) cannot be created on columns of type `ENUM`. See [tracking issue](https://github.com/cockroachdb/cockroach/issues/55342).

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
> INSERT INTO accounts(balance,status) VALUES (500.50,'open'), (0.00,'closed'), (1.25,'inactive');
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


## Supported casting and conversion

`ENUM` data type values can be [cast](data-types.html#data-type-conversions-and-casts) to [`STRING`s](string.html).

Values can be cast explicitly or implicitly. For example, the following [`SELECT`](select.html) statements are equivalent:

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM accounts WHERE status::STRING='open';
~~~

~~~
                   id                  | balance | status
---------------------------------------+---------+---------
  3848e36d-ebd4-44c6-8925-8bf24bba957e |  500.50 | open
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

### Comparing enumerated types

To compare two enumerated types, you must explicitly cast both types as `STRING`s. For example:

{% include copy-clipboard.html %}
~~~ sql
> CREATE TYPE inaccessible AS ENUM ('closed', 'inactive');
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status inaccessible,
        message STRING
);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO notifications(status, message) VALUES ('closed', 'This account has been closed.'),('inactive', 'This account is on hold.');
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status = notifications.status;
~~~

~~~
ERROR: unsupported comparison operator: <status> = <inaccessible>
SQLSTATE: 22023
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT
    accounts.id, notifications.message
    FROM accounts JOIN notifications ON accounts.status::STRING = notifications.status;
~~~

~~~
ERROR: unsupported comparison operator: <string> = <inaccessible>
SQLSTATE: 22023
~~~

{% include copy-clipboard.html %}
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

- [Data Types](data-types.html)
- [`CREATE TYPE`](create-type.html)
- [`ALTER TYPE`](alter-type.html)
- [`SHOW ENUMS`](show-enums.html)
- [`DROP TYPE`](drop-type.html)
