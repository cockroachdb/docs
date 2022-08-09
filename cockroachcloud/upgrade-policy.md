---
title: Upgrade Policy
summary: Learn about the CockroachDB Cloud upgrade policy.
toc: true
docs_area: manage
---

This page describes the upgrade policy for {{ site.data.products.db }}. For self-hosted clusters, see the CockroachDB [Release Support Policy](../releases/release-support-policy.html).

{{ site.data.products.db }} supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes patch version updates and security patches.

{{site.data.alerts.callout_danger}}
[{{ site.data.products.serverless }}](quickstart.html) clusters are subject to automatic upgrades for both major and patch releases.
{{site.data.alerts.end}}

## Patch version upgrades

Patch version [releases](../releases/), or "maintenance" releases, contain stable, backward-compatible improvements to the major versions of CockroachDB (for example, v21.2.0 → v21.2.1).

All {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters are subject to automatic upgrades to the latest supported patch version. **To ensure that connections remain current during these upgrades, it's important to use [connection retry logic](production-checklist.html#keeping-connections-current) in your application.**

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

Major version [releases](../releases/) (for example, v21.1.x → v21.2.x) contain new functionality and potentially backward-incompatible changes to CockroachDB.

Major version upgrades are automatic for {{ site.data.products.serverless }} clusters and opt-in for {{ site.data.products.dedicated }} clusters. [Console Admins](console-access-management.html#console-admin) must initiate major version upgrades for {{ site.data.products.dedicated }} clusters. When a new major version is available, Admins will be able to [start an upgrade](upgrade-to-v21.2.html) from the {{ site.data.products.db }} Console for clusters using the paid version of {{ site.data.products.dedicated }}. When a major version upgrade is initiated for a cluster, it will upgrade to the latest patch version as well.

### Rollback support

When upgrading a {{ site.data.products.dedicated }} cluster to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can [trigger a rollback to the previous major version](upgrade-to-v21.2.html#roll-back-the-upgrade) from the {{ site.data.products.db }} Console. 

Note that you will roll back to the latest patch version of the previous major version, not the same patch version you were running before you initiated the upgrade.

If you see problems after the upgrade has been finalized, it will not be possible to roll back via the {{ site.data.products.db }} Console; you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

### End of Support for older CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on {{ site.data.products.db }}. A CockroachDB version reaches EOS when it is two major versions behind the latest version. For example, now that CockroachDB v21.2 has been released, CockroachDB v20.2 has reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions). Further downgrades in support may occur as per the [CockroachDB Release Support Policy](../releases/release-support-policy.html).

If you are running a CockroachDB version nearing EOS, you will be reminded at least one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. A Console Admin can [upgrade your cluster](upgrade-to-v21.2.html) directly from the {{ site.data.products.db }} Console.

## See also

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](upgrade-to-v21.2.html).
