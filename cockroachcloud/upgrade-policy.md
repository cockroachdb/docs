---
title: Upgrade Policy
summary: Learn about the CockroachCloud upgrade policy.
toc: true
redirect_from:
- ../stable/cockroachcloud-upgrade-policy.html
---

This page describes the upgrade policy for CockroachCloud.

CockroachCloud supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes minor version updates and security patches.

## Minor version upgrades

[Minor versions](https://www.cockroachlabs.com/docs/releases/) (or "point" releases) are stable, backward-compatible improvements to the major versions of CockroachDB. CockroachCloud automatically upgrades all clusters to the latest supported minor version (for example, v20.1.1 → v20.1.2).

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

[Major version releases](../releases/) contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v20.1.x → v20.2.x).

When a new major version is available, [CockroachCloud Admins](console-access-management.html#console-admin) will be able to [start an upgrade directly from the CockroachCloud Console](upgrade-to-v20.2.html).

### Support downgrade for older CockroachDB versions

As CockroachDB releases new major versions, older versions reach their End of Support (EOS) on CockroachCloud. A CockroachDB version reaches EOS when it is 2 major versions behind the latest version. For example, now that CockroachDB v20.2 has been released, CockroachDB v19.2 has reached EOS.

Clusters running unsupported CockroachDB versions are not eligible for our [availability SLA](https://www.cockroachlabs.com/cloud-terms-and-conditions). Further downgrades in support may occur as per the [CockroachDB Release Support Policy](../releases/release-support-policy.html).

If you are running a CockroachDB version nearing EOS, you will be reminded at least one month before that version’s EOS that your clusters must be upgraded by the EOS date to avoid losing support. You can [upgrade your cluster](upgrade-to-v20.2.html) directly from the CockroachCloud Console.

### Rollback support

When you upgrade to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version directly from the CockroachCloud Console. If you see problems after the upgrade has been finalized, it will not be possible to roll back via the CockroachCloud Console; you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

## See also

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](upgrade-to-v20.2.html).
