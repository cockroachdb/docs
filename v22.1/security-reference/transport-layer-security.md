---
title: Transport Layer Security (TLS) in CockroachDB
summary: Overview of Transport Layer Security (TLS) in CockroachDB
toc: true
docs_area: reference.security
---

This pages provides a conceptual overview of Transport Layer Security (TLS) and details its role in securing CockroachDB.

## What is TLS?

Transport Layer Security (TLS) is a protocol used to establish securely authenticated and encrypted traffic between a client (the party who initiates the session) and a server (the party receiving the connection request).

### Key pairs

The fundamental mechanism of TLS is a pair of cryptographic keys (usually referred to as a 'key pair' for short):

- The **private key** is randomly (unguessably) generated.
- The **public key** is derived mathematically from the private key in such a way that:
	- Text encrypted with either can be decrypted with the other.
	- It is prohibitively computationally expensive to compute the private from the public key.

The useful implication is that if you hold such a key pair, you can distribute the public key to anyone with whom you want to communicate securely, and as long as you retain sole posession of the private key, two things are guaranteed:

- Anyone who has the public key can use it to encrypt a message and send it to you, knowing that you alone can decrypt it with the private key.
- Anyone who receives a message that can be decrypted correctly using the public key knows it *must* have been encrypted with the private key, meaning it must have come from you.

TLS therefore provides two critical security features:

- **Encryption**: it prevents message from being eavesdropped or tampered with.
- **Authentication**: it allows one or both parties to prove their identity that cannot be impersonated (or 'spoofed' in cyberspeak).

TLS connections can be either *one-sided*, meaning that only one party must prove its identity before an encrypted session is established, or *two-sided* (or *mutual*), meaning that both must prove their identities. In mutually authenticated TLS connections, each parties must have a key-pair issued by a jointly trusted CA.

{{site.data.alerts.callout_info}}
Encryption using a key pair is "asymmetric", in that a different key is used to encrypt and decrypt. Encryption is called "symmetric" where the same key is used to encrypt and decrypt&mdash;as the metal key in a mechanical lock-and-key system is used to both lock and unlock.

Symmetric encryption is more efficient than asymmetric encryiption, but it requires all parties to have the single key shared key prior to the exchange.

With asymmetric encryption, by contrast, each party can share their public key, allowing anyone to send them messages that only they can decrypt with their private key. In the context of internet communication

In the TLS protocol, asymmetric encryption using the public/private key pairs is used to securely exchange random data from that is used to create shared **session keys**, which are then used by both parties to (symmetrically) encrypt and decrypt data for the remainder of the session. Since a session key is created with information shared using asymmetric encryption, and is used only for the duration of a session, TLS combines the best of both asymmetric encryption (the ability to establish an encrypted communication channel without having to have first securely shared a key) and symmetric encryption (computational efficiency).

The generation and management of session keys is fully automated within the TLS protocol. You do not ever need to provision or manage TLS session keys.
{{site.data.alerts.end}}

### Who certifies the certificate? (The Certificate Authority)

If you encrypt a message with a TLS public certificate, you know that only a holder of the matching private key will be able to decrypt it. And perhaps the holder of the public certificate identifies themself as your friend, your bank, your employer, or a government. But how do you know that the certificate was ever actually held by the party you want to reach, rather than an imposter?

This is solved via the notion of a **Certificate Authority.** When TLS key pairs are cryptographicall generated, they are 'signed' by another cryptographic key, known as a 'root certificate' or 'certificate authority certificate' (CA cert). The CA certificate is held by a party responsible for issuing key pairs.  The signed public key is known as the **public certificate**, and is the file that is actually shared with clients. Given that you can put your trust in the organization that backs the Certificate Authority who has signed a server's TLS public certificate, you can extend your trust that the operator of a website or service at a particular network domain or IP address is actually who they claim to be.

On the public internet, Certificate Authority providers such as Identrust, Digicert, and Let's Encrypt provide this service. Some large companies and other organizations maintain their own Certificate Authorities. Often, distributed systems such as K8s clusters, or (spoiler alert) CockroachDB clusters, may maintain their own Certificate Authority to allow their internal components to authenticate to one another.

