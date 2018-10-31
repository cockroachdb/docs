---
title: Create Security Certificates
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
---

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires a Certificate Authority (CA) certificate as well as keys and certificates for nodes, clients, and (optionally) the Admin UI. To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, use [`openssl` commands](https://wiki.openssl.org/index.php/), or use a custom CA (for example, a public CA or your organizational CA).

<div class="filters filters-big clearfix">
  <a href="create-security-certificates.html"><button style="width:28%" class="filter-button">Use cockroach cert commands</button>
  <a href="create-security-certificates-openssl.html"><button style="width:28%" class="filter-button">Use Openssl</button></a>
  <button style="width:28%" class="filter-button">Use custom CA</button>
</div>

In this document, we discuss the following approaches for using security certificates with CockroachDB:

Approach | Use case description
-------------|------------
UI certificate and key | When you want to access the Admin UI for a secure cluster and avoid clicking through a warning message to get to the UI.
Split-node certificate | When your organizational CA requires you to have separate certificates for when the node acts as a server and as a client.
Split-CA certificates | When you have multiple CockroachDB clusters and need to restrict access to clients from accessing the other cluster

## Accessing the Admin UI for a secure cluster

On [accessing the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI.

For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA:

1. Request a certificate from a public CA (for example, [Let's Encrypt](https://letsencrypt.org/)). The certificate must have the IP addresses and DNS names used to reach the Admin UI listed in the `Subject Alternative Names` field.
2. Rename the certificate and key as `ui.crt` and `ui.key`.
3. Add the `ui.crt` and `ui.key` to the [certificate directory](create-security-certificates.html#certificate-directory). `ui.key` must not have group or world permissions (maximum permissions are 0700, or rwx------). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.
4. 

### Configuration files

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate
`ui.crt` | UI certificate
`ui.key` | Key for the UI certificate



## Certificate directory

To create node and client certificates using the OpenSSL commands, you need access to a local copy of the CA certificate and key. We recommend creating all certificates (node, client, and CA certificates), and node and client keys in one place and then distributing them appropriately. Store the CA key somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster.

Use the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to create all certificates, and node and client keys in a single directory, with the files named as follows:

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (for example: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

Note the following:

- The CA key should not be uploaded to the nodes and clients, so it should be created in a separate directory.

- Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.

## See also

- [Manual Deployment](manual-deployment.html): Learn about starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster
- [Client Connection Parameters](connection-parameters.html)
