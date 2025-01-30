---
title: Upgrade CockroachDB self-hosted
summary: Learn how to upgrade a self-hosted CockroachDB cluster.
toc: true
docs_area: manage
---

This page describes how major-version and patch upgrades work and shows how to upgrade a self-hosted CockroachDB. To upgrade a cluster in CockroachDB {{ site.data.products.cloud }}, refer to [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}](upgrade-cockroach-version.md) instead.

## Overview



CockroachDB's [multi-active availability]({{ page.version.version }}/multi-active-availability.md) means that your cluster remains available while you upgrade one node at a time in a rolling fashion. While a node is being upgraded, its resources are not available to the cluster.


## Prepare to upgrade


### Ensure you have a valid license key


## Perform a patch upgrade


### Roll back a patch upgrade


## Perform a major-version upgrade


### Finalize a major-version upgrade manually


### Roll back a major-version upgrade


## Disable auto-finalization


## Troubleshooting


## See also
