---
title: Networking Page
summary: The Networking page displays a list of authorized networks (i.e., an IP address whitelist) that can access the cluster.
toc: true
build_for: [managed]
---


The **Networking** page displays a list of authorized networks (i.e., an IP address whitelist) that can access the cluster.

<img src="{{ 'images/v19.1/managed/networking.png' | relative_url }}" alt="Networking page" style="border:1px solid #eee;max-width:100%" />

For each network, the following displays:

- The **Network** IP address in [CIDR notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation)
- If the network can connect to the cluster's **UI**, **SQL** client, or both (with ports for each listed in the table heading)
- A list of **Actions** (**Edit** or **Delete**) you can take on the network

From the **Networking** page, you can add a network to your IP whitelist by clicking **Add Network** in the top right corner. For more information, see [Connect to Your Managed Cluster](managed-connect-to-your-cluster.html#authorize-your-network).
