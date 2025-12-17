After a node has initially joined a cluster, it is not possible to add additional [stores](cockroach-start.html#store) to the node. Stopping the node and restarting it with additional stores causes the node to not reconnect to the cluster.

To work around this limitation, [decommission the node](remove-nodes.html), remove its data directory, and then run [`cockroach start`](cockroach-start.html) to join the cluster again as a new node.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/39415)
