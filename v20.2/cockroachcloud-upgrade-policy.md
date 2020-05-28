---
title: Upgrade Policy
summary: Learn about the CockroachCloud upgrade policy.
toc: true
build_for: [cockroachcloud]
---

This page describes the upgrade policy for CockroachCloud.

CockroachCloud supports the [latest major version](https://www.cockroachlabs.com/docs/) of CockroachDB and the version immediately preceding it. Support for these versions includes minor version updates and security patches.

## Minor version upgrades
[Minor versions](https://www.cockroachlabs.com/docs/releases/) (or "point" releases) are stable, backward-compatible improvements to the major versions of CockroachDB. CockroachCloud automatically upgrades all clusters to the latest supported minor version (for example, v19.2.1 → v19.2.2).

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major version upgrades

[Major version releases](https://www.cockroachlabs.com/docs/releases/) contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v19.2.x → v20.1.x).

When a new major version is available, [CockroachCloud Admin](cockroachcloud-console-access-management.html#console-admin)s will be able to [start an upgrade directly from the CockroachCloud Console](cockroachcloud-upgrade-to-v20.1.html).

### Auto-upgrades after CockroachDB version EOL

As CockroachDB releases new major versions, older versions reach their End of Life (EOL) on CockroachCloud. A CockroachDB version reaches EOL on CockroachCloud when it is 2 major versions behind the latest version (for example, CockroachDB 19.1 reaches EOL when CockroachDB 20.1 is released).

If you are running a CockroachDB version nearing EOL, you will be notified at least one month before that version’s EOL that your clusters will be auto-upgraded on the EOL date. You should request an upgrade to a newer CockroachDB version during this timeframe to avoid being force-upgraded.

### Rollback support

When you upgrade to a new major version, once all nodes are running the new version, you have approximately 72 hours before the upgrade is automatically finalized. During this window, if you see unexpected behavior, you can trigger a rollback to the previous major version directly from the CockroachCloud Console. If you see problems after the upgrade has been finalized, it will not be possible to roll back via the CockroachCloud Console; you will have to [reach out to support](https://support.cockroachlabs.com/hc/en-us/requests/new).

## See also

For more details about the upgrade and finalization process, see [Upgrade to the Latest CockroachDB Version](cockroachcloud-upgrade-to-v20.1.html).
