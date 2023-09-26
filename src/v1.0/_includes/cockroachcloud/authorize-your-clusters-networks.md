{{site.data.alerts.callout_info}}
IPv6 addresses are currently not supported.
{{site.data.alerts.end}}

To prevent denial-of-service attacks, brute force password attacks, and other forms of malicious activity, it is recommended to restrict your cluster network to allow access only from specific IP address ranges controlled by your organization, corresponding to, for example, your application deployments, hardened administrator access points, or disaster recovery pipelines.

### Add IP addresses to the allowlist

1. Navigate to your cluster's **Networking > IP Allowlist** tab.

    The **IP Allowlist** tab displays a list of authorized networks (i.e., an IP network allowlist) that can access the cluster.

1. Check if the current network has been authorized. If not, proceed with the following steps.

1. Click the **Add Network** button.

    The **Add Network** dialog displays.

1. _(Optional)_ Enter a **Network name**.

1. From the **Network** dropdown, select:
    - **New Network** to authorize the network of your local machine or application deployment or another valid source. Enter the public IPv4 address of the source machine in the **Network** field. To add a range of source IP addresses, use the CIDR (Classless Inter-Domain Routing) notation. For a general introduction to IP routing, refer to [Digital Ocean&mdash;Understanding IP Addresses, Subnets, and CIDR Notation for Networking](https://www.digitalocean.com/community/tutorials/understanding-ip-addresses-subnets-and-cidr-notation-for-networking#cidr-notation).
    - **Current Network** to auto-populate your local machine's IP address.
    - **Public (Insecure)** to allow all networks, use `0.0.0.0/0`. Use this with caution as your cluster will be vulnerable to denial-of-service and brute force password attacks.