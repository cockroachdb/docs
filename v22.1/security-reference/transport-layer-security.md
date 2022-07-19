---
title: Transport Layer Security (TLS) and Public Key Infrastructure (PKI)
summary: Overview of PKI and TLS and how to implement them with CockroachDB
toc: true
docs_area: reference.security
---

This page provides a conceptual overview of Transport Layer Security (TLS) and the related notion of Public Key Infrastructre (PKI), and sketches the security-architecture considerations in play when using CockroachDB.

See:

- [Managing CockroachDB security certificates with HashiCorp Vault](../manage-certs-vault.html)
- [Using the CockroachDB CLI to provision a development cluster](../manage-certs-cli.html)


## What is Transport Layer Security (TLS)?

Modern communication systems pose a general problem: How is it possible send data over a network connection to a specific receiving party, and guarantee that nobody else can eavesdrop on the message or tamper with the contents? For much of the internet and the systems that support it, the Transport Layer Security (TLS) protocol is part of the solution. TLS can be used to establish securely authenticated and encrypted traffic between a client (the party who initiates the session) and a server (the party receiving the connection request).

### Keys and key pairs

How is it possible to send a message that only a specific intended party can receive? 

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
- When the user must authenticate with another mechanism, such as a username/password combination or Single Sign-On (SSO).

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

This is a complex social and technological problem, and the primary solution used today by the internet as a whole, as well as organizations across the world, is mix of careful practices, social relationships, and digital technologies. It is what is known as Public Key Infrastructure (PKI).

At its core, PKI is a hierarchy of cryptographically backed trust relationships between the following categories of interested party:

- **Subscribers** wish to use the PKI to prove their identity to the world and offer secure services to others.
- **Relying parties** wish to connect with subscribers, secure in the their knownledge of the identity of the latter.
- **Certificate Authorities (CA)** are responsible for verifying the identity of subscribers (which can include subornidate certificate authorties).

### Certificates, signing, trust and authority

The core mechanism of PKI is a the PKI certificate, also known as a 'security certificate', 'digital certificate' or 'TLS certificate' (because it is used in TLS), or abbreviated "cert".

A PKI certificate is a file containing the following:

- A) A public key to be used for [key pair encryption, often including TLS](#what-is-transport-layer-security-tls).
- B) Some metadata about:
	- the party that allegedly holds the corresponding private key and who therefore is the only one capable of decrypting messages encrypted with **A**, most importantly at least one **name**, such as a domain name in a domain name registry system (DNS). The certifiate essentially functions as a badge or nametage, allowing the holder to claim to be the named party.
	- the party signing the certificate, and the certificate authority (if any) that signed its public certificate
- C) A list of actions the holder of the certificate is thereby authorized to perform.

On its own, such a digital certificate is of no more value than a paper certificate. Perhaps less value, as it can be neither scribbled upon nor burned. However, digital certificates have the advantage that they can be cryptographically **signed**, again using the mechanism of a public/private key pair.

**Signing** here means encrypting the certificate using a private key, so that it can be decrypted with a public key. So how does that help? This is the point where the boundaries between computing systems and social systems become very murky. By signing a certificate (and anyone with a private key can do this) a party is acting as a "certificate authority"; they are in effect asserting the validity of the identity claim being made by the certificate holder.

The premise of PKI is that if I present you with a certificate, and you can decrypt it with, for example, Cockroach Labs' public certificate, and the decrypted version says that I work for the Cockroach Labs documentation team, essentially you may interpret that Cockroach Labs offers its guarantee that I work for the documentation team (or at least, I did when the certificate was signed).

<img src="{{ 'images/v22.1/pki_signing.png' | relative_url }}" alt="signing, trust and authentication in PKI" style="max-width:60%" />

Figure 1. Cryptographic signing of PKI public certificates.

<img src="{{ 'images/v22.1/pki_auth.png' | relative_url }}" alt="signing, trust and authentication in PKI" style="max-width:60%" />

Figure 2. Checking the issuer's public certificate to validate the PKI trust chain of a public certificate

