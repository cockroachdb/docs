---
title: Transport Layer Security (TLS) in CockroachDB
summary: Overview of Transport Layer Security (TLS) in CockroachDB
toc: true
docs_area: reference.security
---

This pages provides a conceptual overview of Transport Layer Security (TLS) and details its role in securing cluster traffic in CockroachDB.

## What is TLS?

Transport Layer Security (TLS) is a protocol used to establish securely authenticated and encrypted traffic between a client (the party who initiates the session) and a server (the party receiving the connection request).

### Key pairs

The fundamental mechanism of TLS is a mathematically pair of cryptographic keys (usually referred to as a 'key pair' for short):

- The **private key** is randomly generated.
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

Symmetric encryption is more efficient and straightforward, but it requires all parties to have the single key, unlike in assymetric encryption, where everyone can share their public key, allowing anyone to send them messages that only they can decrypt with their private key.

In the TLS protocol, asymmetric encryption using the public/private key pairs is used to securely exchange random data from that is used to create **session keys**, which are then used by both parties to symmetrically encrypt data for the remainder of the session. This is more computationally efficient that continuing to use asymmetric encryption for message exchange.

The generation and management of session keys is fully automated within the TLS protocol. You do not ever need to provision or TLS manage session keys.
{{site.data.alerts.end}}

### Who certifies the certificate? (The Certificate Authority)

If you encrypt a message with a TLS public certificate, you know that only a holder of the matching private key will be able to decrypt it. And perhaps the holder of the public certificate identifies themself as your friend, your bank, your employer, or the government. But how do you know that the certificate was ever actually held by the party you want to reach, rather than an imposter?

This is solved via the notion of a **Certificate Authority.** When TLS key pairs are cryptographicall generated, they are 'signed' by another cryptographic key, known as a 'root certificate' or 'certificate authority certificate' (CA cert). The CA certificate is held by a party responsible for issuing key pairs.  The signed public key is known as the **public certificate**, and is the file that is actually shared with clients. Given that you can put your trust in the organization that backs the Certificate Authority who has signed a server's TLS public certificate, you can extend your trust that the operator of a website or service at a particular network domain or IP address is actually who they claim to be.

On the public internet, Certificate Authority providers such as Identrust, Digicert, and Let's Encrypt provide this service. Some large companies and other organizations maintain their own Certificate Authorities. Often, distributed systems such as K8s clusters, or (spoiler alert) CockroachDB clusters, may maintain their own Certificate Authority to allow their internal components to authenticate to one another.

## TLS in CockroachDB


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

### Communication Cockroachdb SQL client to CockroachDB node

CockroachDB provides a number of SQL clients including a CLI, and several drivers and object-relational mapping (ORM) tools.

Connections from any of these SQL clients can be either one-sidedly or mutually authenticated.

All secure communication must involve TLS authentication of the server (i.e., the CockroachDB node); therefore, your client must have access to the *public certificate*

#### CockroachDB Cloud

{{ site.data.products.db }} currently does not support certificate-authenticated client requests, as required for mutually authenticated TLS, and client requests can only be authenticated with username/password.

must have public cert of ca

#### Self-Hosted CockroachDB

TLS connections to nodes in Cockroach-DB Self-Hosted clusters may be either mutually or one-way authenticated, as determined by your [Authentication Configuration](!!!)

##### To support one way-authentication:

just have the thingy

Clients must have access to a copy of the public cert of the ca authority, so ...

##### To support mutual authentication:

 Therefore, a client must be provisioned with a key-pair:

- `client.<username>.crt`
- `client.<username>.key`

`<username>` here corresponds to the username of the SQL user as which the client will issue SQL statements if authentication is successful.

These key files are used with the CockroachDB CLI by placing them in a directory and  `--certs-dir`

### Certificate Authority in CockroachDB

CockroachDB clusters can generate their own CA certificates, allowing them to act as their own Certificate Authorities for TLS connections between nodes and from SQL clients to nodes. Alternatively, an external CA (such as your organization's CA) can be used to generate your certificates. It is even possible to employ a ['split certificate'](../create-security-certificates-custom-ca.html#split-node-certificates) scenario, where one set of key pairs is used for authentication in inter-node connections, and another pair is used for authentication in connections originated from SQL clients.


Revokation!!!