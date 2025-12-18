To upgrade from one patch release to another within the same major version, perform the following steps on one node at a time:

1. Replace the `cockroach` binary on the node with the binary for the new patch release. For containerized workloads, update the deployment's image to the image for the new patch release.
1. Restart CockroachDB on the node.
1. Verify that the node has rejoined the cluster.
1. Ensure that the node is ready to accept a SQL connection.

    Unless there are tens of thousands of ranges on the node, it's usually sufficient to wait one minute. To be certain that the node is ready, run the following command:

    ~~~ shell
    cockroach sql -e 'select 1'
    ~~~

When all nodes are running the new patch version, the upgrade is complete.
