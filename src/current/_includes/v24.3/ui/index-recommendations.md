## Index recommendations

The [**Table Indexes**](#table-indexes) and the [**Index**](#index) pages show recommendations to drop indexes based on index usage. On the **Table Indexes** page, a **Drop index** button accompanies recommendations. Admin users can click this to drop an unused index.

To configure the threshold for when CockroachDB will recommend that you drop an index due to low usage, change the [`sql.index_recommendation.drop_unused_duration` cluster setting]({% link {{ version_prefix }}/cluster-settings.md %}). The default value is 7 days.
