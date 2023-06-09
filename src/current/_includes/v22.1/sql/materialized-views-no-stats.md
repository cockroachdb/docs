- The optimizer may not select the most optimal query plan when querying materialized views because CockroachDB does not [collect statistics](cost-based-optimizer.html#table-statistics) on materialized views.

    [Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/78181).
