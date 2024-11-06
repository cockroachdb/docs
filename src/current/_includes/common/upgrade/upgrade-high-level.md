At a high level, a cluster upgrade involves the following steps, which are detailed in the following sections:

1. On one node at a time:
    1. Replace the previous `cockroach` binary or container image with the new binary.
    1. Restart the `cockroach` process and verify that the node has rejoined the cluster.
1. When all nodes have rejoined the cluster:
    1. For a patch upgrade within the same major version, the upgrade is complete.
    1. For a major-version upgrade, the upgrade is not complete until it is [finalized](#finalize-a-major-version-upgrade-manually). Auto-finalization is enabled by default, and begins as soon as all nodes have rejoined the cluster using the new binary. If you need the ability to [roll back a major-version upgrade](#roll-back-a-major-version-upgrade), you can disable auto-finalization and finalize the upgrade manually. Certain features and performance improvements, such as those that require changes to system schemas or objects, are not available until the upgrade is finalized. Refer to the {% if page.path contains 'cockroachcloud' %} [{{ site.current_cloud_version }} Release Notes]({% link releases/{{ site.current_cloud_version }}.md %}){% else %}[{{ page.version.version }} Release Notes]({% link releases/{{ page.version.version }}.md %}).{% endif %}.
