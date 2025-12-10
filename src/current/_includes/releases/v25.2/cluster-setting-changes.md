Changes to [cluster settings]({% link v25.2/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v25-2-0-settings-added">Settings added</h5>

- `feature.vector_index.enabled` - Set to `TRUE` to enable vector indexes. Default is `FALSE` (not enabled).
- `server.child_metrics.include_aggregate.enabled` - When `TRUE`, reports both aggregate and child Prometheus metrics, which can be helpful for quick top-level insights or backward compatibility, but should be disabled if you’re seeing inflated values in Prometheus queries due to double counting. Defaults to `TRUE`.
- `ui.default_timezone` - Allows you to set the time zone for displayed timestamps in the DB Console. (Refer to [DB Console timezone configuration]({% link v25.2/ui-overview.md %}#db-console-timezone-configuration).) Replaces the deprecated [`ui.display_timezone` cluster setting]({% link v25.2/cluster-settings.md %}#setting-ui-display-timezone). If that value had been set, it will automatically be applied to the new setting `ui.default_timezone`, which takes precedence.
- `server.oidc_authentication.provider.custom_ca` - Supports a custom root CA for verifying certificates while authenticating with an OIDC provider.
- `sql.stats.automatic_full_collection.enabled` - It is now possible to automatically collect partial table statistics, but disable automatic collection of full table statistics. To do so, change this setting to `FALSE`. It defaults to `TRUE`. In addition to this cluster setting, you can use the table setting `sql_stats_automatic_full_collection_enabled`.

<h5 id="v25-2-0-settings-with-changed-visibility">Settings with changed visibility</h5>

The following settings are now marked `public` after previously being `reserved`. Reserved settings are not documented and their tuning by customers is not supported.

- `sql.stats.detailed_latency_metrics.enabled` - Percentile latencies are no longer available for **SQL Activity**. The implementation of these percentiles was error-prone and difficult to understand because it was computed differently from the other SQL statistics collected. Customers interested in viewing percentile latencies per statement fingerprint are encouraged to use the experimental per-fingerprint histograms that can be enabled with the `sql.stats.detailed_latency_metrics.enabled` cluster setting. This will enable externalized histogram metrics via the Prometheus scrape endpoint. [#139500](https://github.com/cockroachdb/cockroach/pulls/139500)

<h5 id="v25-2-0-settings-requiring-operational-changes">Settings requiring operational changes</h5>

- To prevent unnecessary queuing in admission control CPU queues, set the `goschedstats.always_use_short_sample_period.enabled` cluster setting to `true` for any production cluster.
