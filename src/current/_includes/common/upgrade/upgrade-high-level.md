{% if page.path contains "cockroachcloud" %}
When you initiate a major-version upgrade, CockroachDB {{ site.data.products.cloud }} performs the following high-level steps, which are described in detail in the following sections.
{% else %}
A major-version upgrade involves the following high-level steps, which are described in detail in the following sections.
{% endif %}

1. On one node at a time:
    1. {% if page.path contains "cockroachcloud" %}The previous `cockroach` binary is replaced.{% else %}Replace the previous `cockroach` binary or container image with the new binary.{% endif %}
    1. {% if page.path contains "cockroachcloud" %}The `cockroach` process is restarted and the node rejoins the cluster.{% else %}Restart the `cockroach` process and verify that the node has rejoined the cluster.{% endif %}
1. When all nodes have rejoined the cluster:
    1. For a patch upgrade within the same major version, the upgrade is complete.
    1. For a major-version upgrade, the upgrade is not complete until it is [finalized](#finalize-a-major-version-upgrade-manually). Certain features and performance improvements, such as those requiring changes to system schemas or objects, are not available until the upgrade is finalized. Refer to the {% if page.path contains 'cockroachcloud' %} [Release Notes for the major version]({% link cockroachcloud/upgrade-policy.md %}#currently-supported-versions){% else %}[{{ page.version.version }} Release Notes]({% link releases/{{ page.version.version }}.md %}){% endif %} for details.

      {% if page.path contains "cockroachcloud" %}In CockroachDB {{ site.data.products.cloud }}, the cluster is finalized automatically after approximately 72 hours. During this time, you can choose to roll back the upgrade or manually finalize the cluster.{% else %}For self-hosted CockroachDB, automatic finalization is enabled by default, and begins as soon as all nodes have rejoined the cluster using the new binary. If you need the ability to [roll back a major-version upgrade](#roll-back-a-major-version-upgrade), you can disable auto-finalization and finalize the upgrade manually.{% endif %}

      Once a major-version upgrade is finalized, the cluster cannot be rolled back to the prior major version.
