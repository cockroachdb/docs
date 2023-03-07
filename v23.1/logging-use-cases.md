---
title: Logging use cases
summary: Examples of common logging use cases and possible CockroachDB logging sink configurations.
toc: true
docs_area: manage
---

This page describes some common logging use cases, their relevant [logging channels](logging-overview.html#logging-channels), and examples of notable events to be found in the logs:

- [Operational monitoring](#operational-monitoring) (for operators)
- [Security and audit monitoring](#security-and-audit-monitoring) (for security engineers)
- [Performance tuning](#performance-tuning) (for application developers)
- [Network logging](#network-logging) (for operators)

We provide an example [file sink configuration](configure-logs.html#output-to-files) for each use case. These configurations are entirely optional and are intended to highlight the contents of each logging channel. A sink can include any combination of logging channels. Moreover, a single logging channel can be used in more than one sink in your logging configuration.

Your deployment may use an external service (e.g., [Elasticsearch](https://www.elastic.co/elastic-stack), [Splunk](https://www.splunk.com/)) to collect and programmatically read logging data.

{{site.data.alerts.callout_info}}
All log examples on this page use the default `crdb-v2` format, except for the [network logging](#network-logging) configuration, which uses the default `json-fluent-compact` format for network output. Most log entries for non-`DEV` channels record *structured* events, which use a standardized format that can be reliably parsed by an external collector. All structured event types and their fields are detailed in the [Notable events reference](eventlog.html).

Logging channels may also contain events that are *unstructured*. Unstructured events can routinely change between CockroachDB versions, including minor patch revisions, so they are not officially documented.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
`‹` and `›` are placed around values in log messages that may contain sensitive data (PII). To customize this behavior, see [Redact logs](configure-logs.html#redact-logs).
{{site.data.alerts.end}}

## Operational monitoring

A database operator can use the `OPS`, `HEALTH`, and `SQL_SCHEMA` channels to monitor [operational events](#ops) initiated by users or automatic processes, [DDL changes](#sql_schema) from applications, and overall [cluster health](#health).

In this example configuration, the channels are grouped into a file sink called `ops`. The combined logging output will be found in a `cockroach-ops.log` file at the configured [logging directory](configure-logs.html#logging-directory).

~~~ yaml
sinks:
  file-groups:
    ops:
      channels: [OPS, HEALTH, SQL_SCHEMA]
~~~

{{site.data.alerts.callout_success}}
When monitoring your cluster, consider using these logs in conjunction with [Prometheus](monitor-cockroachdb-with-prometheus.html), which can be set up to track node-level metrics.
{{site.data.alerts.end}}

### OPS

The [`OPS`](logging.html#ops) channel logs operational events initiated by users or automation. These can include node additions and removals, process starts and shutdowns, [gossip](https://en.wikipedia.org/wiki/Gossip_protocol) connection events, and [zone configuration changes](configure-replication-zones.html) on the SQL schema or system ranges.

#### Example: Node decommissioning

This [`node_decommissioning`](eventlog.html#node_decommissioning) event shows that a node is in the [decommissioning](node-shutdown.html?filters=decommission#decommissioning) state:

~~~
I210401 23:30:49.319360 5943 1@util/log/event_log.go:32 ⋮ [-] 42 ={"Timestamp":1617319848793433000,"EventType":"node_decommissioning","RequestingNodeID":1,"TargetNodeID":4}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `TargetNodeID` shows that the decommissioning node is `4`.
- `RequestingNodeID` shows that decommissioning was requested by node `1`. You will see this when specifying the node ID explicitly in addition to the `--host` flag.

#### Example: Node restart

This [`node_restart`](eventlog.html#node_restart) event shows that a node has rejoined the cluster after being offline (e.g., by being [restarted](cockroach-start.html) after being fully decommissioned):

~~~
I210323 20:53:44.765068 611 1@util/log/event_log.go:32 ⋮ [n1] 20 ={"Timestamp":1616532824096394000,"EventType":"node_restart","NodeID":1,"StartedAt":1616532823668899000,"LastUp":1616532816150919000}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `NodeID` shows that the restarted node is `1`.
- `StartedAt` shows the timestamp when the node was most recently restarted.
- `LastUp` shows the timestamp when the node was up before being restarted.

{{site.data.alerts.callout_info}}
All possible `OPS` event types are detailed in the [reference documentation](eventlog.html).
{{site.data.alerts.end}}

### HEALTH

The [`HEALTH`](logging.html#health) channel logs operational events initiated by CockroachDB or reported by automatic processes. These can include resource usage details, connection errors, [gossip](https://en.wikipedia.org/wiki/Gossip_protocol) status, [replication](architecture/replication-layer.html) events, and runtime statistics.

#### Example: Runtime stats

A [`runtime_stats`](eventlog.html#runtime_stats) event is recorded every 10 seconds to reflect server health:

~~~
I210517 17:38:20.403619 586 2@util/log/event_log.go:32 ⋮ [n1] 168 ={"Timestamp":1621273100403617000,"EventType":"runtime_stats","MemRSSBytes":119361536,"GoroutineCount":262,"MemStackSysBytes":4063232,"GoAllocBytes":40047584,"GoTotalBytes":68232200,"GoStatsStaleness":0.008556,"HeapFragmentBytes":6114336,"HeapReservedBytes":6324224,"HeapReleasedBytes":10559488,"CGoAllocBytes":8006304,"CGoTotalBytes":11997184,"CGoCallRate":0.6999931,"CPUUserPercent":5.4999456,"CPUSysPercent":6.2399383,"GCRunCount":12,"NetHostRecvBytes":16315,"NetHostSendBytes":21347}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.

{{site.data.alerts.callout_info}}
`runtime_stats` events are typically used for troubleshooting. To monitor your cluster's health, see [Monitoring and Alerting](monitoring-and-alerting.html).
{{site.data.alerts.end}}

### SQL_SCHEMA

The [`SQL_SCHEMA`](logging.html#sql_schema) channel logs changes to the SQL logical schema resulting from DDL operations.

#### Example: Schema change initiated

This [`alter_table`](eventlog.html#alter_table) event shows an [`ALTER TABLE ... ADD FOREIGN KEY`](alter-table.html#add-constraint) schema change being initiated on a `movr.public.vehicles` table:

~~~
I210323 20:21:04.621132 113397 5@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:50812›,hostnossl,user=root] 14 ={"Timestamp":1616530864502127000,"EventType":"alter_table","Statement":"‹ALTER TABLE movr.public.vehicles ADD FOREIGN KEY (city, owner_id) REFERENCES movr.public.users (city, id)›","User":"‹root›","DescriptorID":59,"ApplicationName":"‹movr›","TableName":"‹movr.public.vehicles›","MutationID":1}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `ApplicationName` shows that the events originated from an application named `movr`. You can use this field to filter the logging output by application.
- `DescriptorID` identifies the object descriptor (e.g., `movr.public.vehicles`) undergoing the schema change.
- `MutationID` identifies the job that is processing the schema change.

#### Example: Schema change completed

This [`finish_schema_change`](eventlog.html#finish_schema_change) event shows that the above schema change has completed:

~~~
I210323 20:21:05.916626 114212 5@util/log/event_log.go:32 ⋮ [n1,job=643761650092900353,scExec,id=59,mutation=1] 15 ={"Timestamp":1616530865791439000,"EventType":"finish_schema_change","InstanceID":1,"DescriptorID":59,"MutationID":1}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `DescriptorID` identifies the object descriptor (e.g., `movr.public.vehicles`) affected by the schema change.
- `MutationID` identifies the job that processed the schema change.

Note that the `DescriptorID` and `MutationID` values match in both of the above log entries, indicating that they are related.

{{site.data.alerts.callout_info}}
All possible `SQL_SCHEMA` event types are detailed in the [reference documentation](eventlog.html#sql-logical-schema-changes).
{{site.data.alerts.end}}

## Security and audit monitoring

A security engineer can use the `SESSIONS`, `USER_ADMIN`, `PRIVILEGES`, and `SENSITIVE_ACCESS` channels to monitor [connection and authentication events](#sessions), changes to [user/role administration](#user_admin) and [privileges](#privileges), and any queries on [audited tables](#sensitive_access).

In this example configuration, the channels are grouped into a file sink called `security`. The combined logging output will be found in a `cockroach-security.log` file at the configured [logging directory](configure-logs.html#logging-directory).

In addition, the `security` channels are configured as `auditable`. This feature guarantees non-repudiability by enabling `exit-on-error` (stops nodes when they encounter a logging error) and disabling `buffered-writes` (flushes each log entry and synchronizes writes). This setting can incur a performance overhead and higher disk IOPS consumption, so it should only be used when necessary (e.g., for security purposes).

~~~ yaml
sinks:
  file-groups:
    security:
      channels: [SESSIONS, USER_ADMIN, PRIVILEGES, SENSITIVE_ACCESS]
      auditable: true
~~~

### SESSIONS

The [`SESSIONS`](logging.html#sessions) channel logs SQL session events. This includes client connection and session authentication events, for which logging must be enabled separately. For complete logging of client connections, we recommend enabling both types of events.

{{site.data.alerts.callout_info}}
These logs perform one disk I/O per event. Enabling each setting will impact performance.
{{site.data.alerts.end}}

{% include common/experimental-warning.md %}

#### Example: Client connection events

To log SQL client connection events to the `SESSIONS` channel, enable the `server.auth_log.sql_connections.enabled` [cluster setting](cluster-settings.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING server.auth_log.sql_connections.enabled = true;
~~~

{{site.data.alerts.callout_info}}
In addition to SQL sessions, connection events can include SQL-based liveness probe attempts.
{{site.data.alerts.end}}

These logs show a [`client_connection_start`](eventlog.html#client_connection_start) (client connection established) and a [`client_connection_end`](eventlog.html#client_connection_end) (client connection terminated) event over a `hostssl` (TLS transport over TCP) connection:

~~~
I210323 21:53:58.300180 53298 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›] 49 ={"Timestamp":1616536438300176000,"EventType":"client_connection_start","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›"}
I210323 21:53:58.305074 53298 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›,hostssl] 54 ={"Timestamp":1616536438305072000,"EventType":"client_connection_end","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›","Duration":4896000}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `Network` shows the network protocol of the connection.
- `RemoteAddress` shows the address of the SQL client, proxy, or other intermediate server.

#### Example: Session authentication events

To log SQL session authentication events to the `SESSIONS` channel, enable the `server.auth_log.sql_sessions.enabled` [cluster setting](cluster-settings.html) on every cluster:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING server.auth_log.sql_sessions.enabled = true;
~~~

These logs show certificate authentication success over a `hostssl` (TLS transport over TCP) connection:

~~~
I210323 23:35:19.458098 122619 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:53884›,hostssl,user=‹roach›] 62 ={"Timestamp":1616542519458095000,"EventType":"client_authentication_info","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:53884›","Transport":"hostssl","User":"‹roach›","Method":"cert-password","Info":"‹HBA rule: host  all all  all cert-password # built-in CockroachDB default›"}
I210323 23:35:19.458136 122619 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:53884›,hostssl,user=‹roach›] 63 ={"Timestamp":1616542519458135000,"EventType":"client_authentication_info","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:53884›","Transport":"hostssl","User":"‹roach›","Method":"cert-password","Info":"‹client presented certificate, proceeding with certificate validation›"}
I210323 23:35:19.458154 122619 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:53884›,hostssl,user=‹roach›] 64 ={"Timestamp":1616542519458154000,"EventType":"client_authentication_ok","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:53884›","Transport":"hostssl","User":"‹roach›","Method":"cert-password"}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- The two [`client_authentication_info`](eventlog.html#client_authentication_info) events show the progress of certificate authentication. The `Info` fields show the progress of certificate validation.
- The [`client_authentication_ok`](eventlog.html#client_authentication_ok) event shows that certificate authentication was successful.
- `User` shows that the SQL session is authenticated for user `roach`.

These logs show password authentication failure over a `hostssl` (TLS transport over TCP) connection:

~~~
I210323 21:53:58.304573 53299 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›,hostssl,user=‹roach›] 50 ={"Timestamp":1616536438304572000,"EventType":"client_authentication_info","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›","Transport":"hostssl","User":"‹roach›","Method":"cert-password","Info":"‹HBA rule: host  all all  all cert-password # built-in CockroachDB default›"}
I210323 21:53:58.304648 53299 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›,hostssl,user=‹roach›] 51 ={"Timestamp":1616536438304647000,"EventType":"client_authentication_info","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›","Transport":"hostssl","User":"‹roach›","Method":"cert-password","Info":"‹no client certificate, proceeding with password authentication›"}
I210323 21:53:58.304797 53299 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›,hostssl,user=‹roach›] 52 ={"Timestamp":1616536438304796000,"EventType":"client_authentication_failed","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›","Transport":"hostssl","User":"‹roach›","Reason":6,"Detail":"‹password authentication failed for user roach›","Method":"cert-password"}
I210323 21:53:58.305016 53298 4@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52632›,hostssl,user=‹roach›] 53 ={"Timestamp":1616536438305014000,"EventType":"client_session_end","InstanceID":1,"Network":"tcp","RemoteAddress":"‹[::1]:52632›","Duration":2273000}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- The two [`client_authentication_info`](eventlog.html#client_authentication_info) events show the progress of certificate authentication. The `Info` fields show that password authentication was attempted, in the absence of a client certificate.
- The [`client_authentication_failed`](eventlog.html#client_authentication_failed) event shows that password authentication was unsuccessful. The `Detail` field shows the related error.
- The [`client_session_end`](eventlog.html#client_session_end) event shows that the SQL session was terminated. This would typically be followed by a [`client_connection_end`](eventlog.html#client_connection_end) event.
- `User` shows that the SQL session authentication was attempted for user `roach`.

{{site.data.alerts.callout_info}}
All possible `SESSIONS` event types are detailed in the [reference documentation](eventlog.html#sql-session-events). For more details on certificate and password authentication, see [Authentication](authentication.html).
{{site.data.alerts.end}}

### SENSITIVE_ACCESS

The [`SENSITIVE_ACCESS`](logging.html#sensitive_access) channel logs SQL audit events. These include all queries being run against [audited tables](alter-table.html#experimental_audit), when enabled, as well as queries executed by users with the [`admin`](security-reference/authorization.html#admin-role) role.

{{site.data.alerts.callout_info}}
Enabling these logs can negatively impact performance. We recommend using `SENSITIVE_ACCESS` for security purposes only.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

To log all queries against a specific table, enable auditing on the table with [`ALTER TABLE ... EXPERIMENTAL_AUDIT`](alter-table.html#experimental_audit).

#### Example: Audit events

This command enables auditing on a `customers` table:

{% include_cached copy-clipboard.html %}
~~~ sql
> ALTER TABLE customers EXPERIMENTAL_AUDIT SET READ WRITE;
~~~

This [`sensitive_table_access`](eventlog.html#sensitive_table_access) event shows that the audited table `customers` was accessed by user `root` issuing an [`INSERT`](insert.html) statement:

~~~
I210323 18:50:04.518707 1182 8@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:49851›,hostnossl,user=root] 2 ={"Timestamp":1616525404415644000,"EventType":"sensitive_table_access","Statement":"‹INSERT INTO \"\".\"\".customers(name, address, national_id, telephone, email) VALUES ('Pritchard M. Cleveland', '23 Crooked Lane, Garden City, NY USA 11536', 778124477, 12125552000, 'pritchmeister@aol.com')›","User":"‹root›","DescriptorID":52,"ApplicationName":"‹$ cockroach sql›","ExecMode":"exec","NumRows":1,"Age":103.066,"TxnCounter":28,"TableName":"‹defaultdb.public.customers›","AccessMode":"rw"}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `AccessMode` shows that the table was accessed with a read/write (`rw`) operation.
- `ApplicationName` shows that the event originated from the [`cockroach sql`](cockroach-sql.html) shell. You can use this field to filter the logging output by application.

{{site.data.alerts.callout_info}}
All possible `SENSITIVE_ACCESS` event types are detailed in the [reference documentation](eventlog.html#sql-access-audit-events). For a detailed tutorial on table auditing, see [SQL Audit Logging](sql-audit-logging.html).
{{site.data.alerts.end}}

### PRIVILEGES

The [`PRIVILEGES`](logging.html#privileges) channel logs SQL privilege changes. These include DDL operations performed by SQL operations that [modify the privileges](security-reference/authorization.html#managing-privileges) granted to [roles and users](security-reference/authorization.html#users-and-roles) on databases, schemas, tables, and [user-defined types](enum.html).

#### Example: Database privileges

This [`change_database_privilege`](eventlog.html#change_database_privilege) event shows that user `root` granted all privileges to user `roach` on the database `movr`:

~~~
I210329 22:54:48.888312 1742207 7@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:52487›,hostssl,user=root] 1 ={"Timestamp":1617058488747117000,"EventType":"change_database_privilege","Statement":"‹GRANT ALL ON DATABASE movr TO roach›","User":"‹root›","DescriptorID":57,"ApplicationName":"‹$ cockroach sql›","Grantee":"‹roach›","GrantedPrivileges":["ALL"],"DatabaseName":"‹movr›"}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `ApplicationName` shows that the event originated from the [`cockroach sql`](cockroach-sql.html) shell. You can use this field to filter the logging output by application.
- `GrantedPrivileges` shows the privileges that were granted.

{{site.data.alerts.callout_info}}
All possible `PRIVILEGE` event types are detailed in the [reference documentation](eventlog.html#sql-privilege-changes).
{{site.data.alerts.end}}

### USER_ADMIN

The [`USER_ADMIN`](logging.html#user_admin) channel logs changes to users and roles. This includes user and role [creation and assignment](security-reference/authorization.html#create-and-manage-users) and changes to [privileges](security-reference/authorization.html#managing-privileges), [options](create-role.html#parameters), and [passwords](authentication.html#client-authentication).

#### Example: SQL user creation

This [`create_role`](eventlog.html#create_role) event shows that a user `roach` was created and assigned a password by user `root`. Note that the password in the SQL statement is pre-redacted even if `redact` is set to `false` for the logging sink. For more details on redaction behavior, see [Redact logs](configure-logs.html#redact-logs).

~~~
I210323 20:54:53.122681 1943 6@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:51676›,hostssl,user=root] 1 ={"Timestamp":1616532892887402000,"EventType":"create_role","Statement":"‹CREATE USER 'roach' WITH PASSWORD *****›","User":"‹root›","ApplicationName":"‹$ cockroach sql›","RoleName":"‹roach›"}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `ApplicationName` shows that the event originated from the [`cockroach sql`](cockroach-sql.html) shell. You can use this field to filter the logging output by application.
- `RoleName` shows the name of the user/role. For details on user and role terminology, see [Users and roles](security-reference/authorization.html#users-and-roles).

{{site.data.alerts.callout_info}}
All possible `USER_ADMIN` event types are detailed in the [reference documentation](eventlog.html#sql-user-and-role-operations).
{{site.data.alerts.end}}

## Performance tuning

An application developer can use the `SQL_EXEC` and `SQL_PERF` channels to [examine SQL queries](#sql_exec) and filter [slow queries](#sql_perf) in order to optimize or troubleshoot performance.

In this example configuration, the channels are grouped into a file sink called `performance`. The combined logging output will be found in a `cockroach-performance.log` file at the configured [logging directory](configure-logs.html#logging-directory).

~~~ yaml
sinks:
  file-groups:
    performance:
      channels: [SQL_EXEC, SQL_PERF]
~~~

### SQL_EXEC

The [`SQL_EXEC`](logging.html#sql_exec) channel reports all SQL executions on the cluster, when enabled.

To log cluster-wide executions, enable the `sql.trace.log_statement_execute` [cluster setting](cluster-settings.html):

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = true;
~~~

Each node of the cluster will write all SQL queries it executes to the `SQL_EXEC` channel. These are recorded as [`query_execute`](eventlog.html#query_execute) events.

#### Example: SQL query

This event details a `SELECT` statement that was issued by user `root`:

~~~
I210401 22:57:20.047235 5475 9@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:59116›,hostnossl,user=root] 900 ={"Timestamp":1617317840045704000,"EventType":"query_execute","Statement":"‹SELECT * FROM \"\".\"\".users WHERE name = 'Cheyenne Smith'›","User":"‹root›","ApplicationName":"‹$ cockroach sql›","ExecMode":"exec","NumRows":1,"Age":1.583,"FullTableScan":true,"TxnCounter":12}
~~~

Note the `FullTableScan` value in the logged event, which shows that this query performed a full table scan and likely caused a performance hit. To learn more about when this issue appears and how it can be resolved, see [Statement Tuning with `EXPLAIN`](sql-tuning-with-explain.html#issue-full-table-scans).

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `ApplicationName` shows that the event originated from the [`cockroach sql`](cockroach-sql.html) shell. You can use this field to filter the logging output by application.

#### Example: Internal SQL query

Internal queries are also logged to the `SQL_EXEC` channel. For example, this event details a statement issued on the internal `system.jobs` table:

~~~
I210330 16:09:04.966129 1885738 9@util/log/event_log.go:32 ⋮ [n1,intExec=‹find-scheduled-jobs›] 13 ={"Timestamp":1617120544952784000,"EventType":"query_execute","Statement":"‹SELECT (SELECT count(*) FROM \"\".system.jobs AS j WHERE ((j.created_by_type = 'crdb_schedule') AND (j.created_by_id = s.schedule_id)) AND (j.status NOT IN ('succeeded', 'canceled', 'failed'))) AS num_running, s.* FROM \"\".system.scheduled_jobs AS s WHERE next_run < current_timestamp() ORDER BY random() LIMIT 10 FOR UPDATE›","User":"‹root›","ApplicationName":"‹$ internal-find-scheduled-jobs›","ExecMode":"exec-internal","Age":2.934,"FullTableScan":true}
~~~

If you no longer need to log queries across the cluster, you can disable the setting:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.trace.log_statement_execute = false;
~~~

{{site.data.alerts.callout_info}}
All possible `SQL_EXEC` event types are detailed in the [reference documentation](eventlog.html#sql-execution-log).
{{site.data.alerts.end}}

### SQL_PERF

The [`SQL_PERF`](logging.html#sql_perf) channel reports slow SQL queries, when enabled. This includes queries whose latency exceeds a configured threshold, as well as queries that perform a full table or index scan.

To enable slow query logging, enable the `sql.log.slow_query.latency_threshold` [cluster setting](cluster-settings.html) by setting it to a non-zero value. This will log queries whose service latency exceeds a specified threshold value. The threshold value must be specified with a unit of time (e.g., `500ms` for 500 milliseconds, `5us` for 5 nanoseconds, or `5s` for 5 seconds). A threshold of `0s` disables the slow query log.

{{site.data.alerts.callout_info}}
Setting `sql.log.slow_query.latency_threshold` to a non-zero time enables tracing on all queries, which impacts performance. After debugging, set the value back to `0s` to disable the log.
{{site.data.alerts.end}}

To log all queries that perform full table or index scans to `SQL_PERF`, regardless of query latency, set the `sql.log.slow_query.experimental_full_table_scans.enabled` [cluster setting](cluster-settings.html) to `true`.

#### Example: Slow SQL query

For example, to enable the slow query log for all queries with a latency above 100 milliseconds:

{% include_cached copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING sql.log.slow_query.latency_threshold = '100ms';
~~~

Each gateway node will now record queries that take longer than 100 milliseconds to the `SQL_PERF` channel as [`slow_query` events](eventlog.html#slow_query).

This `slow_query` event was logged with a service latency (`age`) of 100.205 milliseconds:

~~~
I210323 20:02:16.857133 59270 10@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:50595›,hostnossl,user=root] 573 ={"Timestamp":1616529736756959000,"EventType":"slow_query","Statement":"‹UPDATE \"\".\"\".bank SET balance = CASE id WHEN $1 THEN balance - $3 WHEN $2 THEN balance + $3 END WHERE id IN ($1, $2)›","User":"‹root›","ApplicationName":"‹bank›","PlaceholderValues":["‹158›","‹210›","‹257›"],"ExecMode":"exec","NumRows":2,"Age":100.205,"TxnCounter":97}
~~~

- `ApplicationName` shows that the events originated from an application named `bank`. You can use this field to filter the logging output by application.

The following query was logged with a service latency (`age`) of 9329.26 milliseconds, a very high latency that resulted from a [transaction retry error](transaction-retry-error-reference.html#retry_write_too_old):

~~~
I210323 20:02:12.095253 59168 10@util/log/event_log.go:32 ⋮ [n1,client=‹[::1]:50621›,hostnossl,user=root] 361 ={"Timestamp":1616529731816553000,"EventType":"slow_query","Statement":"‹UPDATE \"\".\"\".bank SET balance = CASE id WHEN $1 THEN balance - $3 WHEN $2 THEN balance + $3 END WHERE id IN ($1, $2)›","User":"‹root›","ApplicationName":"‹bank›","PlaceholderValues":["‹351›","‹412›","‹206›"],"ExecMode":"exec","SQLSTATE":"40001","ErrorText":"‹TransactionRetryWithProtoRefreshError: WriteTooOldError: write at timestamp 1616529731.152644000,2 too old; wrote at 1616529731.816553000,1: \"sql txn\" meta={id=6c8f776f pri=0.02076160 epo=1 ts=1616529731.816553000,1 min=1616529722.766004000,0 seq=0} lock=true stat=PENDING rts=1616529731.152644000,2 wto=false gul=1616529723.266004000,0›","Age":9329.26,"NumRetries":1,"TxnCounter":1}
~~~

- Preceding the `=` character is the `crdb-v2` event metadata. See the [reference documentation](log-formats.html#format-crdb-v2) for details on the fields.
- `ApplicationName` shows that the events originated from an application named `bank`. You can use this field to filter the logging output by application.
- `ErrorText` shows that this query encountered a type of [transaction retry error](transaction-retry-error-reference.html#retry_write_too_old). For details on transaction retry errors and how to resolve them, see the [Transaction retry error reference](transaction-retry-error-reference.html).
- `NumRetries` shows that the transaction was retried once before succeeding.

{{site.data.alerts.callout_info}}
All possible `SQL_PERF` event types are detailed in the [reference documentation](eventlog.html#sql-slow-query-log).
{{site.data.alerts.end}}

## Network logging

A database operator can send logs over the network to a [Fluentd](https://www.fluentd.org/) or HTTP server.

{{site.data.alerts.callout_danger}}
TLS is not supported yet: the connection to the log collector is neither authenticated nor encrypted. Given that logging events may contain sensitive information, care should be taken to keep the log collector and the CockroachDB node close together on a private network, or connect them using a secure VPN. TLS support may be added at a later date.
{{site.data.alerts.end}}

In this example configuration, [operational](#operational-monitoring) and [security](#security-and-audit-monitoring) logs are grouped into separate `ops` and `security` network sinks. The logs from both sinks are sent to a Fluentd server, which can then route them to a compatible log collector (e.g., [Elasticsearch](https://www.elastic.co/elastic-stack), [Splunk](https://www.splunk.com/)).

{{site.data.alerts.callout_info}}
A network sink can be listed more than once with different `address` values. This routes the same logs to different Fluentd servers.
{{site.data.alerts.end}}

~~~ yaml
sinks:
  fluent-servers:
    ops:
      channels: [OPS, HEALTH, SQL_SCHEMA]
      address: 127.0.0.1:5170
      net: tcp
      redact: true
    security:
      channels: [SESSIONS, USER_ADMIN, PRIVILEGES, SENSITIVE_ACCESS]
      address: 127.0.0.1:5170
      net: tcp
      auditable: true
~~~

In this case, defining separate `ops` and `security` network sinks allows us to:

 - [Enable redaction](configure-logs.html#redact-logs) on the `ops` logs.
 - Configure the `security` logs as [`auditable`](#security-and-audit-monitoring).

Otherwise, it is generally more flexible to [configure Fluentd to route logs](https://docs.fluentd.org/configuration/routing-examples) to different destinations.

By default, `fluent-servers` log messages use the [`json-fluent-compact`](log-formats.html#format-json-fluent-compact) format for ease of processing over a stream.

For example, this JSON message found in the `OPS` logging channel contains a [`node_restart`](eventlog.html#node_restart) event. The event shows that a node has rejoined the cluster after being offline (e.g., by being [restarted](cockroach-start.html) after being fully decommissioned):

~~~ json
{"tag":"cockroach.ops","c":1,"t":"1625766470.804899000","s":1,"sev":"I","g":7,"f":"util/log/event_log.go","l":32,"n":17,"r":1,"tags":{"n":"1"},"event":{"Timestamp":1625766470804896000,"EventType":"node_restart","NodeID":1,"StartedAt":1625766470561283000,"LastUp":1617319541533204000}}
~~~

- `tag` is a field required by the [Fluentd protocol](https://docs.fluentd.org/configuration/config-file).
- `sev` shows that the message has the `INFO` [severity level](logging.html#logging-levels-severities).
- `event` contains the fields for the structured [`node_restart`](eventlog.html#node_restart) event.
  - `NodeID` shows that the restarted node is `1`.
  - `StartedAt` shows the timestamp when the node was most recently restarted.
  - `LastUp` shows the timestamp when the node was up before being restarted.

See the [reference documentation](log-formats.html#format-json-fluent-compact) for details on the remaining JSON fields.

### Network logging with log buffering

A database operator can configure CockroachDB to buffer log messages for a configurable time period or collected message size before writing them to the [log sink](configure-logs.html#configure-log-sinks). This is especially useful for writing log messages to network log sinks, such as [Fluentd-compatible servers](configure-logs.html#output-to-fluentd-compatible-network-collectors) or [HTTP servers](configure-logs.html#output-to-http-network-collectors), where high-traffic or high-contention scenarios can result in log message write latency.

Log buffering is enabled by default on the [Fluentd-compatible](configure-logs.html#output-to-fluentd-compatible-network-collectors) and [HTTP](configure-logs.html#output-to-http-network-collectors) log sink destinations, but you may wish to adjust the buffering configuration for these log sinks based on your needs.

For example, the following logging configuration adjusts the default log buffering behavior for both a [Fluentd-compatible](configure-logs.html#output-to-fluentd-compatible-network-collectors) and an [HTTP](configure-logs.html#output-to-http-network-collectors) log sink destination:

~~~ yaml
fluent-defaults:
  buffering:
    flush-trigger-size: 2MiB
http-defaults:
  buffering:
    max-staleness: 10s
    max-buffer-size: 75MiB
sinks:
  fluent-servers:
    health:
      channels: HEALTH
      buffering:
        flush-trigger-size: 100KB  # Override flush-trigger-size for HEALTH channel only
  http-servers:
    health:
      channels: HEALTH
      buffering:
        max-staleness: 2s  # Override max-staleness for HEALTH channel only
        max-buffer-size: 100MiB # Override max-buffer-size for HEALTH channel only
~~~

Together, this configuration ensures that log messages to the Fluentd log sink target are buffered for up to `2MiB` in accumulated size, and log messages to the HTTP server log sink target are buffered for up to `10s` duration (with a limit of up to `75MiB` accumulated message size in the buffer before messages begin being dropped), before being written to the log sink. Further, each long sink target is configured with an overridden value for these settings specific to log messages in the `HEALTH` [log channel](logging-overview.html#logging-channels), which are flushed more aggressively in both cases.

See [Log buffering](configure-logs.html#log-buffering-for-network-sinks) for more information.

## See also

- [Notable Event Types](eventlog.html)
- [SQL Audit Logging](sql-audit-logging.html)
- [Use Prometheus and Alertmanager](monitor-cockroachdb-with-prometheus.html)
