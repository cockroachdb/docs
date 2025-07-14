In the `molt fetch` command, use `--replicator-flags` to pass options to the included `replicator` process that handles continuous replication. For details on all available flags, refer to the [MOLT Fetch documentation]({% link molt/molt-fetch.md %}#replication-flags).

{% if page.name == "migrate-data-load-replicate-only.md" %}
<section class="filter-content" markdown="1" data-scope="postgres">
|       Flag      |                                                  Description                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `--metricsAddr` | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |
</section>

<section class="filter-content" markdown="1" data-scope="mysql">
|        Flag        |                                                             Description                                                             |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| `--defaultGTIDSet` | **Required.** Default GTID set for changefeed.                                                                                      |
| `--metricsAddr`    | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                      |
| `--userscript`     | Path to a userscript that enables table filtering from MySQL sources. Refer to [Table filter userscript](#table-filter-userscript). |

Replication from MySQL requires `--defaultGTIDSet`, which sets the starting GTID for replication. You can find this value in the `cdc_cursor` field of the `fetch complete` message after the [initial data load](#load-data-into-cockroachdb) completes.
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
|         Flag        |                                                             Description                                                              |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `--scn`             | **Required.** Snapshot System Change Number (SCN) for the initial changefeed starting point.                                         |
| `--backfillFromSCN` | **Required.** SCN of the earliest active transaction at the time of the snapshot. Ensures no transactions are skipped.               |
| `--metricsAddr`     | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                       |
| `--userscript`      | Path to a userscript that enables table filtering from Oracle sources. Refer to [Table filter userscript](#table-filter-userscript). |

Replication from Oracle requires `--scn` and `--backfillFromSCN`, which specify the snapshot SCN and the earliest active transaction SCN, respectively. You can find these values in the message `replication-only mode should include the following replicator flags` after the [initial data load](#load-data-into-cockroachdb) completes.
</section>

{% elsif page.name == "migrate-replicate-only.md" %}
|        Flag       |                                                  Description                                                   |
|-------------------|----------------------------------------------------------------------------------------------------------------|
| `--stagingSchema` | **Required.** Staging schema name for the changefeed checkpoint table.                                         |
| `--metricsAddr`   | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |

Resuming replication requires `--stagingSchema`, which specifies the staging schema name used as a checkpoint. MOLT Fetch [logs the staging schema name]({% link molt/migrate-data-load-replicate-only.md %}#replicate-changes-to-cockroachdb) when it starts replication:

~~~ shell
staging database name: _replicator_1749699789613149000
~~~

<section class="filter-content" markdown="1" data-scope="mysql">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript]({% link molt/migrate-data-load-replicate-only.md %}?filters=mysql#table-filter-userscript).
{{site.data.alerts.end}}
</section>

<section class="filter-content" markdown="1" data-scope="oracle">
{{site.data.alerts.callout_info}}
When using `--table-filter`, you must also include `--userscript`. Refer to [Table filter userscript]({% link molt/migrate-data-load-replicate-only.md %}?filters=oracle#table-filter-userscript).
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
| `--tlsCertificate` | Path to the server TLS certificate for the webhook sink. Refer to [Secure failback for changefeed](#secure-changefeed-for-failback). |
| `--tlsPrivateKey`  | Path to the server TLS private key for the webhook sink. Refer to [Secure failback for changefeed](#secure-changefeed-for-failback). |
| `--metricsAddr`    | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`.                       |

- Failback requires `--stagingSchema`, which specifies the staging schema name used as a checkpoint. MOLT Fetch [logs the staging schema name]({% link molt/migrate-data-load-replicate-only.md %}#replicate-changes-to-cockroachdb) when it starts replication:

	~~~ shell
	staging database name: _replicator_1749699789613149000
	~~~

- When configuring a [secure changefeed](#secure-changefeed-for-failback) for failback, you **must** include `--tlsCertificate` and `--tlsPrivateKey`, which specify the paths to the server certificate and private key for the webhook sink connection.

{% else %}
|       Flag      |                                                  Description                                                   |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `--metricsAddr` | Enable Prometheus metrics at a specified `{host}:{port}`. Metrics are served at `http://{host}:{port}/_/varz`. |
{% endif %}