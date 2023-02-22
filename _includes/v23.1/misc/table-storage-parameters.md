|                    Parameter name                    |                                                                    Description                                                                    | Data type | Default value |
|------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|-----------|---------------|
| `exclude_data_from_backup`                           | Exclude the data in this table from any future backups.                                                                                           | Boolean   | `false`       |
| `sql_stats_automatic_collection_enabled`             | Enable [automatic statistics collection](cost-based-optimizer.html#enable-and-disable-automatic-statistics-collection-for-tables) for this table. | Boolean   | `true`        |
| `sql_stats_automatic_collection_min_stale_rows`      | Minimum number of stale rows in this table that will trigger a statistics refresh.                                                                | Integer   | 500           |
| `sql_stats_automatic_collection_fraction_stale_rows` | Fraction of stale rows in this table that will trigger a statistics refresh.                                                                      | Float     | 0.2           |
| `sql_stats_forecasts_enabled`                        | Enable [forecasted statistics](show-statistics.html#display-forecasted-statistics) collection for this table.                                     | Boolean   | `true`        |

The following parameters are included for PostgreSQL compatibility and do not affect how CockroachDB runs:

- `autovacuum_enabled`
- `fillfactor`

For the list of storage parameters that affect how [Row-Level TTL](row-level-ttl.html) works, see the list of [TTL storage parameters](row-level-ttl.html#ttl-storage-parameters).