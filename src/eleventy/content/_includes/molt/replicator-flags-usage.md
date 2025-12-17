The following [MOLT Replicator]({% link "molt/molt-replicator.md" %}) flags are **required** for continuous replication. For details on all available flags, refer to the [MOLT Replicator documentation]({% link "molt/molt-replicator.md" %}#flags).

{% if page.name == "migrate-load-replicate.md" %}
<section class="filter-content" markdown="1" data-scope="postgres">
|           Flag          |                                                                              Description                                                                               |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--slotName`            | **Required.** PostgreSQL replication slot name. Must match the slot name specified with `--pglogical-replication-slot-name` in the [MOLT Fetch command](#start-fetch). |
| `--targetSchema`        | **Required.** Target schema name on CockroachDB where tables will be replicated.                                                                                       |
| `--stagingSchema`       | **Required.** Staging schema name for replication metadata and checkpoints.                                                                                            |
| `--stagingCreateSchema` | **Required.** Automatically create the staging schema if it does not exist. Include this flag when starting replication for the first time.                            |
| `--metricsAddr`         | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                                                         |
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
|           Flag          |                                                                                 Description                                                                                  |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--targetSchema`        | **Required.** Target schema name on CockroachDB where tables will be replicated.                                                                                             |
| `--defaultGTIDSet`      | **Required.** Default GTID set for changefeed.                                                                                                                               |
| `--stagingSchema`       | **Required.** Staging schema name for replication metadata and checkpoints.                                                                                                  |
| `--stagingCreateSchema` | **Required.** Automatically create the staging schema if it does not exist. Include this flag when starting replication for the first time.                                  |
| `--fetchMetadata`       | Explicitly fetch column metadata for MySQL versions that do not support `binlog_row_metadata`. Requires `SELECT` permissions on the source database or `PROCESS` privileges. |
| `--metricsAddr`         | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                                                               |
| `--userscript`          | Path to a userscript that enables table filtering from MySQL sources. Refer to [Table filter userscript](#table-filter-userscript).                                          |

You can find the starting GTID in the `cdc_cursor` field of the `fetch complete` message after the [initial data load](#start-fetch) completes.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
|           Flag          |                                                                 Description                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `--sourceSchema`        | **Required.** Source schema name on Oracle where tables will be replicated from.                                                            |
| `--targetSchema`        | **Required.** Target schema name on CockroachDB where tables will be replicated.                                                            |
| `--scn`                 | **Required.** Snapshot System Change Number (SCN) for the initial changefeed starting point.                                                |
| `--backfillFromSCN`     | **Required.** SCN of the earliest active transaction at the time of the snapshot. Ensures no transactions are skipped.                      |
| `--stagingSchema`       | **Required.** Staging schema name for replication metadata and checkpoints.                                                                 |
| `--stagingCreateSchema` | **Required.** Automatically create the staging schema if it does not exist. Include this flag when starting replication for the first time. |
| `--metricsAddr`         | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                              |
| `--userscript`          | Path to a userscript that enables table filtering from Oracle sources. Refer to [Table filter userscript](#table-filter-userscript).        |

You can find the SCN values in the message `replication-only mode should include the following replicator flags` after the [initial data load](#start-fetch) completes.
</section>

{% elsif page.name == "migrate-resume-replication.md" %}
|        Flag       |                                                  Description                                                   |
|-------------------|----------------------------------------------------------------------------------------------------------------|
| `--stagingSchema` | **Required.** Staging schema name for the changefeed checkpoint table.                                         |
| `--metricsAddr`   | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |

The staging schema was created during [initial replication setup]({% link "molt/migrate-load-replicate.md" %}#start-replicator) with `--stagingCreateSchema`.

<section class="filter-content" markdown="1" data-scope="mysql oracle">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript]({% link "molt/migrate-load-replicate.md" %}#table-filter-userscript).
{{site.data.alerts.end}}
</section>

{% elsif page.name == "migrate-failback.md" %}
|        Flag        |                                                             Description                                                              |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--stagingSchema`  | **Required.** Staging schema name for the changefeed checkpoint table.                                                               |
| `--bindAddr`       | **Required.** Network address to bind the webhook sink for the changefeed. For example, `:30004`.                                    |
| `--tlsCertificate` | Path to the server TLS certificate for the webhook sink. Refer to [TLS certificate and key](#tls-certificate-and-key). |
| `--tlsPrivateKey`  | Path to the server TLS private key for the webhook sink. Refer to [TLS certificate and key](#tls-certificate-and-key). |
| `--metricsAddr`    | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                       |

- The staging schema is first created during [initial replication setup]({% link "molt/migrate-load-replicate.md" %}#start-replicator) with `--stagingCreateSchema`.

- When configuring a [secure changefeed](#tls-certificate-and-key) for failback, you **must** include `--tlsCertificate` and `--tlsPrivateKey`, which specify the paths to the server certificate and private key for the webhook sink connection.

{% else %}
|       Flag      |                                                  Description                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `--metricsAddr` | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |
{% endif %}