## Index recommendations

{% include_cached new-in.html version="v22.2" %} The [**Databases**](#databases), [table details](#table-details), and [index details](#index-details) pages show recommendations to drop indexes based on index usage. You can traverse the **Databases** page and **Tables** view to determine which indexes have recommendations.

To configure the threshold for determining when to drop an index due to low usage, change the [`sql.index_recommendation.drop_unused_duration` cluster setting]({{ link_prefix }}cluster-settings.html). The default value is 7 days.
