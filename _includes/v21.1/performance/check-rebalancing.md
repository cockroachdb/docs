Since you started each node with the `--locality` flag set to its GCE zone, over the next minutes, CockroachDB will rebalance data evenly across the zones.

To check this, access the DB Console on any node at `<node address>:8080` and look at the **Node List**. You'll see that the range count is more or less even across all nodes:

<img src="{{ 'images/v21.1/perf_tuning_multi_region_rebalancing.png' | relative_url }}" alt="Perf tuning rebalancing" style="border:1px solid #eee;max-width:100%" />

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | `us-east1-b` (South Carolina)
4-6 | `us-west1-a` (Oregon)
7-9 | `us-west2-a` (Los Angeles)

To verify even balancing at range level, SSH to one of the instances not running CockroachDB and run the `SHOW EXPERIMENTAL_RANGES` statement:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
{{page.certs}} \
--host=<address of any node> \
--database=movr \
--execute="SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles;"
~~~

~~~
  start_key | end_key | range_id | replicas | lease_holder
+-----------+---------+----------+----------+--------------+
  NULL      | NULL    |       33 | {3,4,7}  |            7
(1 row)
~~~

In this case, we can see that, for the single range containing `vehicles` data, one replica is in each zone, and the leaseholder is in the `us-west2-a` zone.
