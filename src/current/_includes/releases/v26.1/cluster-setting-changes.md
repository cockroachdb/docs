Changes to [cluster settings]({% link v26.1/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5>New cluster settings</h5>

- `changefeed.default_range_distribution_strategy` supports values `default` or `balanced_simple`. This new per-changefeed setting overrides the cluster setting `changefeed.default_range_distribution_strategy` where both exist.

    Example:

    ~~~ sql
    CREATE CHANGEFEED FOR x into 'null://' WITH
    range_distribution_strategy='balanced_simple';
    ~~~

<h5 id="v26-1-0-settings-changed-default">Settings with changed defaults</h5>

- `log.channel_compatibility_mode.enabled` has had its default changed to `false`
  - Events related to changefeed operations are now routed to the CHANGEFEED channel, while sampled queries and transactions, along with certain SQL performance events, are logged to SQL_EXEC. To continue using the previous logging channels, set `log.channel_compatibility_mode.enabled` to `true`.

- `sql.catalog.allow_leased_descriptors.enabled` (default: `true`)
  - Changed the default value of the `sql.catalog.allow_leased_descriptors.enabled` cluster setting to `true`. This setting allows introspection tables like `information_schema` and `pg_catalog` to use cached descriptors when building the table results, which improves the performance of introspection queries when there are many tables in the cluster.

<!-- Link references -->