Generally, given that you can put your trust in the organization that backs the Certificate Authority who has signed a server's public certificate, you can extend your trust that the holder of the private key corresponding to that certificate is who the certificate says they are. For example, this is how your web browser or mobile app knows that it's actually talking to your bank, rather than an imposter. Furthermore, one Certificate Authority may grant certify that another party is authorized to issue certificates on its behalf, acting as a **subordinate CA**.

### Public and private PKIs

On the public internet, certificate authority providers such as Identrust, Digicert, and Let's Encrypt provide the role of root CAs (or "trust anchors") to the entire system. What makes them "trust-worthy"? In practice, just the fact that they are **trusted** by the parties that distribute hardware and software (such as operating system distributions and browsers) packages that come pre-loaded with **trust stores**.

### Trust store
A **trust store** is a collection of public certificates for trusted CAs&mdash;CAs whos signed certificates will be accepted for purposes of identity verification. By using a hardware device or software package that comes loaded with a trust store, you are trusting the judgment of the company selected the CAs to add to the package's trust store.

It is up to the vendors (e.g. Apple, Google, Microsoft) to decide which root CAs to include in their packages' trust stores, and then ultimately up to the end user to decide which vendors to trust. CAs must comply with formalized industry standard [baseline requirements](https://cabforum.org/baseline-requirements-documents/) to maintain good standing with vendors.

Internally, organizations must must maintain their own trust architectures, deciding what parties (individual persons), should have access to what network, computing, data, financial, and physical resources, and using certificates or other means to authenticate identity and establish encryption. Certificates and TLS are powerful tools, but only provide security when deployed properly, and in particular when access to the CAs and to the cluster itself are carefully protected according to the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).

### Revoking trust

In this dynamic world, nothing lasts for ever. Employment and business relationships change, computing systems are deployed and destroyed, and even the most carefully hidden passwords and private keys may be accidentally leaked or intentionally stolen. For all of these reasons, in order to maintain its trustworthiness, a certificate authority (CA) must be able to revoke guarantees it has issued in the form of signed certificates when those guarantees no longer hold.

The main solutions to this problem are:

- Issuing only **short-lived certificates**, which are effectively revoked by discontinuing their rotation.
- **Certificate Revocation Lists (CRLs)** allow relying parties to check if a subscriber's certificate has been revoked.
- The **Online Certificate Revocation Protocol (OCSP)** allows relying parties to check the status of certificates in real time.

Each strategy has pros and cons in terms of security and operational overhead. CockroachDB does not support CRLs. 

