---
title: Rotate Security Certificates
summary: Rotate the security certificates of a secure CockroachDB cluster by creating and reloading new certificates.
toc: true
---

CockroachDB allows you to rotate security certificates without restarting nodes.

{{site.data.alerts.callout_success}}For an introduction to how security certificates work in a secure CockroachDB cluster, see <a href="cockroach-cert.html">Create Security Certificates</a>.{{site.data.alerts.end}}


## When to rotate certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon.
- Your organization's compliance policy requires periodical certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name or the IP address of a load balancer through which a node can be reached. In this case, you would need to rotate only the node certificates.

### Rotate client certificates

1. Create a new client certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client <username> \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

2. Upload the new client certificate and key to the client using your preferred method.

3. Have the client use the new client certificate.

    This step is application-specific and may require restarting the client.

### Rotate node certificates

To rotate a node certificate, you create a new node certificate and key and reload them on the node.

1. Create a new node certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    <node hostname> \
    <node other hostname> \
    <node yet another hostname> \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key \
    --overwrite
    ~~~

    Since you must create the new certificate and key in the same directory as the existing certificate and key, use the `--overwrite` flag to overwrite the existing files. Also, be sure to specify all addresses at which node can be reached.

2. Upload the node certificate and key to the node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ scp certs/node.crt \
    certs/node.key \
    <username>@<node address>:~/certs
    ~~~

3. Reload the node certificate without restarting the node by issuing a `SIGHUP` signal to the `cockroach` process:

    {% include copy-clipboard.html %}
    ~~~ shell
    pkill -SIGHUP -x cockroach
    ~~~

    The `SIGHUP` signal must be sent by the same user running the process (e.g., run with `sudo` if the `cockroach` process is running under user `root`).

4. Verify that certificate rotation was successful using the **Local Node Certificates** page in the DB Console: `https://<address of node with new certs>:8080/#/reports/certificates/local`.

    Scroll to the node certificate details and confirm that the **Valid Until** field shows the new certificate expiration time.

### Rotate the CA certificate

To rotate the CA certificate, you create a new CA key and a combined CA certificate that contains the new CA certificate followed by the old CA certificate, and then you reload the new combined CA certificate on the nodes and clients. Once all nodes and clients have the combined CA certificate, you then create new node and client certificates signed with the new CA certificate and reload those certificates on the nodes and clients as well.

For more background, see [Why CockroachDB creates a combined CA certificate](rotate-certificates.html#why-cockroachdb-creates-a-combined-ca-certificate) and [Why rotate CA certificate in advance](rotate-certificates.html#why-rotate-ca-certificates-in-advance).

1. Rename the existing CA key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv  my-safe-directory/ca.key my-safe-directory/ca.old.key
    ~~~

2. Create a new CA certificate and key, using the `--overwrite` flag to overwrite the old CA certificate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key \
    --overwrite
    ~~~

    This results in the [combined CA certificate](rotate-certificates.html#why-cockroachdb-creates-a-combined-ca-certificate), `ca.crt`, which contains the new certificate followed by the old certificate.

    {{site.data.alerts.callout_danger}}The CA key is never loaded automatically by <code>cockroach</code> commands, so it should be created in a separate directory, identified by the <code>--ca-key</code> flag.{{site.data.alerts.end}}

2. Upload the new CA certificate to each node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ scp certs/ca.crt
    <username>@<node1 address>:~/certs
    ~~~

3. Upload the new CA certificate to each client using your preferred method.

4. On each node, reload the CA certificate without restarting the node by issuing a `SIGHUP` signal to the `cockroach` process:

    {% include copy-clipboard.html %}
    ~~~ shell
    pkill -SIGHUP -x cockroach
    ~~~

    The `SIGHUP` signal must be sent by the same user running the process (e.g., run with `sudo` if the `cockroach` process is running under user `root`).

5. Reload the CA certificate on each client.

    This step is application-specific and may require restarting the client.

6. Verify that certificate rotation was successful using the **Local Node Certificates** page in the DB Console: `https://<address of node with new certs>:8080/#/reports/certificates/local`.

    The details of the old as well as new CA certificates should be shown. Confirm that the **Valid Until** field of the new CA certificate shows the new certificate expiration time.

7. Once you are confident that all nodes and clients have the new CA certificate, [rotate the node certificates](#rotate-node-certificates) and [rotate the client certificates](#rotate-client-certificates).

## Why CockroachDB creates a combined CA certificate

On rotating the CA certificate, the nodes have the new CA certificate after certs directory is rescanned, and the clients have the new CA certificates when they are restarted. However, until the node and client certificates are rotated, the nodes and client certificates are still signed with the old CA certificate. Thus the nodes and clients are unable to verify each other's identity using the new CA certificate.

To overcome the issue, we take advantage of the fact that multiple CA certificates can be active at the same time. While verifying the identity of another node or a client, they can check with multiple CA certificates uploaded to them. Thus instead of creating only the new certificate while rotating the CA certificates, CockroachDB creates a combined CA certificate that contains the new CA certificate followed by the old CA certificate. When node and client certificates are rotated, the combined CA certificate is used to verify old as well as new node and client certificates.

## Why rotate CA certificates in advance

On rotating node and client certificates after rotating the CA certificate, the node and client certificates are signed using new CA certificates. The nodes use the new node and CA certificates as soon as the certs directory on the node is rescanned. However, the clients use the new CA and client certificates only when the clients are restarted. Thus node certificates signed by the new CA certificate are not accepted by clients that do not have the new CA certificate yet. To ensure all nodes and clients have the latest CA certificate, rotate CA certificates on a completely different schedule; ideally, months before changing the node and client certificates.

## See also

- [Create Security Certificates](cockroach-cert.html)
- [Manual Deployment](manual-deployment.html)
- [Orchestrated Deployment](orchestration.html)
- [Local Deployment](secure-a-cluster.html)
- [Other Cockroach Commands](cockroach-commands.html)
