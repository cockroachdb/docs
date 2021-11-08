---
title: Upgrade Policy
summary: Learn about the CockroachDB Cloud upgrade policy.
toc: true
---

This page describes the upgrade policy for {{ site.data.products.db }}.

{{ site.data.products.db }} supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes minor version updates and security patches.

{{site.data.alerts.callout_danger}}
[{{ site.data.products.serverless }}](quickstart.html) clusters are subject to automatic upgrades for both minor and major releases.
{{site.data.alerts.end}}

## Minor version upgrades

[Minor versions](https://www.cockroachlabs.com/docs/releases/) (or "point" releases) are stable, backward-compatible improvements to the major versions of CockroachDB. All clusters, including both {{ site.data.products.serverless }} and {{ site.data.products.dedicated }} clusters, are subject to automatic upgrades to the latest supported minor version (for example, v21.1.0 → v21.1.1). Because these upgrades cause nodes to restart, it's important to use [connection retry logic](production-checklist.html#keeping-connections-current) in your application.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

[Major version releases](../releases/) contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v20.2.x → v21.1.x).

[Console Admins](console-access-management.html#console-admin) must initiate major version upgrades. When a new major version is available, Admins will be able to [start an upgrade directly from the {{ site.data.products.db }} Console](upgrade-to-v21.1.html) for clusters using the paid version of {{ site.data.products.dedicated }}. When you initiate a major version upgrade for your cluster, it will upgrade to the latest minor version as well. {{ site.data.products.serverless }} clusters are subject to automatic upgrades to the latest supported major version.

### Support downgrade for older CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on {{ site.data.products.db }}. A CockroachDB version reaches EOS when it is 2 major versions behind the latest version. For example, now that CockroachDB v21.1 has been released, CockroachDB v20.1 has reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions). Further downgrades in support may occur as per the [CockroachDB Release Support Policy](../releases/release-support-policy.html).

If you are running a CockroachDB version nearing EOS, you will be reminded at least one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. You can [upgrade your cluster](upgrade-to-v21.1.html) directly from the {{ site.data.products.db }} Console.

### Rollback support

When you upgrade to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version directly from the {{ site.data.products.db }} Console. If you see problems after the upgrade has been finalized, it will not be possible to roll back via the {{ site.data.products.db }} Console; you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

## See also

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](upgrade-to-v21.1.html).
