---
title: Cluster Upgrades
summary: Learn about the CockroachCloud upgrade policy.
toc: true
build_for: [cockroachcloud]
---

This page describes the upgrade policy for CockroachCloud.

CockroachCloud supports the latest major version of CockroachDB and the version immediately preceding it. Support for these versions includes minor version updates and security patches.

## Minor Version Upgrades
"Minor" versions (or "point" releases) are stable, backward-compatible improvements to the major versions of CockroachDB.

CockroachCloud automatically upgrades all clusters to the latest supported minor version (for example, v19.2.1 → v19.2.2) within the 2 business days after a minor version release. Starting April, the [CockroachCloud Admin(s)](cockroachcloud-console-access-management.html#console-admin) will be notified before and after their clusters are upgraded to the latest minor version.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major Version Upgrades

"Major" version releases contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v19.2.x → v20.1.x).

If you are a [CockroachCloud Admin](cockroachcloud-console-access-management.html#console-admin), you will receive an email notification for each major version release. The email will have instructions on how to opt-in to have your clusters upgraded to the new version.

### Auto-upgrades after current version EOL

As CockroachDB introduces new major versions, older versions reach their End of Life (EOL) on CockroachCloud. If you are running a CockroachDB version nearing EOL, you will be notified at least one month before that version’s EOL that your clusters will be auto-upgraded on the EOL date. You should request an upgrade to a newer CockroachDB version during this timeframe to avoid being force-upgraded.

### Rollback support

The default finalization period for each major upgrade is 7 days from upgrade completion. You can request a rollback of a major upgrade via a [support ticket](https://support.cockroachlabs.com/hc/en-us).
