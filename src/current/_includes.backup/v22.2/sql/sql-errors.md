When CockroachDB encounters a SQL error, it returns the following information to the client (whether `cockroach-sql` or another [client application](developer-guide-overview.html)):

1. An error message, prefixed with [the "Severity" field of the PostgreSQL wire protocol](https://www.postgresql.org/docs/current/protocol-error-fields.html). For example, `ERROR: insert on table "shipments" violates foreign key constraint "fk_customers"`.
1. A [5-digit `SQLSTATE` error code](https://en.wikipedia.org/wiki/SQLSTATE) as defined by the SQL standard. For example, `SQLSTATE: 23503`.

For example, the following query (taken from [this example of adding multiple foreign key constraints](foreign-key.html#add-multiple-foreign-key-constraints-to-a-single-column)) results in a SQL error, and returns both an error message and a `SQLSTATE` code as described above.

{% include_cached copy-clipboard.html %}
~~~ sql
> INSERT INTO shipments (carrier, status, customer_id) VALUES ('DHL', 'At facility', 2000);
~~~

~~~
ERROR: insert on table "shipments" violates foreign key constraint "fk_customers"
SQLSTATE: 23503
DETAIL: Key (customer_id)=(2000) is not present in table "customers".
~~~

The [`SQLSTATE` code](https://en.wikipedia.org/wiki/SQLSTATE) in particular can be helpful in the following ways:

- It is a standard SQL error code that you can look up in documentation and search for on the web. For any given error state, CockroachDB tries to produce the same `SQLSTATE` code as PostgreSQL.
- If you are developing automation that uses the CockroachDB SQL shell, it is more reliable to check for `SQLSTATE` values than for error message strings, which are likely to change.