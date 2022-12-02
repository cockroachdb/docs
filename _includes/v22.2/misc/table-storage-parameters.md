| Parameter name             | Description                                              | Data type | Default value |
|----------------------------+----------------------------------------------------------+-----------+---------------|
| `exclude_data_from_backup` | Excludes the data in this table from any future backups. | Boolean   | `false`       |

The following parameters are included for PostgreSQL compatibility and do not affect how CockroachDB runs:

- `autovacuum_enabled`
- `fillfactor`
