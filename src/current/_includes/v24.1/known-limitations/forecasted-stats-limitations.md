- The following [cluster settings]({% link {{ page.version.version }}/cluster-settings.md %}) do not immediately take effect, and instead only take effect when new statistics are collected for a table.

	- [`sql.stats.forecasts.max_decrease`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-forecasts-max-decrease)
	- [`sql.stats.forecasts.min_goodness_of_fit`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-forecasts-min-goodness-of-fit)
	- [`sql.stats.forecasts.min_observations`]({% link {{ page.version.version }}/cluster-settings.md %}#setting-sql-stats-forecasts-min-observations)

	Although [`SHOW STATISTICS WITH FORECAST`]({% link {{ page.version.version }}/show-statistics.md %}#display-forecasted-statistics) shows the settings taking effect immediately, they do not actually take effect until new statistics are collected (as can be verified with [`EXPLAIN`]({% link {{ page.version.version }}/explain.md %})).

	As a workaround, disable and enable forecasting at the [cluster]({% link {{ page.version.version }}/cost-based-optimizer.md %}#enable-and-disable-automatic-statistics-collection-for-clusters) or [table]({% link {{ page.version.version }}/cost-based-optimizer.md %}#enable-and-disable-automatic-statistics-collection-for-tables) level. This will invalidate the statistics cache and cause these settings to take effect immediately. [#123852](https://github.com/cockroachdb/cockroach/issues/123852)