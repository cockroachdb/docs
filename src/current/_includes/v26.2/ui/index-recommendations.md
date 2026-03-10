## Index recommendations

The [Indexes List Tab](#indexes-list-tab) of the [Table Details Page](#table-details-page) shows recommendations to drop indexes based on index usage with a **Drop index** button. Admin users can click this to drop an unused index.

The [Index Details Page](#index-details-page) also shows recommendations to drop the selected index based on index usage.

To configure the threshold for when CockroachDB will recommend that you drop an index due to low usage, change the [`sql.index_recommendation.drop_unused_duration` cluster setting]({% link {{ version_prefix }}/cluster-settings.md %}). The default value is 7 days.
