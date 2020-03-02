---
title: Cluster Upgrades
summary: Learn about the CockroachCloud upgrade policy.
toc: true
build_for: [cockroachcloud]
---

This page describes the upgrade policy for CockroachCloud.

CockroachCloud supports the most recent major version of CockroachDB (v19.2) and the version immediately preceding it (v19.1).
Support for these versions includes minor version updates and security patches.

## Minor Version Upgrades
"Minor" versions (or "point" releases) are stable, backward-compatible improvements to the GA versions of CockroachDB (for example, v19.2.1 → v19.2.2).

CockroachCloud automatically upgrades all clusters to the latest supported minor version within the 2 business days after a minor version release. Starting April, the CockroachCloud Organization owner will be notified via email before and after their clusters are upgraded to the latest minor version.

{{site.data.alerts.callout_danger}}
Single-node clusters will experience some downtime during cluster maintenance.
{{site.data.alerts.end}}

## Major Version Upgrades

"Major" version releases contain new functionality and potentially backward-incompatible changes to CockroachDB (for example, v19.2.x → v20.1.x)
Customers will receive an email notifying them that a new major release is available. From the notification email, the customer will be able to select from three actions: “upgrade my cluster”, “remind me later”, “ok, got it”, “wait for point release”
If they select “upgrade my cluster”, they are considered opted-in and their cluster will be added to the upgrade queue
If they select “remind me later”, they will receive a follow-up email in 7 days with the same options
If they select “ok, got it”, they will be considered “opted-out” for now. We will put them in a separate email campaign to push for an upgrade before the EOL date.
If they select “wait for point release” they will be considered ‘opted in’ for when the first minor release is available.
Once opted-in to a major release, customers will be upgraded within the next three business days
As CRDB introduces new major versions, older versions reach their End of Life (EOL) on CockroachCloud. Customers running older, supported versions (n-1) of CRDB will receive a notification no later than 1 month before that version’s EOL explaining that their clusters will be auto-upgraded on the EOL date. Customers should request an upgrade to the subsequent version (n) during this timeframe to avoid being force-upgraded.
The finalization period is 7 days from upgrade completion. Customers can request a rollback of a major upgrade via a support ticket.
