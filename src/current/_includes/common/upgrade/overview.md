CockroachDB offers the following types of upgrades:

- **Major-version upgrades**: A [major-version upgrade]({% link releases/index.md %}#major-releases) moves a cluster from one major version of CockroachDB to another, such as from v24.2 to v24.3. A major-version upgrade may include new features, updates to cluster setting defaults, and backward-incompatible changes. Performing a major-version upgrade requires an additional step to finalize the upgrade.

{% if page.path contains "cockroachcloud" %}
    As of 2024, every second major version is an[Innovation release]({% link cockroachcloud/upgrade-policy.md %}#innovation-release). For CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }},innovation releases offer shorter support windows and can be skipped. Innovation releases are required for CockroachDB {{ site.data.products.basic }}, and are applied automatically.
{% else %}
    As of 2024, every second major version is an [Innovation release]({% link releases/release-suppoert-policy.md %}#innovation-release). Innovation releases offer shorter support windows and can be skipped. {% if page.path contains "cockroachcloud" %}
{% endif %}
- **Patch upgrades**: A [patch upgrade]({% link releases/index.md %}#patch-releases) moves a cluster from one patch to another within a major version, such as from v24.2.3 to v24.2.4. Patch upgrades do not introduce backward-incompatible changes.

{% if page.path contains "cockroachcloud" %}
    Patch upgrades are automatically applied to CockroachDB {{ site.data.products.advanced }}, {{ site.data.products.standard }}, and {{ site.data.products.basic }} clusters.
{% endif %}

    A major version of CockroachDB has two phases of patch releases: a series of **testing releases** followed by a series of **production releases**. A major version’s initial production release is also known as its GA release. In the lead-up to a new major version's GA release, a series of Testing releases may be made available{% if page.path contains "cockroachcloud" %} to CockroachDB {{ site.data.products.advanced }} as Pre-Production Preview releases{% endif %} for testing and validation. Testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. {% if page.path contains "cockroachcloud" %}If a cluster is upgraded to a Pre-Production Preview patch release, it will be automatically upgraded to subsequent patch releases within the major version, including newer Pre-Production Preview releases, the initial GA release, and subsequent patch releases.{% else %}{{site.data.alerts.callout_info}}A cluster cannot be upgraded from an alpha binary of a prior release or from a binary built from the `master` branch of the CockroachDB source code.{{site.data.alerts.end}}{% endif %}

To learn more about CockroachDB major versions and patches, refer to the [Releases Overview]({% link releases/index.md %}#overview).
