| Parameter name      | Description | Data type | Default value |
|---------------------+----------------------+-----+------|
| `exclude_data_from_backup` | **New in v22.1:** Excludes the data in this table from any future backups. | Boolean | `false` |
| `ttl` | Signifies if a TTL is active. Automatically set and controls the reset of all TTL-related storage parameters. | N/A | N/A |
| `ttl_automatic_column` | If set, use the value of the `crdb_internal_expiration` hidden column. Always set to `true` and cannot be reset. | Boolean | `true` |
| `ttl_delete_batch_size` | The number of rows to [delete](delete.html) at a time. Minimum: `1`. | Integer | `100` |
| `ttl_delete_rate_limit` | The maximum number of rows to be deleted per second (rate limit). `0` means no limit. | Integer | `0` |
| `ttl_expire_after` | The [interval](interval.html) when a TTL will expire. This parameter is required to enable TTL. Minimum: `'1 microsecond'`.<br/><br/>Use `RESET (ttl)` to remove from the table. | Interval | N/A |
| `ttl_job_cron` | The frequency at which the TTL job runs. | [CRON syntax](https://cron.help) | `'@hourly'` |
| `ttl_label_metrics` | Whether or not [TTL metrics](row-level-ttl.html#ttl-metrics) are labelled by table name (at the risk of added cardinality). | Boolean | `false` |
| `ttl_pause` | If set, stops the TTL job from executing. | Boolean | `false` |
| `ttl_range_concurrency` | The Row-Level TTL queries split up scans by ranges, and this determines how many concurrent ranges are processed at a time. Minimum: `1`. | Integer | `1` |
| `ttl_row_stats_poll_interval` | If set, counts rows and expired rows on the table to report as Prometheus metrics while the TTL job is running. Unset by default, meaning no stats are fetched and reported. | Interval | N/A |
| `ttl_select_batch_size` | The number of rows to [select](select-clause.html) at one time during the row expiration check. Minimum: `1`. | Integer | `500` |

The following parameters are included for PostgreSQL compatibility and do not affect how CockroachDB runs:

- `autovacuum_enabled`
- `fillfactor`
