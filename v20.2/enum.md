---
title: ENUM
summary: ENUM data types comprise a set of values.
toc: true
---

<span class="version-tag">New in v20.2:</span> `ENUM` data types consist of a set of enumerated, static values.

## Syntax

To declare a new `ENUM` data type, use [`CREATE TYPE`](create-type.html):

~~~ sql
> CREATE TYPE <name> AS ENUM ('<value1>', '<value2>', ...);
~~~

where `<name>` is the name of the new type, and `<value1>, <value2>, ...` are string literals that make up the type's set of static values.

To show all `ENUM` types in the database, use [`SHOW ENUMS`](show-enums.html):

{% include copy-clipboard.html %}
~~~ sql
> SHOW ENUMS;
~~~

To drop the type, use [`DROP TYPE`](drop-type.html):

{% include copy-clipboard.html %}
~~~ sql
> DROP TYPE <name>;
~~~

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
   name  |        value
---------+-----------------------
  status | open|closed|inactive
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
> INSERT INTO accounts(balance,status) VALUES (500.50, 'open'),(0.00, 'closed'),(1.25, 'inactive');
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

`ENUM` data type values can be [cast](data-types.html#data-type-conversions-and-casts) to any of the following data types:

Type | Details
-----|--------
`ARRAY` | Requires supported [`ARRAY`](array.html) string format, e.g., `'{1,2,3}'`.<br>Limited to `ARRAY`s of type [`INT`](int.html) and [`DECIMAL`](decimal.html).
`BIT` | Requires supported [`BIT`](bit.html) string format, e.g., `'101001'`.
`BOOL` | Requires supported [`BOOL`](bool.html) string format, e.g., `'true'`.
`BYTES` | For more details, [see here](bytes.html#supported-conversions).
`DATE` | Requires supported [`DATE`](date.html) string format, e.g., `'2016-01-25'`.
`DECIMAL` | Requires supported [`DECIMAL`](decimal.html) string format, e.g., `'1.1'`.
`FLOAT` | Requires supported [`FLOAT`](float.html) string format, e.g., `'1.1'`.
`INET` | Requires supported [`INET`](inet.html) string format, e.g, `'192.168.0.1'`.
`INT` | Requires supported [`INT`](int.html) string format, e.g., `'10'`.
`INTERVAL` | Requires supported [`INTERVAL`](interval.html) string format, e.g., `'1h2m3s4ms5us6ns'`.
`TIME` | Requires supported [`TIME`](time.html) string format, e.g., `'01:22:12'` (microsecond precision).
`TIMESTAMP` | Requires supported [`TIMESTAMP`](timestamp.html) string format, e.g., `'2016-01-25 10:10:10.555555'`.

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

To compare two enumerated types, you must explicitly cast the types to two comparable types. For example:

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
- [`SHOW ENUMS`](show-enums.html)
- [`DROP TYPE`](drop-type.html)
