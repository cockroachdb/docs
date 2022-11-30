---
title: Authenticating to CockroachDB Cloud
summary: Learn about the authentication features for CockroachDB Cloud clusters.
toc: true
docs_area: manage
---

Users may connect with {{ site.data.products.db }} in two ways:

- The [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) provides an overview of your {{ site.data.products.db }} account, and offers functionality for administrating or connecting to clusters.
- SQL clients, including the [CockroachDB CLI](../{{site.versions["cloud"]}}/cockroach-start.html) client and the [various supported drivers and ORMs](../{{site.versions["cloud"]}}/install-client-drivers.html), connect directly to CockroachDB clusters using the [CockroachDB SQL interface](../{{site.versions["cloud"]}}/sql-feature-support.html).


## {{ site.data.products.db }} authentication

You may log in to the [{{ site.data.products.db }} Console](https://cockroachlabs.cloud/) with a username and password, or by using [Single Sign-on (SSO) for {{ site.data.products.db }}](cloud-org-sso.html).

{% include cockroachcloud/prefer-sso.md %}

If you have not done so, [create your own free {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.html).

## Connecting SQL clients

To execute SQL statements or perform database administration functions on a cluster, you must connect to the cluster with a SQL client. CockroachDB clients include the CockroachDB CLI, and numerous [drivers and object-relational mapping (ORM) tools](../{{site.versions["cloud"]}}/install-client-drivers.html).

To connect any SQL client to a {{ site.data.products.db }} cluster, you must have a username/password combination and the [TLS public root certificate authority (CA) certificate of the cluster](../{{site.versions["cloud"]}}/security-reference/transport-layer-security.html#certificates-signing-trust-and-authority).

To connect any SQL client to a {{ site.data.products.db }} cluster, you must have a username/password combination, and the [TLS public root certificate authority (CA) certificate of the cluster](../{{site.versions["cloud"]}}/security-reference/transport-layer-security.html#certificates-signing-trust-and-authority).

### Node identity verification

The [connection string](connect-to-your-cluster.html) generated to connect to your application uses the `verify-full` [SSL mode](#ssl-mode-settings) by default to verify a node’s identity. This mode encrypts the data in-flight as well as verifies the identity of the CockroachDB node, thus ensuring a secure connection to your cluster. Using this mode prevents MITM (Machine in the Middle) attacks, impersonation attacks, and eavesdropping.

To connect securely to your cluster using the `verify-full` mode:

1. Download the CA certificate and place it in the `certs` directory. The Certificate Authority (CA) certificate is the file that the client uses to verify the identity of the CockroachDB node.
1. When connecting to the cluster, specify the path to the `certs` directory in the connection string. See [Connect to your cluster](connect-to-your-cluster.html) for more details.

You can also use the `require` SSL mode, although we do not recommend using it since it can make the cluster susceptible to MITM and impersonation attacks. For more information, see the "Protection Provided in Different Modes" section in PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.

### Client identity verification

{{ site.data.products.db }} uses password authentication for verifying a client’s identity. If no password has been set up for a user, password authentication will always fail for that user and you won’t be able to connect to the cluster.

For more information about creating SQL users and passwords, see [User Authorization](user-authorization.html).

### SSL mode settings

The table below lists the `sslmode` settings you can use to [connect to your cluster](connect-to-your-cluster.html) and their associated security risks. Other settings are not recommended.

`sslmode` | Eavesdropping protection | MITM protection | Description
-------------|------------|------------|------------
`require` | Yes | No | 	Force a secure connection. An error occurs if the secure connection cannot be established. This is less secure than using a CA certificate and is only recommended for testing or unimportant data.
`verify-full` | Yes | Yes | Force a secure connection, verify that the server certificate is signed by a known CA, and verify that the server address matches that specified in the certificate.

## See also

- [Cloud Organization SSO](cloud-org-sso.html)
- [Configure Cloud Organization SSO](configure-cloud-org-sso.html)
- [Client Connection Parameters](../{{site.versions["cloud"]}}/connection-parameters.html)
- [Connect to Your {{ site.data.products.dedicated }} Cluster](connect-to-your-cluster.html)
