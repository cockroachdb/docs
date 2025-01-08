{% if page.path contains "cockroachcloud" %}
When you initiate a major-version upgrade, CockroachDB {{ site.data.products.cloud }} performs the following high-level steps, which are described in detail in the following sections.
{% else %}
A major-version upgrade involves the following high-level steps, which are described in detail in the following sections.
{% endif %}

1. On one node at a time:
    1. Replace the previous `cockroach` binary or container image with the new binary.
    1. Restart the `cockroach` process and verify that the node has rejoined the cluster.
1. When all nodes have rejoined the cluster:
    1. For a patch upgrade within the same major version, the upgrade is complete.
    1. For a major-version upgrade, the upgrade is not complete until it is [finalized](#finalize-a-major-version-upgrade-manually). Auto-finalization is enabled by default, and begins as soon as all nodes have rejoined the cluster using the new binary. If you need the ability to [roll back a major-version upgrade](#roll-back-a-major-version-upgrade), you can disable auto-finalization and finalize the upgrade manually. Certain features and performance improvements, such as those that require changes to system schemas or objects, are not available until the upgrade is finalized. Refer to the {% if page.path contains 'cockroachcloud' %}[Release Notes for the major version]({% link cockroachcloud/upgrade-policy.md %}#currently-supported-versions){% else %}[{{ page.version.version }} Release Notes]({% link releases/{{ page.version.version }}.md %}).{% endif %}.
