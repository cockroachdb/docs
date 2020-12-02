There are several ways to log SQL queries. The type of logging to use depends on your requirements and on the purpose of the logs.

- For system troubleshooting and performance optimization, turn on [cluster-wide execution logs](#cluster-wide-execution-logs).
- For local testing, turn on [per-node execution logs](#per-node-execution-logs).
- For per-table audit logs for security purposes, turn on [SQL audit logs](#sql-audit-logs).

### Cluster-wide execution logs

For production clusters, the best way to log all queries is to turn on the [cluster-wide setting](cluster-settings.html) `sql.trace.log_statement_execute`:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = true;
~~~

With this setting on, each node of the cluster writes all SQL queries it executes to a secondary `cockroach-sql-exec` log file. Use the symlink `cockroach-sql-exec.log` to open the most recent log. When you no longer need to log queries, you can turn the setting back off:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = false;
~~~

Log files are written to CockroachDB's standard [log directory](debug-and-error-logs.html#write-to-file).

### Slow query logs

The `sql.log.slow_query.latency_threshold` [cluster setting](cluster-settings.html) is used to log queries whose service latency exceeds a specified threshold value. The threshold value must be specified with a unit of time (e.g., `500ms` for 500 milliseconds, `5us` for 5 nanoseconds, or `5s` for 5 seconds). A threshold of `0s` disables the slow query log.

For example, to enable the slow query log for all queries with a latency above 100 milliseconds:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.log.slow_query.latency_threshold = '100ms';
~~~

After the threshold is set, each gateway node records slow SQL queries to a `cockroach-sql-slow` log file. Log files are written to CockroachDB's standard [log directory](debug-and-error-logs.html#write-to-file).

{{site.data.alerts.callout_info}}
Setting `sql.log.slow_query.latency_threshold` to a non-zero time enables tracing on all queries, which impacts performance. After debugging, set the value back to `0s` to disable the log.
{{site.data.alerts.end}}

 To log all queries that perform full table or index scans to the slow query log, regardless of query latency, set the `sql.log.slow_query.experimental_full_table_scans.enabled` [cluster setting](cluster-settings.html) to `true`. The end of each line in the slow query log indicates if the query was logged for surpassing the threshold (`LATENCY_THRESHOLD`), or if it was logged because of a full scan (`FULL_TABLE_SCAN` or `FULL_SECONDARY_INDEX_SCAN`).

 By default, slow internal queries are not logged. To log slow internal queries, set the `sql.log.slow_query.internal_queries.enabled` cluster setting to `true`. When `sql.log.slow_query.internal_queries.enabled=true`, and `sql.log.slow_query.latency_threshold` does not equal `0s`, all internal queries that have a service latency above `sql.log.slow_query.latency_threshold` will be logged to `cockroach-slow-log-internal-only.log`.

For an example of logging slow queries, see [Using the slow query log](query-behavior-troubleshooting.html#using-the-slow-query-log).

### Authentication logs

{% include {{ page.version.version }}/misc/experimental-warning.md %}

SQL client connections can be logged by turning on the `server.auth_log.sql_connections.enabled` [cluster setting](cluster-settings.html):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING server.auth_log.sql_connections.enabled = true;
~~~

This will log connection established and connection terminated events to a `cockroach-auth` log file. Use the symlink `cockroach-auth.log` to open the most recent log.

{{site.data.alerts.callout_info}}
In addition to SQL sessions, connection events can include SQL-based liveness probe attempts, as well as attempts to use the [PostgreSQL cancel protocol](https://www.postgresql.org/docs/current/protocol-flow.html#id-1.10.5.7.9).
{{site.data.alerts.end}}

This example log shows both types of connection events over a `hostssl` (TLS certificate over TCP) connection:

~~~
I200219 05:08:43.083907 5235 sql/pgwire/server.go:445  [n1,client=[::1]:34588] 22 received connection
I200219 05:08:44.171384 5235 sql/pgwire/server.go:453  [n1,client=[::1]:34588,hostssl] 26 disconnected; duration: 1.087489893s
~~~

Along with the above, SQL client authenticated sessions can be logged by turning on the `server.auth_log.sql_sessions.enabled` [cluster setting](cluster-settings.html):

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

This logs authentication method selection, authentication method application, authentication method result, and session termination events to the `cockroach-auth` log file. Use the symlink `cockroach-auth.log` to open the most recent log.

This example log shows authentication success over a `hostssl` (TLS certificate over TCP) connection:

~~~
I200219 05:08:43.089501 5149 sql/pgwire/auth.go:327  [n1,client=[::1]:34588,hostssl,user=root] 23 connection matches HBA rule:
# TYPE DATABASE USER ADDRESS METHOD        OPTIONS
host   all      root all     cert-password
I200219 05:08:43.091045 5149 sql/pgwire/auth.go:327  [n1,client=[::1]:34588,hostssl,user=root] 24 authentication succeeded
I200219 05:08:44.169684 5235 sql/pgwire/conn.go:216  [n1,client=[::1]:34588,hostssl,user=root] 25 session terminated; duration: 1.080240961s
~~~

This example log shows authentication failure log over a `local` (password over Unix socket) connection:

~~~
I200219 05:02:18.148961 1037 sql/pgwire/auth.go:327  [n1,client,local,user=root] 17 connection matches HBA rule:
# TYPE DATABASE USER ADDRESS METHOD   OPTIONS
local  all      all          password
I200219 05:02:18.151644 1037 sql/pgwire/auth.go:327  [n1,client,local,user=root] 18 user has no password defined
I200219 05:02:18.152863 1037 sql/pgwire/auth.go:327  [n1,client,local,user=root] 19 authentication failed: password authentication failed for user root
I200219 05:02:18.154168 1036 sql/pgwire/conn.go:216  [n1,client,local,user=root] 20 session terminated; duration: 5.261538ms
~~~

For complete logging of client connections, we recommend enabling both `server.auth_log.sql_connections.enabled` and `server.auth_log.sql_sessions.enabled`.

{{site.data.alerts.callout_info}}
Be aware that both logs perform one disk I/O per event and will impact performance when enabled.
{{site.data.alerts.end}}

For more details on authentication and certificates, see [Authentication](authentication.html).

Log files are written to CockroachDB's standard [log directory](debug-and-error-logs.html#write-to-file).

### Per-node execution logs

Alternatively, if you are testing CockroachDB locally and want to log queries executed just by a specific node, you can either pass a CLI flag at node startup, or execute a SQL function on a running node.

Using the CLI to start a new node, pass the `--vmodule` flag to the [`cockroach start`](cockroach-start.html) command. For example, to start a single node locally and log all client-generated SQL queries it executes, you'd run:

~~~ shell
$ cockroach start --insecure --listen-addr=localhost --vmodule=exec_log=2 --join=<join addresses>
~~~

{{site.data.alerts.callout_success}}
To log CockroachDB-generated SQL queries as well, use `--vmodule=exec_log=3`.
{{site.data.alerts.end}}

From the SQL prompt on a running node, execute the `crdb_internal.set_vmodule()` [function](functions-and-operators.html):

{% include copy-clipboard.html %}
~~~ sql
> SELECT crdb_internal.set_vmodule('exec_log=2');
~~~

This will result in the following output:

~~~
  crdb_internal.set_vmodule
+---------------------------+
                          0
(1 row)
~~~

Once the logging is enabled, all client-generated SQL queries executed by the node will be written to the primary [CockroachDB log file](debug-and-error-logs.html) as follows:

~~~
I180402 19:12:28.112957 394661 sql/exec_log.go:173  [n1,client=127.0.0.1:50155,user=root] exec "psql" {} "SELECT version()" {} 0.795 1 ""
~~~

### SQL audit logs

{% include {{ page.version.version }}/misc/experimental-warning.md %}

SQL audit logging is useful if you want to log all queries that are run against specific tables, by specific users.

- For a tutorial, see [SQL Audit Logging](sql-audit-logging.html).

- For reference documentation, see [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](experimental-audit.html).

Note that enabling SQL audit logs can negatively impact performance. As a result, we recommend using SQL audit logs for security purposes only.