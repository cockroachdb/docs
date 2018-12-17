---
title: Overview of CockroachDB security
summary: Learn about the authentication, encryption, authorization, and audit log features for secure CockroachDB clusters.
toc: true
---

An insecure CockroachDB cluster comes with serious risks:

- Your cluster is open to any client that can access any node's IP addresses.
- Any user, even `root`, can log in without providing a password.
- Any user, connecting as `root`, can read or write any data in your cluster.
- There is no network encryption or authentication, and thus no confidentiality.

To avoid these security risks, CockroachDB provides authentication, encryption, authorization, and audit logging features to deploy secure clusters. Before we deep-dive into how these features work, let's discuss why we need each of these features:

It all starts with the desire for two parties to communicate securely over an insecure computer network. A conventional solution to ensure secure communication is **symmetric encryption** that involves encrypting and decrypting a plaintext message using a shared key. This seems like the logical solution until you realize that you need a secure communication channel to share the encryption key. This is a Catch-22 situation: How do you establish a secure channel to share the encryption key?

An elegant solution to this problem is to use **Public Key Cryptography (PKI)** (also called **asymmetric encryption**) to establish a secure communication channel, and then sharing the symmetric encryption key over the secure channel.

Asymmetric encryption involves a pair of keys instead of a single key. The two keys are called the **public key** and the **private key**. The keys consist of very long numbers linked mathematically in a way such that a message encrypted using a public key can only be decrypted using the private key and vice versa. The message cannot be decrypted using the same key that was used to encrypt the message.

CockroachDB uses the [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) security protocol that takes advantage of both symmetric as well as asymmetric encryption. The TLS 1.2 protocol uses asymmetric encryption to establish a secure channel as well as **authenticate** the communicating parties. It then uses symmetric encryption to protect data in flight.

However, it's not enough to protect data in flight; you also need to protect data at rest. That's where CockroachDB's **Encryption at Rest** feature comes into the picture. Encryption at Rest is an enterprise feature that allows encryption of all files on disk using [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [counter mode](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Counter_(CTR)), with all key
sizes allowed.

Along with authentication and encryption, we also need to allow CockroachDB to restrict access to **authorized** clients (or nodes acting as clients). CockroachDB allows you to create, manage, and remove your cluster's [users](#create-and-manage-users) and assign SQL-level [privileges](#assign-privileges) to the users. Additionally, if you have an [Enterprise license](get-started-with-enterprise-trial.html), you can use [role-based access management (RBAC)](#create-and-manage-roles) for simplified user management.

Finally, CockroachDB's **SQL audit logging** gives you detailed information about queries being executed against your system. This feature is especially useful when you want to log all queries that are run against a table containing personally identifiable information (PII).

The following section summarizes the CockroachDB security features and provides links to detailed documentation for each feature.

## Security features in CockroachDB

Security feature | Description
-------------|------------
[Authentication](authentication.html) | <ul><li>Inter-node and node identity authentication using TLS 1.2</li><li>Client identity authentication using TLS 1.2 or username/password</li></ul>
[Encryption](encryption.html) | <ul><li>Encryption in flight using TLS 1.2</li><li> Encryption at Rest using AES in counter mode (Enterprise feature)</li></ul>
[Authorization](authorization.html) | <ul><li>Users and privileges</li><li> Role-based access control (Enterprise feature)</li></ul>
[Audit logging](sql-audit-logging.html) | `ALTER TABLE...EXPERIMENTAL AUDIT` to get detailed information about queries being executed against your system

## How security features work

As mentioned above, CockroachDB uses the [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) security protocol that takes advantage of both symmetric (to encrypt data in flight) as well as asymmetric encryption (to establish a secure channel as well as **authenticate** the communicating parties).

Authentication refers to the act of verifying the identity of the other party in communication. CockroachDB uses TLS 1.2 digital certificates for inter-node and client-node authentication, which require a Certificate Authority (CA) as well as keys and certificates for nodes, clients, and (optionally) the Admin UI.

To understand how CockroachDB uses digital certificates, let's first understand what each of these terms means.

Consider two people: Amy and Rosa, who want to communicate securely over an insecure computer network. The traditional solution is to use symmetric encryption that involves encrypting and decrypting a plaintext message using a shared key. Amy encrypts her message using the key and sends the encrypted message across the insecure channel. Rosa decrypts the message using the same key and reads the message. This seems like a logical solution until you realize that you need a secure communication channel to send the encryption key.

To solve this problem, cryptographers came up **asymmetric encryption** to set up a secure communication channel over which an  encryption key can be shared.

### Asymmetric encryption

