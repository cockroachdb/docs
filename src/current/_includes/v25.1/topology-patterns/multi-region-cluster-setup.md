Each [multi-region pattern]({% link {{ page.version.version }}/topology-patterns.md %}#multi-region) assumes the following setup:

<img src="/docs/images/{{ page.version.version }}/topology-patterns/topology_multi-region_hardware.png" alt="Multi-region hardware setup" style="max-width:100%" />

#### Hardware

- 3 regions
- Per region, 3+ AZs with 3+ VMs evenly distributed across them
- Region-specific app instances and load balancers
    - Each load balancer redirects to CockroachDB nodes in its region.
    - When CockroachDB nodes are unavailable in a region, the load balancer redirects to nodes in other regions.

#### Cluster startup

Start each node with the [`--locality`]({% link {{ page.version.version }}/cockroach-start.md %}#locality) flag specifying its region and AZ combination. For example, the following command starts a node in the `west1` AZ of the `us-west` region:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start \
--locality=region=us-west,zone=west1 \
--certs-dir=certs \
--advertise-addr=<node1 internal address> \
--join=<node1 internal address>:26257,<node2 internal address>:26257,<node3 internal address>:26257 \
--cache=.25 \
--max-sql-memory=.25 \
--background
~~~
