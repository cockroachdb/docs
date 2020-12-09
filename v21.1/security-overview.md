---
title: CockroachDB Security
summary: Learn about the authentication, encryption, authorization, and audit log features for secure CockroachDB clusters.
toc: true
---

An insecure CockroachDB cluster comes with serious risks:

- Your cluster is open to any client that can access any node's IP addresses.
- Any user, even `root`, can log in without providing a password.
- Any user, connecting as `root`, can read or write any data in your cluster.
- There is no network encryption or authentication, and thus no confidentiality.

To avoid these security risks, CockroachDB provides authentication, encryption, authorization, and audit logging features to deploy secure clusters. Before we deep-dive into how these features work, let's discuss why we need each of these features.

## Security overview

It all starts with the desire for two parties to communicate securely over an insecure computer network. A conventional solution to ensure secure communication is **symmetric encryption** that involves encrypting and decrypting a plaintext message using a shared key. This seems like the logical solution until you realize that you need a secure communication channel to share the encryption key. This is a Catch-22 situation: How do you establish a secure channel to share the encryption key?

An elegant solution is to use **Public Key Cryptography (PKI)** (also called **asymmetric encryption**) to establish a secure communication channel, and then sharing the symmetric encryption key over the secure channel.

Asymmetric encryption involves a pair of keys instead of a single key. The two keys are called the **public key** and the **private key**. The keys consist of very long numbers linked mathematically in a way such that a message encrypted using a public key can only be decrypted using the private key and vice versa. The message cannot be decrypted using the same key that was used to encrypt the message.

CockroachDB uses the [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) security protocol that takes advantage of both symmetric as well as asymmetric encryption. The TLS 1.2 protocol uses asymmetric encryption to establish a secure channel as well as **authenticate** the communicating parties. It then uses symmetric encryption to protect data in flight.

However, it's not enough to protect data in flight; you also need to protect data at rest. That's where CockroachDB's **Encryption at Rest** feature comes into the picture. Encryption at Rest is an enterprise feature that allows encryption of all files on disk using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [counter mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_(CTR)), with all key
sizes allowed.

Along with authentication and encryption, we also need to allow CockroachDB to restrict access to **authorized** clients (or nodes acting as clients). CockroachDB allows you to create, manage, and remove your cluster's [users](authorization.html#create-and-manage-users) and assign SQL-level [privileges](authorization.html#assign-privileges) to the users. Additionally, you can use [role-based access management (RBAC)](authorization.html#create-and-manage-roles) for simplified user management.

Finally, CockroachDB's **SQL audit logging** gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

The following section summarizes the CockroachDB security features and provides links to detailed documentation for each feature.

## Security features in CockroachDB

Security feature | Description
-------------|------------
[Authentication](authentication.html) | <ul><li>Inter-node and node identity authentication using TLS 1.2</li><li>Client identity authentication using TLS 1.2 or username/password</li></ul>
[Encryption](encryption.html) | <ul><li>Encryption in flight using TLS 1.2</li><li> Encryption at Rest using AES in counter mode (Enterprise feature)</li></ul>
[Authorization](authorization.html) | <ul><li>Users and privileges</li><li> Role-based access control</li></ul>
[Audit logging](sql-audit-logging.html) | `ALTER TABLE...EXPERIMENTAL AUDIT` to get detailed information about queries being executed against your system
