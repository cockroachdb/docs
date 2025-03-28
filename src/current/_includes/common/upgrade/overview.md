### Types of upgrades

- **Major-version upgrades**: A [major-version upgrade]({% link releases/index.md %}#major-releases), such as from v24.2 to v24.3, may include new features, updates to cluster setting defaults, and backward-incompatible changes. Performing a major-version upgrade requires an additional step to finalize the upgrade.

{% if page.path contains "cockroachcloud" %}
    As of 2024, there are four major versions per year, where every second release is an [innovation release]({% link cockroachcloud/upgrade-policy.md %}#innovation-releases). For CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }}, innovation releases offer shorter [support windows]({% link cockroachcloud/upgrade-policy.md %}#cockroachdb-cloud-support-policy) and can be skipped. For CockroachDB {{ site.data.products.basic }}, all major version upgrades are applied automatically as they become available, including innovation releases.
{% else %}
    As of 2024, every second major version is an [Innovation release]({% link releases/release-support-policy.md %}#innovation-releases). Innovation releases offer shorter support windows and can be skipped.
{% endif %}
- **Patch upgrades**: A [patch upgrade]({% link releases/index.md %}#patch-releases) moves a cluster from one patch release to another within a major version, such as from v24.2.3 to v24.2.4. Patch upgrades do not introduce backward-incompatible changes.

    A major version of CockroachDB has two phases of patch releases: a series of **testing releases** (beta, alpha, and RC releases) followed by a series of **production releases** (vX.Y.0, vX.Y.1, and so on). A major version’s first production release (the .0 release) is also known as its GA release.

{% if page.path contains "cockroachcloud" %}
    For CockroachDB {{ site.data.products.advanced }}, {{ site.data.products.standard }}, and {{ site.data.products.basic }} clusters, all production patch releases for a major version are automatically applied, until the cluster is upgraded to a new major version.
{% endif %}

    - In the lead-up to a new major version's GA, a series of beta and RC releases {% if page.path contains "cockroachcloud" %}may be made available to CockroachDB {{ site.data.products.advanced }} as Pre-Production Preview releases{% else %}are made available{% endif %} for testing and validation. Testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments.

      {% if page.path contains "cockroachcloud" %}If a cluster is upgraded to a Pre-Production Preview release, it will be automatically upgraded to subsequent patch releases within the major version, including newer Pre-Production Preview testing releases, the GA release, and subsequent production patch releases.{% else %}{{site.data.alerts.callout_info}}A cluster cannot be upgraded from an alpha binary of a prior release or from a binary built from the `master` branch of the CockroachDB source code.{{site.data.alerts.end}}{% endif %}

To learn more about CockroachDB major versions and patches, refer to the [Releases Overview]({% link releases/index.md %}#overview).

{% if page.path contains "cockroachcloud" %}
### Upgrade differences across Cloud plans

CockroachDB Cloud plan | Major version upgrades | Innovation releases
---------------------- | ---------------------- | ----------------------
Basic | Automatic | Required
Standard | Automatic (default) or customer-initiated | Optional
Advanced | Customer-initiated | Optional

{{site.data.alerts.callout_info}}
For CockroachDB {{ site.data.products.basic }} clusters and CockroachDB {{ site.data.products.standard }} clusters that are set to upgrade automatically, major version upgrades are finalized immediately and cannot be rolled back. {{ site.data.products.basic }} and {{ site.data.products.standard }} clusters are upgraded to the .1 patch release of a major version, not the initial .0 release.
{{site.data.alerts.end}}

For all Cloud plans:

- All major versions that are Regular releases (as opposed to Innovation releases) are required upgrades before proceeding to a newer major version. To maintain support, an upgrade to a supported version must occur prior to the [EOS date]({% link cockroachcloud/upgrade-policy.md %}) of the current version.
- Patch version upgrades occur automatically.
{% endif %}
### Compatible versions

A cluster may always be upgraded to the next major release{% if page.path contains "cockroachcloud" %} once it is made available in CockroachDB Cloud{% endif %}. As of v24.1{% if page.path contains "cockroachcloud" %}, for CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.advanced }} clusters{% endif %}, every second major verison is an Innovation release that can be skipped: 

- If your cluster is running a major version that is a Regular release, it can be upgraded to either:
  - the next major version (an Innovation release)
  - the release that follows the next major version (the next Regular release, once it is available, skipping the Innovation release).

- If a cluster is running a major version that is labeled an Innovation release, it can be upgraded only to the next Regular release.

<img src="../images/common/version-skipping-diagram.png" alt="Diagram of CockroachDB major version upgrade availability, i.e. the ability to skip innovation releases" style="max-width: 100%;">