---
title: Authentication
summary: Learn about the authentication features for secure CockroachDB clusters.
toc: true
---

This document presents a conceptual overview of public key cryptography and digital certificates and then proceeds to discuss how CockroachDB uses digital certificates. If you want to know how to create CockroachDB security certificates, see [Create Security Certificates](create-security-certificates.html).

Authentication means verifying the identity of the other party in communication. CockroachDB uses [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) digital certificates for inter-node and client-node authentication, which require a Certificate Authority (CA) as well as keys and certificates for nodes, clients, and (optionally) the Admin UI.

To understand how CockroachDB uses digital certificates, let's first understand what each of these terms means:

## How public key cryptography works

It all starts with the desire for two parties to communicate securely over an insecure computer network.

Consider two people: Amy and Rosa, who want to communicate securely over an insecure computer network. The traditional solution is to use symmetric encryption that involves encrypting and decrypting a plaintext message using a shared key. Amy encrypts her message using the key and sends the encrypted message across the insecure channel. Rosa decrypts the message using the same key and reads the message. They have thus established secure communication.

This seems like a logical solution until you realize that you need a secure communication channel to send the encryption key. This is a Catch-22 situation: How do you establish a secure channel to share the security key?

To solve this problem, cryptographers came up with an elegant alternative: asymmetric encryption.

### Asymmetric encryption

Asymmetric encryption involves a pair of keys instead of a single key. The two keys are called the **public key** and the **private key**. The keys consist of very long numbers linked mathematically in a way such that a message encrypted using a public key can only be decrypted using the private key and vice versa. The message cannot be decrypted using the same key that was used to encrypt the message.

So going back to our example, Amy and Rosa both have their own public-private key pairs. They keep their private keys safe with themselves and publicly distribute their public keys. Now when Amy wants to send a message to Rosa, she will request Rosa's public key, encrypt the message using Rosa’s public key, and send the encrypted message. Rosa uses her own private key to decrypt the message. The same sequence is followed when Rosa wants to communicate with Amy.

But what if a malicious imposter intercepts the communication? The imposter might pose as Rosa and send their public key instead of Rosa’s. There's no way for Amy to know that the public key she received isn’t Rosa’s, so she would end up using public key from the imposter's certificate to encrypt the message and send it to the imposter. The imposter can use their own private key and decrypt and read the message, thus compromising the secure communication channel between Amy and Rosa.

To prevent this security risk, Amy needs to be sure that the public key she received was indeed Rosa’s. That’s where the Certificate Authority (CA) comes into the picture.

### Certificate authority

Certificate authorities are established entities with their own public and private key pairs. They act as a root of trust and verify the identities of the communicating parties and validate their public keys. CAs can be public and paid entities (e.g., GeoTrust and Comodo), or public and free CAs (e.g., Let’s Encrypt), or your own organizational CA (e.g., CockroachDB CA). The CAs' public keys are typically widely distributed (e.g., your browser comes preloaded with certs from popular CAs like DigiCert, GeoTrust, and so on).

Think of the CA as the passport authority of a country. When you want to get your passport as your identity proof, you submit an application to your country's passport authority. The application contains important identifying information about you: your name, address, nationality, date of birth, and so on. The passport authority verifies the information they received and validates your identity. They then issue a document - the passport - that can be presented anywhere in the world to verify your identity. For example, the TSA agent at the airport does not know you and has no reason to trust you are who you say you are. However, they trust the passport authority and thus accept your identity as presented on your passport because it has been verified and issued by the passport authority.

Going back to our example and assuming that we trust the CA, Rosa needs to get her public key verified by the CA. She sends a CSR (Certificate Signing Request) to the CA that contains her public key and relevant identifying information. The CA will verify that it is indeed Rosa’s public key and information, _sign_ the CSR using the CA's own private key, and generate a digital document called the **digital certificate**. In our passport analogy, this is Rosa's passport containing verified identifying information about her and trusted by everyone who trusts the CA. The next time Rosa wants to establish her identity, she will present her digital certificate.

### Digital certificate

A public key is shared using a digital certificate signed by a CA using the CA's private key. The digital certificate contains:

-   The certificate owner’s public key    
-   Information about the certificate owner
-   CA's digital signature

### Digital Signature

The TLS digital signature is created as follows: The certificate contents are put through a mathematical function to create a **hash value**. This hash value if then encrypted using the CA's private key to generate a **digital signature**. This digital signature is added to the digital certificate. In our example, the CA adds their digital signature to Rosa's certificate validating her identity and her public key.

As discussed earlier, the CA's public key is widely distributed. So in our example, Amy already has the CA's public key. Now when Rosa presents her digital certificate containing her public key, Amy uses the CA's public key to decrypt the digital signature on Rosa's certificate and gets the hash value encoded in the digital signature. Amy also generates the hash value on her own. If the hash values match, then Amy can be sure that the certificate and hence the public key it contains indeed belongs to Rosa; else she can determine that the communication channel has been compromised and hence refuse further contact.

