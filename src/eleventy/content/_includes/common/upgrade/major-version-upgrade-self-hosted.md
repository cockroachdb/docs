To perform a major upgrade:

1. One node at a time:
    1. Replace the `cockroach` binary on the node with the binary for the new patch release. For containerized workloads, update the deployment to use the image for the new patch release.
    1. Restart CockroachDB on the node. For containerized workloads, use your orchestration framework to restart the `cockroach` process in the node's container.
    1. Ensure that the node is ready to accept a SQL connection. Unless there are tens of thousands of [ranges]({% link "{{ page.version.version }}/architecture/overview.md" %}#architecture-range) on the node, this takes less than a minute.

        To be certain that the node is ready, run the following command to connect to the cluster and run a test query.

        {% include "copy-clipboard.html" %}
        ~~~ shell
        cockroach sql -e 'select 1'
        ~~~
1. If auto-finalization is enabled (the default), finalization begins as soon as the last node rejoins the cluster with the new binary. When finalization finishes, the upgrade is complete.
1. If auto-finalization is disabled, follow your organization's testing procedures to decide whether to [finalize the upgrade](#finalize-a-major-version-upgrade-manually) or [roll back](#roll-back-a-major-version-upgrade) the upgrade. After finalization begins, you can no longer roll back to the cluster's previous major version.
