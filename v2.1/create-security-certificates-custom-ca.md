---
title: Create Security Certificates
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
---

A secure CockroachDB cluster uses TLS 1.2 for encrypted inter-node and client-node communication and requires a Certificate Authority (CA) certificate as well as keys and certificates for nodes, clients, and (optionally) the Admin UI. To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, use [`openssl` commands](https://wiki.openssl.org/index.php/), or use a custom CA (for example, a public CA or your organizational CA).

<div class="filters filters-big clearfix">
  <a href="create-security-certificates.html"><button style="width:28%" class="filter-button">Use cockroach cert</button>
  <a href="create-security-certificates-openssl.html"><button style="width:28%" class="filter-button">Use Openssl</button></a>
  <button style="width:28%" class="filter-button current">Use <strong>custom CA</strong></button></a>
</div>

This document discusses the following advanced use cases for using security certificates with CockroachDB:

Approach | Use case description
-------------|------------
UI certificate and key | When you want to access the Admin UI for a secure cluster and avoid clicking through a warning message to get to the UI.
Split-node certificate | When your organizational CA requires you to have separate certificates for when the node acts as a server and as a client.
Split-CA certificates | When you have multiple CockroachDB clusters and need to restrict access to clients from accessing the other cluster.

## Accessing the Admin UI for a secure cluster

On [accessing the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI.

For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA:

1. Request a certificate from a public CA (for example, [Let's Encrypt](https://letsencrypt.org/)). The certificate must have the IP addresses and DNS names used to reach the Admin UI listed in the `Subject Alternative Name` field.
2. Rename the certificate and key as `ui.crt` and `ui.key`.
3. Add the `ui.crt` and `ui.key` to the [certificate directory](create-security-certificates.html#certificate-directory). `ui.key` must not have group or world permissions (maximum permissions are 0700, or rwx------). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.
4. For nodes that are already running, load the `ui.crt` certificate without restarting the node by issuing a `SIGHUP` signal to the cockroach process:
   {% include copy-clipboard.html %}
   ~~~ shell
   pkill -SIGHUP -x cockroach
   ~~~
   The `SIGHUP` signal must be sent by the same user running the process (e.g., run with sudo if the cockroach process is running under user root).

### Node key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`node.crt`   | Server certificate. <br><br> `node.crt` must have `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. <br><br>Must be signed by `ca.crt`.
`node.key`   | Key for server certificate.
`ui.crt` | UI certificate. `ui.crt` must have the IP addresses and DNS names used to reach the Admin UI listed in `Subject Alternative Name`.
`ui.key` | Key for the UI certificate.

### Client key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br> Must be signed by `ca.crt`.
`client.<user>.key` | Key for the client certificate.

## Split node certificates

The node certificate discussed in the `cockroach cert` command documentation is multifunctional, which means the same certificate is presented when the node acts as a server as well as a client. To make the certificate multi-functional, the `node.crt` created using the `cockroach cert` command has `CN=node` and the list of IP addresses and DNS names listed in `Subject Alternative Name` field. This works if you are also using the CockroachDB CA created using the `cockroach cert` command. However, if you need to use an external public CA or your own organizational CA, the CA policy might not allow it to sign a server certificate containing a CN that is not an IP address or domain name.

To get around this issue, we can split the node key and certificate into two:

- `node.crt` and `node.key`: The node certificate to be presented when the node acts as a server and the corresponding key. `node.crt` must have the list of IP addresses and DNS names listed in `Subject Alternative Name`.
- `client.node.crt` and `client.node.key`: The node certificate to be presented when the node acts as a client for another node, and the corresponding key. `client.node.crt` must have `CN=node`.

### Node key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`node.crt`   | Node certificate for when node acts as server. <br><br>Must have the list of IP addresses and DNS names listed in `Subject Alternative Name`. <br><br>Must be signed by `ca.crt`.
`node.key`   | Key corresponding to `node.crt`.
`client.node.crt` | Node certificate for when node acts as client. <br><br>Must have `CN=node`. <br><br> Must be signed by `ca.crt`.
`client.node.key` | Key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the Admin UI, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.


### Client key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>`  (for example, `CN=marc` for `client.marc.crt`) <br><br>Must be signed by `ca.crt`.
`client.<user>.key` | Key for the client certificate.

## Split CA certificates

{{site.data.alerts.callout_danger}}
We do not recommend you use split CA certificates unless your organizational security practices mandate you to do so.
{{site.data.alerts.end}}

If you need to use separate CAs to sign node certificates and client certificates, then we need two CAs and their respective certificates and keys: `ca.crt` and `ca-client.crt`.

### Node key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate to verify node certificates.
`ca-client.crt` | CA certificate to verify client certificates.
`node.crt`   | Node certificate for when node acts as server. <br><br>Must have the list of IP addresses and DNS names listed in `Subject Alternative Name`. <br><br> Must be signed by `ca.crt`.
`node.key`   | Key corresponding to `node.crt`.
`client.node.crt` | Node certificate for when node acts as client. This certificate must be signed using `ca-client.crt`  <br><br>Must have `CN=node`.
`client.node.key` | Key corresponding to `client.node.crt`.

Optionally, if you have a certificate issued by a public CA to securely access the Admin UI, you need to place the certificate and key (`ui.crt` and `ui.key` respectively) in the directory specified by the `--certs-dir` flag.

### Client key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (e.g., `client.root.crt` for user `root`). <br><br>Each `client.<user>.crt` must have `CN=<user>` (for example, `CN=marc` for `client.marc.crt`). <br><br> Must be signed by `ca-client.crt`.
`client.<user>.key` | Key for the client certificate.

## See also

- [Manual Deployment](manual-deployment.html): Learn about starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster
- [Client Connection Parameters](connection-parameters.html)
