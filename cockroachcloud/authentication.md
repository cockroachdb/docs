---
title: Authenticating to CockroachDB Cloud
summary: Learn about the authentication features for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

This page concerns authenticating to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/), which provides an overview of your {{ site.data.products.db }} account, and offers functionality for administrating or connecting to clusters.

For information about authenticating CockroachDB SQL clients to CockroachDB clusters, see [SQL Client Authentication](../{{site.versions["stable"]}}/security-reference/authentication.html)

Users may connect with {{ site.data.products.db }} in two ways:

- The [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) provides an overview of your {{ site.data.products.db }} account, and offers functionality for administrating or connecting to clusters.
- SQL clients, including the CockroachDB CLI client and the [various supported drivers and ORMs](../{{site.versions["stable"]}}/install-client-drivers.html), connect directly to CockroachDB clusters using the [CockroachDB SQL interface](../{{site.versions["stable"]}}/sql-feature-support.html).

## Cloud Console authentication

You may log in to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) with a username and password, or using SSO.

{% include cockroachcloud/prefer-sso.md %}

## SQL authentication

For information about 


### Node identity verification

The [connection string](connect-to-your-cluster.html) generated to connect to your application uses the `verify-full` [SSL mode](#ssl-mode-settings) by default to verify a node’s identity. This mode encrypts the data in-flight as well as verifies the identity of the CockroachDB node, thus ensuring a secure connection to your cluster. Using this mode prevents MITM (Machine in the Middle) attacks, impersonation attacks, and eavesdropping.

To connect securely to your cluster using the `verify-full` mode:

1. Download the CA certificate and place it in the `certs` directory. The Certificate Authority (CA) certificate is the file that the client uses to verify the identity of the CockroachDB node.
2. When connecting to the cluster, specify the path to the `certs` directory in the connection string. See [Connect to your cluster](connect-to-your-cluster.html) for more details.

You can also use the `require` SSL mode, although we do not recommend using it since it can make the cluster susceptible to MITM and impersonation attacks. For more information, see the "Protection Provided in Different Modes" section in PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.

For more information about creating SQL users and passwords, see [User Authorization](user-authorization.html).



## See also

- [Client Connection Parameters](../{{site.versions["stable"]}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
