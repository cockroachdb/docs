---
title: Public Key Infrastructure (PKI) and Transport Layer Security (TLS)
summary: Overview of PKI and TLS and how to implement them with CockroachDB
toc: true
docs_area: reference.security
---

This page provides a conceptual overview of Public Key Infrastructre (PKI) and Transport Layer Security (TLS), and details how to implement these critical dimensions of security using CockroachDB.

## What is Transport Layer Security (TLS)?

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

### Mutual vs one-sided TLS authentication

TLS connections can be either *one-sided*, meaning that only one party must prove its identity before an encrypted session is established, or *two-sided* (or *mutual*), meaning that both must prove their identities.

In mutually authenticated TLS connections, each party must have a key pair issued by a jointly trusted CA. This is a good system for internal components within a distributed system, and generally works well for long-lived clients.

In one-sided TLS authentication, only the server must have a key pair; the user may be able to access information without any authentication. This works well when:
- The client needs no authentication, for example, for a public read-only website or API.
- When the user must authenticate to the application being served with another mechanism, such as a username/password combination or a Single Sign-On (SSO)  or by logging in to an application with a username/password combination once TLS-encrypted communication is already established.

### Symmetric and asymmetric encryption in TLS

Encryption using a key pair is "asymmetric", in that a different key is used to encrypt and decrypt. Encryption is called "symmetric" where the same key is used to encrypt and decrypt&mdash;as the metal key in a mechanical lock-and-key system is used to both lock and unlock.

Symmetric encryption is more efficient than asymmetric encryiption, but it requires all parties to have the single key shared key prior to the exchange.

With asymmetric encryption, by contrast, each party can share their public key, allowing anyone to send them messages that only they can decrypt with their private key. In the context of internet communication

In the TLS protocol, asymmetric encryption using the public/private key pairs is used to securely exchange random data from that is used to create shared **session keys**, which are then used by both parties to (symmetrically) encrypt and decrypt data for the remainder of the session. Since a session key is created with information shared using asymmetric encryption, and is used only for the duration of a session, TLS combines the best of both asymmetric encryption (the ability to establish an encrypted communication channel without having to have first securely shared a key) and symmetric encryption (computational efficiency).

{{site.data.alerts.callout_info}}
The generation and management of session keys is fully automated within the TLS protocol. You do not ever need to provision or manage TLS session keys.
{{site.data.alerts.end}}


## Public Key Infrastructure (PKI)

Encryption is powerful and important, but without identity authentication, it's not very useful: if you don't know who is sending you messages in first place, it's small comfort that nobody *else* is tampering with the contents or eavesdropping on the conversation.

If you encrypt a  message with a TLS public key, you know that only a holder of the matching private key will be able to decrypt it. And perhaps the holder of the public certificate identifies themself as your friend, your bank, your employer, or a government. But how can you trust that the certificate was ever actually held by the party you want to reach, rather than an imposter?

This problem is solved with the mechanism of a **public key infrastructure (PKI) certficate**, and the broader notion of PKI, which will be explained in what follows.

### PKI certificates

A PKI certificate (often abbreviated "cert") is a document containing the following:

- A) A public key to be used for [TLS encryption](#what-is-transport-layer-security-tls).
- B) Some metadata about the party that allegedly holds the corresponding private key and who therefore is the only one capable of decrypting messages encrypted with **A**, most importantly at least one **name**, such as a domain name in a domain name registry system (DNS). The certifiate essentially functions as a badge or nametage, allowing the holder to claim to be the named party.
- C) A list of actions the holder of the certificate is thereby authorized to perform.

On its own, such a digital certificate is of no more value than a paper certificate. Indeed, less value, as it can be neither scribbled upon nor burned.

However, digital certificates have the advantage that they can be cryptographically **signed**, again using the mechanism of a public/private key pair.

This is solved via the notion of a **Certificate Authority.** 

A TLS public key 

When TLS key pairs are cryptographicall generated, they are 'signed' by another cryptographic key, known as a 'root certificate' or 'certificate authority certificate' (CA cert). The CA certificate is held by a party responsible for issuing key pairs.  The signed public key is known as the **public certificate**, and is the file that is actually shared with clients. Given that you can put your trust in the organization that backs the Certificate Authority who has signed a server's TLS public certificate, you can extend your trust that the operator of a website or service at a particular network domain or IP address is actually who they claim to be.

### Trust hierarchies

A "tree" or hierarchy of cryptographic signatures, when such delegated trust relationships and its use together with key pair cryptography in establishing secure identity authentication and encrypted communication, is what's known as **Public Key Infrastructure (PKI)**. PKI is a critical supporting component of the World Wide Web and our global computing ecosystem more broadly.

On the public internet, Certificate Authority providers such as Identrust, Digicert, and Let's Encrypt provide the role of trust anchors to the entire system.... yada yada

What makes them "trust-worthy" or "legit"? In practice, just the fact that they are **trusted** by the parties that distribute trust stores along with hardware and software components such as browsers, operating system distributions and laptop and mobile devices.

Large organizations often maintain their own internal, private PKI, anchored by their own Certificate Authorities.... yada yada

