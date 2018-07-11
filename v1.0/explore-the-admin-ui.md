---
title: Explore the Admin UI
toc: true
feedback: false
---

CockroachDB's Admin UI provides detail about your cluster's performance and health.


## Access the Admin UI

You can access the UI from any node in the cluster, each of which will show nearly identical data.

By default, you can access it via HTTP on port `8080` of whatever value you used for the node's `--host` value. For example, `http://<any node host>:8080`.

However, you can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html) (i.e., each node's values are dependent on how it's started; there is no cluster-level configuration for non-default values). For example, if you set both a custom port and hostname, `http://<http-host value>:<http-port value>`.

For additional guidance on accessing the Admin UI, see [Start a Local Cluster](start-a-local-cluster.html) and [Manual Deployment](manual-deployment.html).

## More Info 
*Additional docs coming soon.*