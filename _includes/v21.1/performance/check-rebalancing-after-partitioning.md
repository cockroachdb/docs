Over the next minutes, CockroachDB will rebalance all partitions based on the constraints you defined.

To check this at a high level, access the Web UI on any node at `<node address>:8080` and look at the **Node List**. You'll see that the range count is still close to even across all nodes but much higher than before partitioning:

<img src="{{ 'images/v21.1/perf_tuning_multi_region_rebalancing_after_partitioning.png' | relative_url }}" alt="Perf tuning rebalancing" style="border:1px solid #eee;max-width:100%" />

To check at a more granular level, SSH to one of the instances not running CockroachDB and run the `SHOW EXPERIMENTAL_RANGES` statement on the `vehicles` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
{{page.certs}} \
--host=<address of any node> \
--database=movr \
--execute="SELECT * FROM \
[SHOW EXPERIMENTAL_RANGES FROM TABLE vehicles] \
WHERE \"start_key\" IS NOT NULL \
    AND \"start_key\" NOT LIKE '%Prefix%';"
~~~

~~~
     start_key     |          end_key           | range_id | replicas | lease_holder
+------------------+----------------------------+----------+----------+--------------+
  /"boston"        | /"boston"/PrefixEnd        |      105 | {1,2,3}  |            3
  /"los angeles"   | /"los angeles"/PrefixEnd   |      121 | {7,8,9}  |            8
  /"new york"      | /"new york"/PrefixEnd      |      101 | {1,2,3}  |            3
  /"san francisco" | /"san francisco"/PrefixEnd |      117 | {7,8,9}  |            8
  /"seattle"       | /"seattle"/PrefixEnd       |      113 | {4,5,6}  |            5
  /"washington dc" | /"washington dc"/PrefixEnd |      109 | {1,2,3}  |            1
(6 rows)
~~~

For reference, here's how the nodes map to zones:

Node IDs | Zone
---------|-----
1-3 | `us-east1-b` (South Carolina)
4-6 | `us-west1-a` (Oregon)
7-9 | `us-west2-a` (Los Angeles)

We can see that, after partitioning, the replicas for New York, Boston, and Washington DC are located on nodes 1-3 in `us-east1-b`, replicas for Seattle are located on nodes 4-6 in `us-west1-a`, and replicas for San Francisco and Los Angeles are located on nodes 7-9 in `us-west2-a`.