Distributed systems such as K8s clusters, or (spoiler alert) CockroachDB clusters, may maintain their own internal Certificate Authority to allow their internal components to authenticate to one another. However, for users to trust the security of their connection to computing or data resources, they must be able to securely identify it. So, for any database or other application to be truly useful to remote users across the internet, it must be integrated into the internet's PKI. This means it must ultimately belong to a trust anchored by a broadly accepted certificate authority.

## TLS in CockroachDB

TLS authentication and encryption is supported in all communication between CockroachDB nodes, and from clients to nodes.

### SSL modes

#### Disabling TLS

CockroachDB can be operated entirely without TLS. This can be useful to quickly deploy a short-lived cluster for testing and hands on experimentation, but is entirely unsuitable for production usage.

To run a CockroachDB cluster without TLS, add the `--insecure` flag to the [`cockroach run`]() command.

`--accept-sql-without-tlc` what is the deal? Send that note in the eng channel !!!

[SSL modes](#ssl-mode-settings)


### Communication between nodes

Connections between CockroachDB nodes are always mutually TLS authenticated. Each node must have at least one TLS key pair, as described in the following.

#### CockroachDB Cloud

Customers using {{ site.data.products.db }} need not worry about managing TLS keys for CockroachDB nodes, as cluster management is delegated to the Cockroach Labs team.


#### CockroachDB Self-Hosted

Customers who deploy and manage their own CockroachDB clusters must provision and manage TLS certificates on each nodes. The CockroachDB CLI makes this easy; all required keys and certificates can be generated with the [`cockroach cert`](../cockroach-cert.html) command.

By default, CockroachDB nodes make double use of their key-pairs, using them as client credentials when they initiate connections to other nodes, and as server credentials when recieving requests.

In this case, each CockroachDB node must have the following files:

- The node's private key, `node.key`
- The node's public certificate, `node.crt`
- The public CA certificate of the root Certificate Authority, (which may be the cluster itself), called `ca.crt`.

{{site.data.alerts.callout_info}}
To enable a CockroachDB client, the required files (`node.key`, `node.crt`, and `ca.crt`) must be present in a single directory, the path to which must be supplied to the CockroachDB client with the argument `certs-dir`.
{{site.data.alerts.end}}


More complex scenarios with external CAs are described [here.](authentication.html#using-a-custom-ca)

### Communication from a SQL client to a node

CockroachDB provides a number of SQL clients, including a CLI, and several drivers and object-relational mapping (ORM) tools. Regardless of which client you are using, how you are able to authenticate to a CockroachDB cluster depends on that cluster's [authentication configuration](authentication.html), specifically whether that configuration requires the user to authenticate with TLS or another method.

In turn, which authentication methods are available depends on the sort of environment in which a CockroachDB cluster is deployed, as described in the following.

Try it out:
- [Connect with the CockroachDB CLI's `cockroach sql` command.](../cockroach-sql.html#start-a-sql-shell)
- [Connect with a software driver or ORM.](../install-client-drivers.html)

#### CockroachDB Cloud

{{ site.data.products.db }} currently does not support certificate-authenticated client requests. TLS is still used to authenticate the server and encrypt all traffic, but the user must authenticate to the database using another method (currently limited to username/password combination).

Because the server must still be TLS authenticated, the client must know to trust the certificate authority that signed the public certificate identifying the server. Therefore, the root CA certificate, called `ca.crt`, must be provided to client authentication attempts. For example, this is passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

#### Self-Hosted CockroachDB

{{ site.data.products.serverless }} clusters support TLS authentication for clients. Other supported methods are username/password combination, and GSSAPI/Kerberos (Enterprise only).

##### Non-TLS client authentication

When using a non-TLS client authentication method, such as username/password or GSSAPI/Kerberos (Enterprise only), the server must still be TLS authenticated. Therefore, the client must know to trust the certificate authority that signed the public certificate identifying the server. Therefore, the root CA certificate, called `ca.crt`, must be provided to client authentication attempts. This can be passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

##### TLS client authentication

For a SQL client to authenticate using TLS, that client must be provisioned with its own key-pair:

- `client.<username>.crt` is the client's public certificate.
- `client.<username>.key` is the client's private key.

`<username>` here corresponds to the username of the SQL user as which the client will issue SQL statements if authentication is successful.

These key files are used with the CockroachDB CLI by placing them in a directory and  `--certs-dir`

### Certificate Authority in CockroachDB

A CockroachDB may act as its own Certificate Authority.

CockroachDB clusters can generate their own CA certificates, allowing them to act as their own Certificate Authorities for TLS connections between nodes and from SQL clients to nodes.

Alternatively, an external CA (such as your organization's CA) can be used to generate your certificates. It is even possible to employ a ['split certificate'](../create-security-certificates-custom-ca.html#split-node-certificates) scenario, where one set of key pairs is used for authentication in inter-node connections, and another pair is used for authentication in connections originated from SQL clients.

## Revoking of Certificates

some things 
- blah blah blah
- blah

~~~shell
 e = mc^2
~~~

## Maintaining PKI

google cloud thingy make an intermediary, make server and client certs.

