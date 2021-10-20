---
title: Admission Control
summary: Learn about admission control system in CockroachDB.
toc: true
---

<span class="version-tag">New in v21.2:</span> CockroachDB implements optional admission control to maintain cluster performance and availability when experiencing high load on some part of the cluster. When admission control is enabled, CockroachDB

A well-provisioned CockroachDB cluster may still encounter performance bottlenecks at the node level, as stateful nodes can develop hotspots that last until the cluster rebalances itself. When hotspot nodes occur, they should not cause failures or degraded performance for important work. In {{ site.data.products.serverless }}, one user tenant cluster experiencing high load should not degrade the performance or availability on a different, isolated tenant cluster running on the same host cluster.

Admission control is turned off by default. To turn on admission control for [KV requests](distribution-layer.html) set the [`admission.kv.enabled`](../cluster-setings.html) to enabled. To turn on admission control for [KV responses](distributing-layer.html) set the [`admission.sql_kv_response.enabled`](../cluster-setings.html) cluster settings to `true`.

##