Asymmetric encryption involves a pair of keys instead of a single key. The two keys are called the **public key** and the **private key**. The keys consist of very long numbers linked mathematically in a way such that a message encrypted using a public key can only be decrypted using the private key and vice versa. The message cannot be decrypted using the same key that was used to encrypt the message.

So going back to our example, Amy and Rosa both have their own public-private key pairs. They keep their private keys safe with themselves and publicly distribute their public keys. Now when Amy wants to send a message to Rosa, she requests Rosa's public key, encrypts the message using Rosa’s public key, and sends the encrypted message. Rosa uses her own private key to decrypt the message.

But what if a malicious imposter intercepts the communication? The imposter might pose as Rosa and send their public key instead of Rosa’s. There's no way for Amy to know that the public key she received isn’t Rosa’s, so she would end up using the imposter's public key to encrypt the message and send it to the imposter. The imposter can use their own private key and decrypt and read the message, thus compromising the secure communication channel between Amy and Rosa.

To prevent this security risk, Amy needs to be sure that the public key she received was indeed Rosa’s. That’s where the Certificate Authority (CA) comes into the picture.

### Certificate authority

Certificate authorities are established entities with their own public and private key pairs. They act as a root of trust and verify the identities of the communicating parties and validate their public keys. CAs can be public and paid entities (e.g., GeoTrust and Comodo), or public and free CAs (e.g., Let’s Encrypt), or your own organizational CA (e.g., CockroachDB CA). The CAs' public keys are typically widely distributed (e.g., your browser comes preloaded with certs from popular CAs like DigiCert, GeoTrust, and so on).

Think of the CA as the passport authority of a country. When you want to get your passport as your identity proof, you submit an application to your country's passport authority. The application contains important identifying information about you: your name, address, nationality, date of birth, and so on. The passport authority verifies the information they received and validates your identity. They then issue a document - the passport - that can be presented anywhere in the world to verify your identity. For example, the TSA agent at the airport does not know you and has no reason to trust you are who you say you are. However, they trust the passport authority and thus accept your identity as presented on your passport because it has been verified and issued by the passport authority.

Going back to our example and assuming that we trust the CA, Rosa needs to get her public key verified by the CA. She sends a CSR (Certificate Signing Request) to the CA that contains her public key and relevant identifying information. The CA will verify that it is indeed Rosa’s public key and information, _sign_ the CSR using the CA's own private key, and generate a digital document called the **digital certificate**. In our passport analogy, this is Rosa's passport containing verified identifying information about her and trusted by everyone who trusts the CA. The next time Rosa wants to establish her identity, she will present her digital certificate.

### Digital certificate

A public key is shared using a digital certificate signed by a CA using the CA's private key. The digital certificate contains:

-   The certificate owner’s public key    
-   Information about the certificate owner
-   The CA's digital signature

### Digital Signature

The CA's digital signature works as follows: The certificate contents are put through a mathematical function to create a **hash value**. This hash value if encrypted using the CA's private key to generate the **digital signature**. The digital signature is added to the digital certificate. In our example, the CA adds their digital signature to Rosa's certificate validating her identity and her public key.

As discussed [earlier](#certificate-authority), the CA's public key is widely distributed. In our example, Amy already has the CA's public key. Now when Rosa presents her digital certificate containing her public key, Amy uses the CA's public key to decrypt the digital signature on Rosa's certificate and gets the hash value encoded in the digital signature. Amy also generates the hash value for the certificate on her own. If the hash values match, then Amy can be sure that the certificate and hence the public key it contains indeed belongs to Rosa; else she can determine that the communication channel has been compromised and refuse further contact.

### How it all works together

Let's see how the digital certificate is used in client-server communication: The client (e.g., a web browser) has the CA certificate (containing the CA's public key). When the client receives a server's certificate signed by the same CA, it can use the CA certificate to verify the server's certificate, thus validating the server's identity, and securely connect to the server. The important thing here is that the client needs to have the CA certificate. If you use your own organizational CA instead of a publicly established CA, you need to make sure you distribute the CA certificate to all the clients.

### TLS certificates

CockroachDB uses TLS 1.2 server and client certificates. The TLS server certificates have the following requirements:

1. The hostname or address (IP address or DNS name) used to reach a node, either directly or through a load balancer, must be listed in the **Common Name** or **Subject Alternative Names** fields of the certificate.
2. The certificate must be signed by a trusted certificate authority.

The TLS client certificates are used to authenticate the client connecting to a server. Because most client certificates authenticate a user instead of a device, the certificates contain usernames instead of hostnames. This makes it difficult for public CAs to verify the client's identity and hence most public CAs will not sign a client certificate. In that case, you might need to set up your own internal CA to issue client certificates.
