---
title: Authentication
summary: Learn about the authentication features for secure CockroachDB clusters.
toc: true
---

This document presents a conceptual overview of public key cryptography and digital certificates and then proceeds to discuss how CockroachDB uses digital certificates. If you want to know how to create CockroachDB security certificates, see [Create Security Certificates](create-security-certificates.html).

## Using digital certificates with CockroachDB

CockroachDB uses both TLS 1.2 server and client certificates. Each CockroachDB node in a secure cluster must have a **node certificate**, which is a TLS 1.2 server certificate. Note that the node certificate is multi-functional, which means that the same certificate is presented irrespective of whether the node is acting as a server or a client. The nodes use these certificates to establish secure connections with clients and with other nodes.  Node certificates have the following requirements:

- The hostname or address (IP address or DNS name) used to reach a node, either directly or through a load balancer, must be listed in the **Common Name** or **Subject Alternative Names** fields of the certificate:

  - The values specified in [`--listen-addr`](start-a-node.html#networking) and [`--advertise-addr`](start-a-node.html#networking) flags, or the node hostname and fully qualified hostname if not specified
  - Any host addresses/names used to reach a specific node
  - Any load balancer addresses/names or DNS aliases through which the node could be reached
  - `localhost` and local address if connections are made through the loopback device on the same host

 This is needed to allow other clients and nodes to verify that they are indeed communicating with a CockroachDB node and not an imposter.

- CockroachDB must be configured to trust the certificate authority that signed the certificate.

Based on your security setup, you can use the [`cockroach cert` commands](create-security-certificates.html), [`openssl` commands](create-security-certificates-openssl.html), or a custom CA to generate all the keys and certificates.

A CockroachDB cluster consists of multiple nodes and clients. The nodes can communicate with each other, with the SQL clients, and the Admin UI. In client-node SQL communication and client-UI communication, the node acts as a server, but in inter-node communication, a node may act as a server or a client. Hence authentication in CockroachDB involves:

- Node authentication using [TLS 1.2](https://en.wikipedia.org/wiki/Transport_Layer_Security) digital certificates.
- Client authentication using either TLS digital certificates or passwords.

### Node authentication

To set up a secure cluster without using an existing certificate authority, you'll need to generate the following files:

- CA certificate
- Node certificate and key
- (Optional) UI certificate and key

### Client authentication

CockroachDB offers two methods for client authentication:

- **Client certificate and key authentication**, which is available to all users. To ensure the highest level of security, we recommend only using client certificate and key authentication.

   Example:
   {% include copy-clipboard.html %}
   ~~~ shell
   $ cockroach sql --certs-dir=certs --user=jpointsman
   ~~~

- **Password authentication**, which is available to non-`root` users who you've created passwords for. Password creation is supported only in secure clusters.

   Example:
   {% include copy-clipboard.html %}
   ~~~ shell
   $ cockroach sql --certs-dir=certs --user=jpointsman
   ~~~

   Note that the client still needs the CA certificate in order to validate the nodes' certificates.

### Using `cockroach cert` or `openssl` commands

You can use the [`cockroach cert` commands](create-security-certificates.html) or [`openssl` commands](create-security-certificates-openssl.html) to create the CA certificate and key, and node and client certificates and keys.

Note that the node certificate created using `cockroach cert` or`openssl` is multi-functional, which means that the same certificate is presented irrespective of whether the node is acting as a server or a client. Thus all nodes must have the following:

- `CN=node` for the special user `node` when the node acts as a client.
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

Alternatively, you can use [password authentication](#secure-clusters-with-passwords). Remember, the client still needs `ca.crt` for node authentication.

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

Alternatively, you can use [password authentication](#secure-clusters-with-passwords). Remember, the client still needs `ca.crt` for node authentication.

### Using a public CA certificate to access the Admin UI for a secure cluster

One of the limitations of using `cockroach cert` or `openssl` is that the browsers used to access the CockroachDB Admin UI do not trust the node certificates presented to them. As discussed in the [How digital certificates work](#how-digital-certificates-work) section, web browsers come preloaded with CA certificates from well-established entities (e.g., GlobalSign and DigiTrust). The CA certificate generated using the `cockroach cert` or `openssl` is not preloaded in the browser. Hence on accessing the Admin UI for a secure cluster, you get the “Unsafe page” warning. Now you could add the CA certificate to the browser to avoid the warning, but that is not a recommended practice. Instead, you can use the established CAs (for example, Let’s Encrypt), to create a certificate and key to access the Admin UI.

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

Alternatively, you can use [password authentication](#secure-clusters-with-passwords). Remember, the client still needs `ca.crt` for node authentication.

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

### Authentication for cloud storage

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
