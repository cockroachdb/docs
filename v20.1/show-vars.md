---
title: SHOW (session settings)
summary: The SHOW statement displays the current settings for the client session.
toc: true
---

The `SHOW` [statement](sql-statements.html) can display the value of either one or all of
the session setting variables. Some of these can also be configured via [`SET`](set-vars.html).

## Required privileges

No [privileges](authorization.html#assign-privileges) are required to display the session settings.

## Synopsis

<div>
{% include {{ page.version.version }}/sql/diagrams/show_var.html %}
</div>

{{site.data.alerts.callout_info}}The <code>SHOW</code> statement for session settings is unrelated to the other <code>SHOW</code> statements: <a href="cluster-settings.html#view-current-cluster-settings"><code>SHOW CLUSTER SETTING</code></a>, <a href="show-create.html"><code>SHOW CREATE</code></a>, <a href="show-users.html"><code>SHOW USERS</code></a>, <a href="show-databases.html"><code>SHOW DATABASES</code></a>, <a href="show-columns.html"><code>SHOW COLUMNS</code></a>, <a href="show-grants.html"><code>SHOW GRANTS</code></a>, and <a href="show-constraints.html"><code>SHOW CONSTRAINTS</code></a>.{{site.data.alerts.end}}

## Parameters

The `SHOW <session variable>` statement accepts a single parameter: the variable name.

The variable name is case insensitive. It may be enclosed in double quotes; this is useful if the variable name itself contains spaces.

### Supported variables

{% include {{ page.version.version }}/misc/session-vars.html %}

For session variables on experimental features, see [Experimental Features](experimental-features.html).

Special syntax cases supported for compatibility:

 Syntax | Equivalent to
--------|---------------
 `SHOW TRANSACTION PRIORITY` | `SHOW "transaction priority"`
 `SHOW TRANSACTION ISOLATION LEVEL` | `SHOW "transaction isolation level"`
 `SHOW TIME ZONE` | `SHOW "timezone"`
 `SHOW TRANSACTION STATUS` | `SHOW "transaction status"`

## Examples

### Showing the value of a single session variable

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW DATABASE;
~~~

~~~
  database
+----------+
  movr
(1 row)
~~~

### Showing the value of all session variables

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL;
~~~

~~~
                  variable                 |                                                      value
-------------------------------------------+------------------------------------------------------------------------------------------------------------------
  application_name                         | $ cockroach demo
  bytea_output                             | hex
  client_encoding                          | UTF8
  client_min_messages                      | notice
  crdb_version                             | CockroachDB OSS v20.1.0
  database                                 | movr
  datestyle                                | ISO, MDY
  default_int_size                         | 8
  default_tablespace                       |
  default_transaction_isolation            | serializable
  default_transaction_read_only            | off
  distsql                                  | auto
  enable_implicit_select_for_update        | on
  enable_insert_fast_path                  | on
  enable_zigzag_join                       | on
  experimental_enable_hash_sharded_indexes | off
  experimental_enable_temp_tables          | off
  experimental_serial_normalization        | rowid
  extra_float_digits                       | 2
  force_savepoint_restart                  | off
  idle_in_transaction_session_timeout      | 0
  integer_datetimes                        | on
  intervalstyle                            | postgres
  locality                                 | region=us-east1,az=b
  lock_timeout                             | 0
  max_identifier_length                    | 128
  max_index_keys                           | 32
  node_id                                  | 1
  optimizer                                | on
  optimizer_foreign_keys                   | on
  reorder_joins_limit                      | 4
  require_explicit_primary_keys            | off
  results_buffer_size                      | 16384
  row_security                             | off
  search_path                              | public
  server_encoding                          | UTF8
  server_version                           | 9.5.0
  server_version_num                       | 90500
  session_id                               | 16016feed4d6ae800000000000000001
  session_user                             | root
  sql_safe_updates                         | on
  standard_conforming_strings              | on
  statement_timeout                        | 0
  synchronize_seqscans                     | on
  timezone                                 | UTC
  tracing                                  | off
  transaction_isolation                    | serializable
  transaction_priority                     | normal
  transaction_read_only                    | off
  transaction_status                       | NoTxn
  vectorize                                | auto
  vectorize_row_count_threshold            | 1000
(52 rows)
~~~

## See also

- [`SET` (session variable)](set-vars.html)
- [Transactions](transactions.html), including [Priority levels](transactions.html#transaction-priorities)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [`SHOW COLUMNS`](show-columns.html)
- [`SHOW CONSTRAINTS`](show-constraints.html)
- [`SHOW CREATE`](show-create.html)
- [`SHOW DATABASES`](show-databases.html)
- [`SHOW GRANTS`](show-grants.html)
- [`SHOW INDEX`](show-index.html)
- [`SHOW USERS`](show-users.html)
