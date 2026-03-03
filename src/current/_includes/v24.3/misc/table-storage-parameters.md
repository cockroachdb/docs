|                    Parameter name                    |                                                                    Description                                                                    | Data type | Default value |
|------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------------|
| `exclude_data_from_backup`                           | Exclude the data in this table from any future backups.                                                                                           | Boolean   | `false`       |
| `schema_locked` | Disallow [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}) on this table. Enabling `schema_locked` can help [improve performance of changefeeds]({% link {{ page.version.version }}/create-changefeed.md %}#disallow-schema-changes-on-tables-to-improve-changefeed-performance) running on this table. | Boolean | `false` |
| `sql_stats_automatic_collection_enabled`             | Enable automatic collection of [full statistics]({% link {{ page.version.version }}/cost-based-optimizer.md %}#full-statistics) for this table. | Boolean   | `true`        |
| `sql_stats_automatic_collection_min_stale_rows`      | Minimum number of stale rows in this table that will trigger a statistics refresh.                                                                | Integer   | 500           |
| `sql_stats_automatic_collection_fraction_stale_rows` | Fraction of stale rows in this table that will trigger a statistics refresh.                                                                      | Float     | 0.2           |
| `sql_stats_forecasts_enabled`                        | Enable [forecasted statistics]({% link {{ page.version.version }}/show-statistics.md %}#display-forecasted-statistics) collection for this table.                                     | Boolean   | `true`        |

The following parameters are included for PostgreSQL compatibility and do not affect how CockroachDB runs:

- `autovacuum_enabled`
- `fillfactor`

For the list of storage parameters that affect how [Row-Level TTL]({% link {{ page.version.version }}/row-level-ttl.md %}) works, see the list of [TTL storage parameters]({% link {{ page.version.version }}/row-level-ttl.md %}#ttl-storage-parameters).