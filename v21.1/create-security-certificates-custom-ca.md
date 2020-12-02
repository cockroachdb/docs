---
title: Create Security Certificates using a Custom CA
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
---

To secure your CockroachDB cluster's inter-node and client-node communication, you need to provide a Certificate Authority (CA) certificate that has been used to sign keys and certificates (SSLs) for:

- Nodes
- Clients
- DB Console (optional)

To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, use [`openssl` commands](https://wiki.openssl.org/index.php/), or use a [custom CA](create-security-certificates-custom-ca.html) (for example, a public CA or your organizational CA).

<div class="filters filters-big clearfix">
  <a href="cockroach-cert.html"><button style="width:28%" class="filter-button">Use cockroach cert</button>
  <a href="create-security-certificates-openssl.html"><button style="width:28%" class="filter-button">Use Openssl</button></a>
  <button style="width:28%" class="filter-button current">Use <strong>custom CA</strong></button></a>
</div>

This document discusses the following advanced use cases for using security certificates with CockroachDB:

Approach | Use case description
-------------|------------
[UI certificate and key](#accessing-the-db-console-for-a-secure-cluster) | When you want to access the DB Console for a secure cluster and avoid clicking through a warning message to get to the UI.
[Split-node certificate](#split-node-certificates) | When your organizational CA requires you to have separate certificates for the node's incoming connections (from SQL and DB Console clients, and from other CockroachDB nodes) and for outgoing connections to other CockroachDB nodes.
[Split-CA certificates](#split-ca-certificates) | When you have multiple CockroachDB clusters and need to restrict access to clients from accessing the other cluster.

## Accessing the DB Console for a secure cluster

On [accessing the DB Console](ui-overview.html#db-console-access) for a secure cluster, your web browser will consider the CockroachDB-issued certificate invalid, because the browser hasn't been configured to trust the CA that issued the certificate.

For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA whose certificates are trusted by browsers, in addition to the CockroachDB-created certificates:

1. Request a certificate from a public CA (for example, [Let's Encrypt](https://letsencrypt.org/)). The certificate must have the IP addresses and DNS names used to reach the DB Console listed in the `Subject Alternative Name` field.
2. Rename the certificate and key as `ui.crt` and `ui.key`.
3. Add the `ui.crt` and `ui.key` to the [certificate directory](cockroach-cert.html#certificate-directory). `ui.key` must not have group or world permissions (maximum permissions are 0700, or rwx------). You can disable this check by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.
4. For nodes that are already running, load the `ui.crt` certificate without restarting the node by issuing a `SIGHUP` signal to the cockroach process:
   {% include copy-clipboard.html %}
   ~~~ shell
   pkill -SIGHUP -x cockroach
   ~~~
   The `SIGHUP` signal must be sent by the same user running the process (e.g., run with sudo if the cockroach process is running under user root).

### Node key and certificates

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`node.crt`   | Server certificate created using the `cockroach cert` command. <br><br> `node.crt` must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. <br><br>Must be signed by `ca.crt`.
`node.key`   | Server key created using the `cockroach cert` command.
`ui.crt` | UI certificate signed by the public CA. `ui.crt` must have the IP addresses and DNS names used to reach the DB Console listed in `Subject Alternative Name`.
`ui.key` | UI key corresponding to `ui.crt`.

### Client key and certificates

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate created using the `cockroach cert` command.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br> Must be signed by `ca.crt`.
`client.<user>.key` | Client key created using the `cockroach cert` command.

## Split node certificates

The node certificate discussed in the `cockroach cert` command [documentation](cockroach-cert.html) is multifunctional, which means the same certificate is presented for the node's incoming connections (from SQL and DB Console clients, and from other CockroachDB nodes) and for outgoing connections to other CockroachDB nodes. To make the certificate multi-functional, the `node.crt` created using the `cockroach cert` command has `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. This works if you are also using the CockroachDB CA created using the `cockroach cert` command. However, if you need to use an external public CA or your own organizational CA, the CA policy might not allow it to sign a server certificate containing a CN that is not an IP address or domain name.

To get around this issue, you can split the node key and certificate into two:

- `node.crt` and `node.key`: `node.crt` is used as the server certificate when a node receives incoming connections from clients and other nodes. All IP addresses and DNS names for the node must be listed in the `Subject Alternative Name` field.
- `client.node.crt` and `client.node.key`: `client.node.crt` is used as the client certificate when making connections to other nodes. `client.node.crt` must have `CN=node`.

### Node key and certificates

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate issued by the public CA or your organizational CA.
`node.crt`   | Server certificate used when a node receives incoming connections from clients and other nodes. <br><br>All IP addresses and DNS names for the node must be listed in `Subject Alternative Name`. <br><br>Must be signed by `ca.crt`.
`node.key`   | Server key corresponding to `node.crt`.
`client.node.crt` | Client certificate when making connections to other nodes. <br><br>Must have `CN=node`. <br><br> Must be signed by `ca.crt`.
`client.node.key` | Client key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the DB Console, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.

### Client key and certificates

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate issued by the public CA or your organizational CA.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br>Must be signed by `ca.crt`.
`client.<user>.key` | Client key corresponding to `client.<user>.crt`.

## Split CA certificates

{{site.data.alerts.callout_danger}}
We do not recommend you use split CA certificates unless your organizational security practices mandate you to do so.
{{site.data.alerts.end}}

If you need to use separate CAs to sign node certificates and client certificates, then you need two CAs and their respective certificates and keys: `ca.crt` and `ca-client.crt`.

### Node key and certificates

A node must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate to verify node certificates.
`ca-client.crt` | CA certificate to verify client certificates.
`node.crt`   | Server certificate used when a node receives incoming connections from clients and other nodes. <br><br>All IP addresses and DNS names for the node must be listed in `Subject Alternative Name`. <br><br> Must be signed by `ca.crt`.
`node.key`   | Server key corresponding to `node.crt`.
`client.node.crt` | Client certificate when making connections to other nodes. This certificate must be signed using `ca-client.crt`  <br><br>Must have `CN=node`.
`client.node.key` | Client key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the DB Console, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.

### Client key and certificates

A client must have the following files with file names as specified in the table:

File name | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>` (for example, `CN=marc` for `client.marc.crt`). <br><br> Must be signed by `ca-client.crt`.
`client.<user>.key` | Client key corresponding to `client.<user>.crt`.

## Certificate revocation with OCSP

 CockroachDB now supports certificate revocation for custom CA certificate setups running an [OCSP](https://en.wikipedia.org/wiki/Online_Certificate_Status_Protocol) server.

To enable certificate revocation:

1. Ensure that your Certificate Authority sets the OCSP server address in the `authorityInfoAccess` field in the certificate.
2. [Set the cluster setting](set-cluster-setting.html) `security.ocsp.mode` to `lax` (by default, the cluster setting is set to `off`).

      {% include copy-clipboard.html %}
      ~~~ sql
      > SHOW CLUSTER SETTING security.ocsp.mode;
      ~~~

      ~~~
      security.ocsp.mode
      ----------------------
      off
      (1 row)

      Server Execution Time: 56µs
      Network Latency: 181µs
      ~~~

      {% include copy-clipboard.html %}
      ~~~ sql
      > SET CLUSTER SETTING security.ocsp.mode = lax;
      ~~~

      For production clusters, you might want to set the setting to `strict`.

      {{site.data.alerts.callout_info}}
      In the `strict` mode, all certificates are presumed to be invalid if the OCSP server is not reachable. Setting the cluster setting `security.ocsp.mode` to `strict` will lock you out of your CockroachDB database if your OCSP server goes down.
      {{site.data.alerts.end}}


## See also

- [Manual Deployment](manual-deployment.html): Learn about starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](cockroach-start.html): Learn more about the flags you pass when adding a node to a secure cluster
- [Client Connection Parameters](connection-parameters.html)
