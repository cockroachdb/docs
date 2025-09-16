The following [MOLT Replicator]({% link molt/molt-replicator.md %}) flags are **required** for continuous replication. For details on all available flags, refer to the [MOLT Replicator documentation]({% link molt/molt-replicator.md %}#flags).

{% if page.name == "migrate-load-replicate.md" %}
<section class="filter-content" markdown="1" data-scope="postgres">
|       Flag       |                                                  Description                                                   |
|------------------|----------------------------------------------------------------------------------------------------------------|
| `--targetSchema` | **Required.** Target schema name on CockroachDB where tables will be replicated.                               |
| `--metricsAddr`  | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
|        Flag        |                                                                                 Description                                                                                  |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--targetSchema`   | **Required.** Target schema name on CockroachDB where tables will be replicated.                                                                                             |
| `--defaultGTIDSet` | **Required.** Default GTID set for changefeed.                                                                                                                               |
| `--fetchMetadata`  | Explicitly fetch column metadata for MySQL versions that do not support `binlog_row_metadata`. Requires `SELECT` permissions on the source database or `PROCESS` privileges. |
| `--metricsAddr`    | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                                                               |
| `--userscript`     | Path to a userscript that enables table filtering from MySQL sources. Refer to [Table filter userscript](#table-filter-userscript).                                          |

Replication from MySQL requires `--defaultGTIDSet`, which sets the starting GTID for replication. You can find this value in the `cdc_cursor` field of the `fetch complete` message after the [initial data load](#start-fetch) completes.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
|         Flag        |                                                             Description                                                              |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--targetSchema`    | **Required.** Target schema name on CockroachDB where tables will be replicated.                                                     |
| `--sourceSchema`    | **Required.** Source schema name on Oracle where tables will be replicated from.                                                     |
| `--scn`             | **Required.** Snapshot System Change Number (SCN) for the initial changefeed starting point.                                         |
| `--backfillFromSCN` | **Required.** SCN of the earliest active transaction at the time of the snapshot. Ensures no transactions are skipped.               |
| `--metricsAddr`     | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                       |
| `--userscript`      | Path to a userscript that enables table filtering from Oracle sources. Refer to [Table filter userscript](#table-filter-userscript). |

Replication from Oracle requires `--sourceSchema`, `--scn`, and `--backfillFromSCN`. The `--sourceSchema` specifies the Oracle schema to replicate from, while `--scn` and `--backfillFromSCN` specify the snapshot SCN and the earliest active transaction SCN, respectively. You can find the SCN values in the message `replication-only mode should include the following replicator flags` after the [initial data load](#start-fetch) completes.
</section>

{% elsif page.name == "migrate-resume-replication.md" %}
|        Flag       |                                                  Description                                                   |
|-------------------|----------------------------------------------------------------------------------------------------------------|
| `--stagingSchema` | **Required.** Staging schema name for the changefeed checkpoint table.                                         |
| `--metricsAddr`   | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |

Resuming replication requires `--stagingSchema`, which specifies the staging schema name used as a checkpoint. MOLT Fetch [logs the staging schema name]({% link molt/migrate-load-replicate.md %}#replicate-changes-to-cockroachdb) as the `staging database name` when it starts replication. For example:

~~~ json
	{"level":"info","time":"2025-02-10T14:28:13-05:00","message":"staging database name: _replicator_1749699789613149000"}
~~~

<section class="filter-content" markdown="1" data-scope="mysql">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript]({% link molt/migrate-load-replicate.md %}?filters=mysql#table-filter-userscript).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript]({% link molt/migrate-load-replicate.md %}?filters=oracle#table-filter-userscript).
{{site.data.alerts.end}}
</section>

{% elsif page.name == "migrate-data-load-and-replication.md" %}
|       Flag      |                                                  Description                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `--metricsAddr` | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |

<section class="filter-content" markdown="1" data-scope="mysql">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript](#table-filter-userscript).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript](#table-filter-userscript).
{{site.data.alerts.end}}
</section>

{% elsif page.name == "migrate-failback.md" %}
|        Flag        |                                                             Description                                                              |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--stagingSchema`  | **Required.** Staging schema name for the changefeed checkpoint table.                                                               |
| `--bindAddr`       | **Required.** Network address to bind the webhook sink for the changefeed. For example, `:30004`.                                    |
| `--tlsCertificate` | Path to the server TLS certificate for the webhook sink. Refer to [Secure failback for changefeed](#secure-changefeed-for-failback). |
| `--tlsPrivateKey`  | Path to the server TLS private key for the webhook sink. Refer to [Secure failback for changefeed](#secure-changefeed-for-failback). |
| `--metricsAddr`    | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                       |

- Failback requires `--stagingSchema`, which specifies the staging database name used for replication checkpoints and metadata. The staging schema is first created with [`--stagingCreateSchema`]({% link molt/migrate-load-replicate.md %}). For details on the staging schema, refer to [Staging schema]({% link molt/molt-replicator.md %}#staging-schema).

- When configuring a [secure changefeed](#secure-changefeed-for-failback) for failback, you **must** include `--tlsCertificate` and `--tlsPrivateKey`, which specify the paths to the server certificate and private key for the webhook sink connection.

{% else %}
|       Flag      |                                                  Description                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `--metricsAddr` | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |
{% endif %}