See [Revoking Certificates in CockroachDB](#revoking-certificates-in-cockroachdb).

## PKI in CockroachDB

In a CockroachDB cluster, each node must be able to initiate http requests to any of the others. In a normal operating mode, these requests are be TLS encrypted with mutual authentication, requiring that each node present its own certificate, signed by the same CA.

In addition, SQL clients and DB Console clients must be able to reach the nodes. The client must authenticate the server with a certificate signed by a trusted CA, and the server mustu authenticate the client, either with its own certificate, or with another method, such as username/password.

Therefore, the nodes must each have a private key/public certificate pair where the public certificates have been signed by a common CA (called the **node CA** here).

If the client is to use mutual authentication, as illustrated here, the client must have a private key/public certificate pair, where the public certificate is signed by a CA trusted by the nodes, i.e. the CA's public certificate must be in the nodes' trust stores.

<img src="{{ 'images/v22.1/certs_signing.png' | relative_url }}" alt="certificate signing relationships diagram" style="max-width:60%" />

Figure 3. Relationships between private keys and public certificates in a typical PKI architecture for a CockroachDB Cluster.

<img src="{{ 'images/v22.1/certs_requests.png' | relative_url }}" alt="certificate signing relationships diagram" style="max-width:60%" />

Figure 4. Certificate authentication Relationships between private keys and public certificates in an example PKI architecture for a CockroachDB Cluster.

## CockroachDB's TLS support and operating modes

TLS encryption and server authentication are supported in all communication between CockroachDB nodes, and from clients to nodes.

Currently, mutual TLS authentication, in which the client as well as the server uses a private key/public certificate pair to authenticate itself, is not supported in {{ site.data.products.db }}. Clients must use username/password combinations.

{{ site.data.products.core }} does supports TLS authentication for clients.

### Default mode 

By default, CockroachDB clusters require TLS. Client connection requests must made with `sslmode=on`.
The CockroachDB CLI `cockroach sql` command, by default, is made with `sslmode=on`.

Clients always require a public certificate for the CA that issued the server certificate.

If the connection is mutually TLS authenticated (i.e., if the client authentication method is certificate rather than username/password combination), then a private key/public certificate pair for the client is also required.

### `--accept-sql-without-tls` mode

CockroachDB clusters can be started with this option in order to allow clients to opt out of TLS server authentication.

Client connections can be made with `sslmode=on`, in which case TLS authentication proceeds as in default mode.
Client connections can also be made `sslmode=off` (or by using `cockroach sql --insecure` on the CLI), in which case TLS authentication is skipped.

Regardless of whether TLS authentication is performed or skipped, TLS encryption is still used for all traffic.

### `--insecure` mode

CockroachDB can be operated entirely without TLS. If a CockroachDB cluster is started with the `--insecure` flag, all TLS encryption and authentication is skipped.

**This can be useful to quickly deploy a short-lived local cluster for testing and hands on experimentation, but is unsuitable for long-lived deployments.**

Note that client connections must also be made insecurely, or the connection request will fail. Do this by using `cockroach sql --insecure` on the CLI, or by setting `sslmode=off` in the database connection string.

## The CockroachDB certificate Trust Store

A node's [**trust store**](#public-and-private-pkis) is the set of public CA certificates contained in its `certs` directory. The node will accept all valid certificates signed by the CA or any CA subordinate to it, for any CA whose public certificate is in the trust store. CockroachDB ignores operating system certificate trust stores.

## TLS between CockroachDB nodes

Connections between CockroachDB nodes are always mutually TLS authenticated. Each node must have at least one TLS key pair, which it can use both as server and as client when initiating internode traffic.

### CockroachDB Cloud

Customers using {{ site.data.products.db }} need not worry about managing TLS keys for CockroachDB nodes, as cluster management is delegated to the Cockroach Labs team.

### CockroachDB Self-Hosted

{{site.data.alerts.callout_info}}
Customers who deploy and manage their own CockroachDB clusters must provision and manage certificates on each nodes, implementing their own PKI security. This entails ensuring that credentials are carefully controlled, monitoring for signs of compromise and mitigating the impact of potential credential leaks. Authorization for issuing credentials is particularly critical, and this includes issuing private key/public certificate pairs for CockroachDB nodes or clients. Unmitigated compromise of either of these can have devastating business impact.

Choosing a strategy for maintaining solid private PKI is important and complex, and depends on your total system requirements, total security threat model, and available resources.

- Learn about [Managing CockroachDB security certificates with HashiCorp Vault](manage-certs-vault.html).
- Review our [breakdown of security features by offering](security-overview.html).
- Contact our <a href="mailto:sales@cockroachlabs.com">sales team</a> to discuss your needs and the range of solutions offered by Cockroach Labs.
{{site.data.alerts.end}}

By default, a CockroachDB node makes double use of a single key pair, using it to authenticate both as client when initiating a connection to another node, and as server when recieving requests.

The node must also have a trust store containing the public certificate of at least one trusted CA&mdash;the one that issued the public certificates of any nodes it must connect with.

## TLS in CockroachDB SQL client connections

CockroachDB provides a number of SQL clients, including a [CLI](../cockroach-sql.html#start-a-sql-shell), and a number of [drivers and object-relational mapping (ORM) tools](../install-client-drivers.html). Regardless of which client you are using, how you are able to authenticate to a CockroachDB cluster depends on that cluster's [authentication configuration](authentication.html), specifically whether that configuration requires the user to authenticate with username/password combination, certificate or another method.

In turn, which authentication methods are available depends on the sort of environment in which a CockroachDB cluster is deployed, as described in the following.

### CockroachDB Cloud

{{ site.data.products.db }} currently does not support certificate-authenticated client requests. TLS is still used to authenticate the server and encrypt all traffic, but the user must authenticate to the database with a username/password combination.

Because the server must still be TLS authenticated, the client must know to trust the certificate authority that signed the public certificate identifying the server. The path to the CA's public certificate is passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

### Self-Hosted CockroachDB

{{site.data.alerts.callout_info}}
Customers who deploy and manage their own CockroachDB clusters must provision and manage certificates on each nodes, implementing their own PKI security. This entails ensuring that credentials are carefully controlled, monitoring for signs of compromise and mitigating the impact of potential credential leaks. Authorization for issuing credentials is particularly critical, and this includes issuing private key/public certificate pairs for CockroachDB nodes or clients. Unmitigated compromise of either of these can have devastating business impact.

Choosing a strategy for maintaining solid private PKI is important and complex, and depends on your total system requirements, total security threat model, and available resources.

- Learn more: [Managing CockroachDB security certificates with HashiCorp Vault](manage-certs-vault.html).
- Review our [breakdown of security features by offering](security-overview.html).
- Contact our <a href="mailto:sales@cockroachlabs.com">sales team</a> to discuss your needs and the range of solutions offered by Cockroach Labs.
{{site.data.alerts.end}}

{{ site.data.products.core }} clusters support TLS authentication for clients, i.e. mutual TLS authentication. Other supported authentication methods are username/password combination, and GSSAPI/Kerberos (Enterprise only).

#### Non-TLS client authentication

When using a non-TLS client authentication method, such as username/password or GSSAPI/Kerberos (Enterprise only), the server must still be TLS authenticated. Therefore, the client must know to trust the certificate authority that signed the public certificate identifying the server. Therefore, the root CA certificate, called `ca.crt`, must be provided to client authentication attempts. This can be passed as the `sslrootcert` parameter in a [database connecton string](../connect-to-the-database.html), or by being placed in the directory specified by the `certs-dir` argument in a connection made with the [`cockroach sql`](../cockroach-sql.html) CLI command.

#### TLS client authentication

For a SQL client to authenticate using TLS, that client must be provisioned with its own key-pair:

- `client.<username>.crt` is the client's public certificate.
- `client.<username>.key` is the client's private key.

`<username>` here corresponds to the username of the SQL user as which the client will issue SQL statements if authentication is successful.

These key files are used with the CockroachDB CLI by placing them in a directory and  `--certs-dir`

## Revoking Certificates in CockroachDB

### CockroachDB Cloud

Customers of {{ site.data.products.db }} delegate responsibility for maintaining cluster internal PKI to the Cockroach Labs team, and need not worry about securing authentication and encryption between cluster nodes.

{{ site.data.products.db }} clusters do not support certificate based client authentication, but rely instead on username/password combination.

### CockroachDB Self-Hosted 

CockroachDB does not support certificate revocation lists (CRLs). The remaining options are the Online Certificate Status Protocol (OCSP), and reliance on a rapid cycle of generating and propagating short-lived certificates.

#### OCSP 

Securely operating an OCSP responder is a significant task, and it would not be recommended to undertake this solely for the purposes of securing a CockroachDB cluster.

CockroachDB can be [configured to check an OCSP responder](../manage-certs-revoke-ocsp.html).

#### Short-lived certificates

For many self-hosted customers, we recommend a strategy of relying on a short "lifetime", i.e., validity duration, for credentials (private key/public certificate pairs) issued to CRDB nodes and SQL clients. This strategy is relatively easy to implement in an automated pipeline using cloud native secrets management tools such as GCP secrets manager or Hashicorp Vault to securely propagate certificates, and synergizes with the use of cloud native CA tools, such as GCP's Certficiate Authority Service (CAS). Using these tools, an operator can create an automation pipeline to generate and propagate certificates.

By relying on certficiates with a short validity duration, we can greatly reduce the threat posed by such a certificate being leaked, since the certificate's value to an attacker is limited by its validity duration.
To maintain connection to a network secured by short-lived credentials, a would-be-attacker must maintain access to the secret manager used to propagate the credentials. This consolidates the risk surface of the certificate itself into the shadow of access to the secrets manager.

The trade-off with short-lived certificates (or requiring any low-latency revocation system), is that it can become a single point of failure for service availability. If network connections depend on hourly propagation of fresh credentials, then a leaked credential only offers an attacker a one hour window of exploitation, but taking the credential automation offline for more than an hour can take the entire system offline. Fine tuning the validity duration to meet your threat model and available resources is an important component of designing a minimally secure private PKI without using another revocation mechanism.

See: [Managing security certificates with HashiCorp Vault](../manage-certs-vault.html)