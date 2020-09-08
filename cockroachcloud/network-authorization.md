
---
title: Network Authorization
summary: Learn about the user authorization features for CockroachCloud clusters.
toc: true
---

CockroachCloud requires you to authorize the networks that can access the cluster. This helps prevent denial-of-service and brute force password attacks.

Authorize your application server’s network and your local machine’s network by adding the IP addresses in the CIDR notation using the [Networking page](connect-to-your-cluster.html#step-1-authorize-your-network). If you change your location, you will need to authorize the new location’s network, else the connection from that network will be rejected.

{{site.data.alerts.callout_info}}
While developing and testing your application, you may add `0.0.0.0/0` to the allowlist, which allows all networks. However, before moving into production, make sure you delete the `0.0.0.0/0` network since it allows anybody who uses your password to reach the CockroachDB nodes.
{{site.data.alerts.end}}
