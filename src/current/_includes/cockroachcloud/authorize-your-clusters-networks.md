{{ site.data.products.db }} requires you to authorize the specific networks that can access your clusters. This prevent denial-of-service and brute force password attacks from elsewhere on the internet.

- In both development and production environments, you will need to authorize the networks 
- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.
- If you have a GCP cluster, you can set up and authorize [a VPC peered network](create-your-cluster.html#step-7-enable-vpc-peering-optional).
- If you have an AWS cluster, you can set up an [AWS PrivateLink](network-authorization.html#aws-privatelink) connection.
- You should use PrivateLink or VPC peering if you need to allowlist more than 20 IP addresses, if your servers’ IP addresses are not static, or if you want to limit your cluster's exposure to the public internet.

### Add IP addresses to the allowlist

{{site.data.alerts.callout_info}}
IPv6 addresses are currently not supported.
{{site.data.alerts.end}}

1. Navigate to your cluster's **Networking > IP Allowlist** tab.

    The **IP Allowlist** tab displays a list of authorized networks (i.e., an IP network allowlist) that can access the cluster.

1. Check if the current network has been authorized. If not, proceed with the following steps.

1. Click the **Add Network** button.

    The **Add Network** dialog displays.

1. _(Optional)_ Enter a **Network name**.

1. From the **Network** dropdown, select:
    - **New Network** to authorize your local machine's network or application server's network. Enter the public IPv4 address of the machine in the **Network** field. To add a range of IP addresses, use the CIDR (Classless Inter-Domain Routing) notation. For a general introduction to IP routing, refer to to [Digital Ocean&mdash;Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).
    - **Current Network** to auto-populate your local machine's IP address.
    - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.