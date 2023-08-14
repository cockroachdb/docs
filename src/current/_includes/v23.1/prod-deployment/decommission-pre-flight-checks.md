By default, CockroachDB will perform a set of "decommissioning pre-flight checks". That is, decommission pre-checks look over the ranges with replicas on the to-be-decommissioned node, and check that each replica can be moved to some other node in the cluster. If errors are detected that would result in the inability to complete node decommissioning, they will be printed to `STDERR` and the command will exit *without attempting to perform node decommissioning*. For example, ranges that require a certain number of voting replicas in a region but do not have any available nodes in the region not already containing a replica will block the decommissioning process.

The error format is shown below:

~~~
ranges blocking decommission detected
n1 has 44 replicas blocked with error: "0 of 1 live stores are able to take a new replica for the range (2 already have a voter, 0 already have a non-voter); likely not enough nodes in cluster"
n2 has 27 replicas blocked with error: "0 of 1 live stores are able to take a new replica for the range (2 already have a voter, 0 already have a non-voter); likely not enough nodes in cluster"

ERROR: Cannot decommission nodes.
Failed running "node decommission"
~~~

These checks can be skipped by [passing the flag `--checks=skip` to `cockroach node decommission`]({% link {{ page.version.version }}/cockroach-node.md %}#decommission-checks).

{{site.data.alerts.callout_info}}
The amount of remaining disk space on other nodes in the cluster is not yet considered as part of the decommissioning pre-flight checks. For more information, see [cockroachdb/cockroach#71757](https://github.com/cockroachdb/cockroach/issues/71757)
{{site.data.alerts.end}}