## TLS in CockroachDB

TLS is used for authentication and encryption in all communication between CockroachDB nodes, and from clients to nodes.

### Communication between CockroachDB nodes

Connections between CockroachDB nodes, and from SQL clients and web consoles are always mutually TLS authenticated, meaning that both client and server must each have their own key pair.

#### CockroachDB Cloud

Customers using {{ site.data.products.db }} need not worry about managing TLS keys for CockroachDB nodes, as cluster management is delegated to the Cockroach Labs team.


#### CockroachDB Self-Hosted

Customers who deploy and manage their own CockroachDB clusters must provision and manage TLS certificates on each nodes. In order to communicate with other nodes and hence participate in the cluster, each CockroachDB node must have the following files (or a [valid alternative set]()):

- The node's private key, `node.key`
- The node's public certificate, `node.crt`
- The public CA certificate of the root Certifiate Authority, (which may be the cluster itself, if the root certificate was generated using the [`cockroach certs`]() CLI command), called `ca.crt`. A single root CA must have signed all of the node certificates (???!!!).

CockroachDB nodes make double use of their key-pairs, using them as client credentials when they initiate connections to other nodes, and as server credentials when recieving requests.

{{site.data.alerts.callout_info}}
To enable a CockroachDB client, these files (`node.key`, `node.crt`, and `ca.crt`) must be present in a single directory, the path to which must be supplied to the CockroachDB client with the argument `certs-dir`.

[Learn how to provision TLS certificates for a CockroachDB Cluster CockroachDB CLI command.](../cockroach-cert.html)
{{site.data.alerts.end}}

### Communication from a Cockroachdb SQL client to a CockroachDB node

CockroachDB provides a number of SQL clients, including a CLI, and several drivers and object-relational mapping (ORM) tools. For any of these, TLS configuration depends on whether the client is using TLS authentication or another method of authentication. In turn, which authentication methods are available depends on the sort of environment in which your CockroachDB cluster is deployed, as follow.

#### CockroachDB Cloud

{{ site.data.products.db }} currently does not support certificate-authenticated client requests. TLS is still used to authenticate the server and encrypt all traffic, but the user must authenticate to the database using another method (currently limited to username/password combination).

Because the server must still be TLS authenticated, the client must know to trust the certificate authority that signed the public certificate identifying the server. Therefore, the root CA certificate, called `ca.crt`, must be provided to client authentication attempts. For example, this is passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

#### Self-Hosted CockroachDB

{{ site.data.products.serverless }} clusters support TLS authentication for clients, as well as other methods such as username/password, and GSSAPI/Kerberos (Enterprise only).

CockroachDB supports fine-grained [configuration of its authentication behavior by user, method, and source IP address](authentication.html).

##### Non-TLS client authentication

When using a non-TLS client authentication method, such as username/password or GSSAPI/Kerberos (Enterprise only), the server must still be TLS authenticated. Therefore, the client must know to trust the certificate authority that signed the public certificate identifying the server. Therefore, the root CA certificate, called `ca.crt`, must be provided to client authentication attempts. This can be passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

##### TLS client authentication

For a SQL client to authenticate using TLS, that client must be provisioned with its own key-pair:

- `client.<username>.crt` is the client's public certificate.
- `client.<username>.key` is the client's private key.

`<username>` here corresponds to the username of the SQL user as which the client will issue SQL statements if authentication is successful.

These key files are used with the CockroachDB CLI by placing them in a directory and  `--certs-dir`

### Certificate Authority in CockroachDB

CockroachDB clusters can generate their own CA certificates, allowing them to act as their own Certificate Authorities for TLS connections between nodes and from SQL clients to nodes. Alternatively, an external CA (such as your organization's CA) can be used to generate your certificates. It is even possible to employ a ['split certificate'](../create-security-certificates-custom-ca.html#split-node-certificates) scenario, where one set of key pairs is used for authentication in inter-node connections, and another pair is used for authentication in connections originated from SQL clients.


Revokation!!!