### How it all works together

Let's see how the digital certificate is used in client-server communication: The client (e.g., a web browser) has the CA certificate (containing the CA's public key). When the client receives a server's certificate signed by the same CA, it can use the CA certificate to verify the server's certificate, thus validating the server's identity, and securely connect to the server. The important thing here is that the client needs to have the CA certificate. If you use your own organizational CA instead of a publicly established CA, you need to make sure you distribute the CA certs to all the clients.

### TLS certificates

CockroachDB uses TLS 1.2 server and client certificates. The TLS server certificates have the following requirements:

1. The primary hostname ([domain name](https://en.wikipedia.org/wiki/Domain_name) of the website) must be listed as the **Common Name** in the **Subject** field of the certificate.
2. The address (IP address or DNS name) used to reach a node, either directly or through a load balancer, must be listed in **Subject Alternative Names** field of the certificate.
3. The certificate must be signed by a trusted certificate authority.

The TLS client certificates are used to authenticate the client connecting to a server. Because most client certificates authenticate a user instead of a device, the certificates contain usernames instead of hostnames. This makes it difficult for public CAs to verify the client's identity and hence most public CAs will not sign a client certificate. In that case, you might need to set up your own internal CA to issue client certificates.

## Using digital certificates with CockroachDB

Because CockroachDB uses TLS 1.2 certificates, ensure that the CockroachDB certificates meet the following TLS requirements:

- The node's primary hostname must be listed as the `CN` (Common Name) field in the `Subject` field of the certificate.
- The certificate must have all the IP addresses and DNS names used to reach the nodes (or the Admin UI) listed in the `Subject Alternative Name` field. This is needed to make sure we are indeed talking to a CockroachDB node, and not a man-in-the-middle.
- The certificate is signed by a trusted certificate authority.

Based on your security setup, you can use the [`cockroach cert` commands](create-security-certificates.html), [`openssl` commands](create-security-certificates-openssl.html), or a custom CA to generate all the keys and certificates.

A CockroachDB cluster consists of multiple nodes and clients. The nodes can communicate with each other, with the SQL clients, and the Admin UI. In client-node communication and UI-node communication, the node acts as a server, but in inter-node communication, a node may act as a server or a client.

- Node identity checks using [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) digital certificates.
- Client identity checks using either TLS digital certificates or passwords.

### Node identity check

CockroachDB uses TLS digital certificates for inter-node and client-node authentication, which requires the following:

- CA certificate and key
- Node certificate and key
- (Optional) UI certificate and key

You can use [`cockroach cert` commands](create-security-certificates.html) , [`openssl` commands](create-security-certificates-openssl.html), or a custom CA to generate all the keys and certificates.

### Client identity check

Secure CockroachDB clusters require users to authenticate their access to databases and tables. CockroachDB offers two methods for this:

- [Client certificate and key authentication](#secure-clusters-with-client-certificates), which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

- [Password authentication](#secure-clusters-with-passwords), which is available to non-`root` users who you've created passwords for. To set a password for a non-`root` user, include the `--password` flag in the `cockroach user set` command.

    Users can use passwords to authenticate without supplying client certificates and keys; however, we recommend using certificate-based authentication whenever possible.

    Password creation is supported only in secure clusters.

    Note: Authenticating with passwords still needs `ca.crt`

### Using `cockroach cert` or `openssl` commands

You can use the [`cockroach cert` commands](create-security-certificates.html) or [`openssl` commands](create-security-certificates-openssl.html) to create the CA certificate and key, and node and client certificates and keys.

Note that the node certificate created using `cockroach cert` or`openssl` is multi-functional, which means that the same certificate is presented irrespective of whether the node is acting as a server or a client. Thus all nodes must have the following:

- `CN=Node` for the special user `node` when the node acts as a client.
- All IP addresses and DNS names for the node must be listed in `Subject Alternative Name` field for when the node acts as a server.

**Node key and certificates**

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`node.crt`   | Server certificate created using the `cockroach cert` command. <br><br> `node.crt` must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. <br><br>Must be signed by `ca.crt`.
`node.key`   | Server key created using the `cockroach cert` command.

**Client key and certificates**

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br> Must be signed by `ca.crt`.
`client.<user>.key` | Client key created using the `cockroach cert` command.

### Using a public CA certificate to access the Admin UI for a secure cluster

One of the limitations of using `cockroach cert` or `openssl` is that the browsers used to access the CockroachDBAdmin UI do not trust the node certificates presented to them. As discussed in the [How digital certificates work](#how-digital-certificates-work) section, web browsers come preloaded with CA certificates from well-established entities (e.g., GlobalSign and DigiTrust). The CA certificate generated using the `cockroach cert` or `openssl` is not preloaded in the browser. Hence on accessing the Admin UI for a secure cluster, you get the “Unsafe page” warning. Now you could add the CA certificate to the browser to avoid the warning, but that is not a recommended practice. Instead, you can use the established CAs (for example, Let’s Encrypt), to create a certificate and key to access the Admin UI.

Once you have the UI cert and key, add it to the Certificates directory specified by the `--certs-dir` flag in the `cockroach cert` command. The next time the browser tries to access the UI, the node will present the UI cert instead of the node cert, and you’ll not see the “unsafe site” warning anymore.

**Node key and certificates**

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`node.crt`   | Server certificate created using the `cockroach cert` command. <br><br> `node.crt` must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. <br><br>Must be signed by `ca.crt`.
`node.key`   | Server key created using the `cockroach cert` command.
`ui.crt` | UI certificate signed by the public CA. `ui.crt` must have the IP addresses and DNS names used to reach the Admin UI listed in `Subject Alternative Name`.
`ui.key` | UI key corresponding to `ui.crt`.

**Client key and certificates**

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br> Must be signed by `ca.crt`.
`client.<user>.key` | Client key created using the `cockroach cert` command.

### Using a custom CA

So far we have discussed the scenario where the node and client certificates are signed by the CA created using the `cockroach cert` command. But what if you want to use an external CA, like your organizational CA or a public CA? In that case, our certificates might need some modification. Here’s why:

As discussed earlier, the node certificate is multi-functional, as in the same certificate is presented irrespective of whether the node is acting as a server or client. To make the certificate multi-functional, the `node.crt` must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Names` field.

But as we discussed in the [TLS certificates](#tls-certificates) section, some CAs will not sign a node certificate containing a `CN` that is not an IP address or domain name.

To get around this issue, we can split the node key and certificate into two:

- `node.crt` and `node.key`: The node certificate to be presented when the node acts as a server and the corresponding key. `node.crt` must have the list of IP addresses and DNS names listed in `Subject Alternative Names`.
- `client.node.crt` and `client.node.key`: The node certificate to be presented when the node acts as a client for another node, and the corresponding key. `client.node.crt` must have `CN=node`.

**Node key and certificates**

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate issued by the public CA or your organizational CA.
`node.crt`   | Node certificate for when node acts as server. <br><br>All IP addresses and DNS names for the node must be listed in `Subject Alternative Name`. <br><br>Must be signed by `ca.crt`.
`node.key`   | Server key corresponding to `node.crt`.
`client.node.crt` | Node certificate for when node acts as client. <br><br>Must have `CN=node`. <br><br> Must be signed by `ca.crt`.
`client.node.key` | Client key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the Admin UI, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.

**Client key and certificates**

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate issued by the public CA or your organizational CA.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br>Must be signed by `ca.crt`.
`client.<user>.key` | Client key corresponding to `client.<user>.crt`.

### Using split CA certificates

{{site.data.alerts.callout_danger}}
We do not recommend you use split CA certificates unless your organizational security practices mandate you to do so.
{{site.data.alerts.end}}

You might encounter situations where you need separate CAs to sign and verify node and client certificates. In that case, you would need two CAs and their respective certificates and keys: `ca.crt` and `ca-client.crt`.

### Node key and certificates

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate to verify node certificates.
`ca-client.crt` | CA certificate to verify client certificates.
`node.crt`   | Node certificate for when node acts as server. <br><br>All IP addresses and DNS names for the node must be listed in `Subject Alternative Name`. <br><br> Must be signed by `ca.crt`.
`node.key`   | Server key corresponding to `node.crt`.
`client.node.crt` | Node certificate for when node acts as client. This certificate must be signed using `ca-client.crt`  <br><br>Must have `CN=node`.
`client.node.key` | Client key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the Admin UI, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.

### Client key and certificates

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>` (for example, `CN=marc` for `client.marc.crt`). <br><br> Must be signed by `ca-client.crt`.
`client.<user>.key` | Client key corresponding to `client.<user>.crt`.

### Authenticate as a specific user

#### Secure clusters with client certificates

All users can authenticate their access to a secure cluster using [a client certificate](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client) issued to their username.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

#### Secure clusters with passwords

Users with passwords can authenticate their access by entering their password at the command prompt instead of using their client certificate and key.

If we cannot find client certificate and key files matching the user, we fall back on password authentication.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs --user=jpointsman
~~~

### Auth for cloud storage

See [Backup file URLs](backup.html#backup-file-urls)

## Authentication best practice

As a security best practice, we recommend that you rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodical certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

For details about when and how to change security certificates without restarting nodes, see [Rotate Security Certificates](rotate-certificates.html).

## See also

- [Client Connection Parameters](connection-parameters.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](secure-a-cluster.html)
- [Test Deployment](deploy-a-test-cluster.html)
- [Other Cockroach Commands](cockroach-commands.html)
