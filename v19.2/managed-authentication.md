---
title: Authentication
summary: Learn about the authentication features for Managed CockroachDB clusters.
toc: true
build_for: [managed]
---

Managed CockroachDB uses TLS 1.2 for inter-node and client-node communication, digital certificates for inter-node authentication, [SSL modes](https://www.postgresql.org/docs/11/libpq-ssl.html) for node identity verification, and password authentication for client identity verification.

## Node identity verification

The [connection string](managed-connect-to-your-cluster.html) generated to connect to your application uses the `verify-full` [SSL mode](https://www.postgresql.org/docs/11/libpq-ssl.html) by default to verify a node’s identity. This mode encrypts the data in-flight as well as verifies the identity of the CockroachDB node, thus ensuring a secure connection to your cluster. Using this mode prevents MITM (Man in the Middle) attacks, impersonation attacks, and eavesdropping.

To connect securely to your cluster using the `verify-full` mode:

1. Download the CA certificate and place it in the `certs` directory. The Certificate Authority (CA) certificate is the file that the client uses to verify the identity of the CockroachDB node.
2. When connecting to the cluster, specify the path to the `certs` directory in the connection string. See [Connect to your cluster](managed-connect-to-your-cluster.html) for more details.

You can also use the `require` SSL mode, although we do not recommend using it since it can make the cluster susceptible to MITM and impersonation attacks. For more information, see the "Protection Provided in Different Modes" section in PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.

## Client identity verification

Managed CockroachDB uses password authentication for verifying a client’s identity. If no password has been set up for a user, password authentication will always fail for that user and you won’t be able to connect to the cluster.

To set a password for a SQL user, [use the Console](managed-authorization.html#use-the-console) or the  [`ALTER USER`](alter-user.html) command.

## See also

- [Client Connection Parameters](connection-parameters.html)
- [Connect to Your Managed Cluster](managed-connect-to-your-cluster.html)
