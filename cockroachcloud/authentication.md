---
title: Authentication
summary: Learn about the authentication features for CockroachCloud clusters.
toc: true
redirect_from:
- ../stable/cockroachcloud-authentication.html
---

CockroachCloud uses TLS 1.2 for inter-node and client-node communication, digital certificates for inter-node authentication, [SSL modes](#ssl-mode-settings) for node identity verification, and password authentication for client identity verification.

## Node identity verification

The [connection string](connect-to-your-cluster.html) generated to connect to your application uses the `verify-full` [SSL mode](https://www.postgresql.org/docs/11/libpq-ssl.html) by default to verify a node’s identity. This mode encrypts the data in-flight as well as verifies the identity of the CockroachDB node, thus ensuring a secure connection to your cluster. Using this mode prevents MITM (Man in the Middle) attacks, impersonation attacks, and eavesdropping.

To connect securely to your cluster using the `verify-full` mode:

1. Download the CA certificate and place it in the `certs` directory. The Certificate Authority (CA) certificate is the file that the client uses to verify the identity of the CockroachDB node.
2. When connecting to the cluster, specify the path to the `certs` directory in the connection string. See [Connect to your cluster](connect-to-your-cluster.html) for more details.

You can also use the `require` SSL mode, although we do not recommend using it since it can make the cluster susceptible to MITM and impersonation attacks. For more information, see the "Protection Provided in Different Modes" section in PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.

## Client identity verification

CockroachCloud uses password authentication for verifying a client’s identity. If no password has been set up for a user, password authentication will always fail for that user and you won’t be able to connect to the cluster.

For more information about creating SQL users and passwords, see [User Authorization](user-authorization.html).

## SSL Mode settings

The table below lists the `ssl-mode` settings you can use to [connect to your cluster](connect-to-your-cluster.html) and their associated security risks. Other settings are not recommended.

`ssl-mode` | Eavesdropping protection | MITM protection | Description
-------------|------------|------------|------------
`require` | Yes | No | Less secure than using a CA certificate. This may leave your cluster vulnerable to attacks and is only recommended for testing or unimportant data.
`verify-full` | Yes | Yes | Ensures that you connect to the trusted server of your choice. A CA certificate is required.

## See also

- [Client Connection Parameters](../stable/connection-parameters.html)
- [Connect to Your CockroachCloud Cluster](connect-to-your-cluster.html)
