---
title: Rotate Security Certificates
summary: Rotate the security certificates of a secure CockroachDB cluster by creating and reloading new certificates.
toc: false
---

<span class="version-tag">New in v1.1:</span> CockroachDB allows you to rotate security certificates without restarting the nodes. 

<div id="toc"></div>

## How CockroachDB Security Certificates Work

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communications, which requires CA, node, and client certificates and keys. 

The node and client certificates are signed using the CA certificate. While establishing inter-node or client-node communication, the nodes and clients use the CA certificate to verify each other's identity. 

For each node, the CA certificate, node certificate, and node keys are uploaded to certs directory on the node. For each client, the CA certificate, client certificate, and client keys are uploaded to the client. 

For more information, see [Create security certificates](create-security-certificates.html).

## When to Rotate Certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon. 
- Your organization's compliance policy may require periodical certificate rotation.
- The key (for a node, client, or CA) is compromised.
- You need to modify the contents of a certificate, for example, to add another DNS name/IP address of load balancer through which a node can be reached. In this case, you need to rotate only the node certificates.

## Rotating Client Certificates

Rotating a client certificate involves the following steps:

### Step 1. Create a new client key and certificate

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-client <username>
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key
~~~

### Step 2. Upload the new client certificate and key to the client

Upload the new client certificate and key to the client using your preferred method.

### Step 3. Have the client use the new client certificate

This step is application-specific and may require restarting the client.

## Rotating Node Certificates 

Rotating a node certificate requires creating a new node key and certificate and reloading them on the node. Reloading the certificate involves uploading the node key and certificate to the node, rescanning the certs directory, and using the new node certificate in the directory:

### Step 1. Create a new node certificate and key

Suppose your existing CA and node certificates are stored in the `certs` directory, and your CA key is stored in a directory called `my-safe-directory`. Because the node certificate and key already exist, use the `--overwrite` flag to overwrite both certificate and key. Specify all addresses at which node can be reached:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-node \
[node-hostname] \
[node-other-hostname] \
[node-yet-another-hostname] \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key \
--overwrite
~~~ 
	
### Step 2. Upload the node certificate and key to the node

{% include copy-clipboard.html %}
~~~ shell
# Upload the node certificate and key:
$ scp certs/node.crt \
certs/node.key \
<username>@<node address>:~/certs
~~~

### Step 3. Reload the node certificate

To rescan the certs directory and use the new node certificate without restarting the node, issue a `SIGHUP` signal to the cockroach process:
	
{% include copy-clipboard.html %}
~~~ shell
pkill -SIGHUP -x cockroach
~~~

The `SIGHUP` signal must be sent by the same user running the process (for example: run with `sudo` if cockroach is running under user `root`).	

### Step 4. Check if the certificate rotation was successful

You can check if the node certificate rotation was successful by accessing the **Local Node certificates** page on the CockroachDB Admin UI. 

[Access the CockroachDB Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) from the node and navigate to the local node certificates page, `https://<http-host value>:<http-port value>/#/reports/certificates/local`. The page displays the CA and node certificate details. Scroll to the node certificate details and check if the **Valid Until** field shows the new certificate expiration time.

## Rotating the CA Certificate 

As described [earlier](rotate-certificates.html#how-cockroachdb-security-certificates-work), the node and client certificates are signed by the CA certificate, and the CA certificate and node/client certificates are uploaded to each node and client. While establishing an inter-node or client-node communication, the nodes and clients use the CA certificate to verify each other's identity. Thus all nodes and clients need to have the same CA certificate uploaded to them; else they cannot verify each other's identity. Hence rotating CA certificate also requires rotating node and client certificates. The process to rotate CA certificate is then as follows:

- Rotating the CA certificates: CockroachDB creates a new CA key and a [combined CA certificate](rotate-certificates.html#why-cockroachdb-creates-a-combined-ca-certificate). The combined CA certificate contains the new CA certificate followed by the old CA certificate. Upload the combined CA certificate to each node and client. Rescan the certs directory on the nodes and restart the clients to use the combined CA certificate for verifying identities during inter-node and client-node communications. See [Why CockroachDB creates a combined CA certificate](rotate-certificates.html#why-cockroachdb-creates-a-combined-ca-certificate) for a detailed explanation.

- Rotating the node and client certificates: CockroachDB creates the new node and client certificates signed with the new CA certificate. Upload the new node and client certificates to the respective nodes and clients. Rescan the certs directory on the nodes and restart the clients to use the new certificates for verifying identities during inter-node and client-node communications. We recommend that you rotate the CA certificates in advance, and rotate the node and client certificates only when you are confident all the nodes and client have the combined CA uploaded to them. See [Why rotate CA certificate in advance](rotate-certificates.html#why-rotate-ca-certificates-in-advance) for a detailed explanation.

### Step 1. Create new CA key and certificate and append it to existing CA certificate:

Suppose your existing CA and node certificates are stored in the `certs` directory, and your CA key is stored in a directory called `my-safe-directory`. 

To rotate the CA certificate, first rename the existing CA key:

{% include copy-clipboard.html %}
~~~ shell
$ mv  my-safe-directory/ca.key my-safe-directory/ca.old.key
~~~

Then use the `--overwrite` flag to create a new CA certificate and key. 

{% include copy-clipboard.html %}
~~~ shell
$ cockroach cert create-ca \
--certs-dir=certs \
--ca-key=my-safe-directory/ca.key \
--overwrite
~~~

This results in the [combined CA certificate](rotate-certificates.html#why-cockroachdb-creates-a-combined-ca-certificate), `ca.crt`, which contains the new certificate followed by the old certificate. 

{{site.data.alerts.callout_danger}}The CA key is never loaded automatically by cockroach commands, so it should be created in a separate directory, identified by the --ca-key flag.{{site.data.alerts.end}}

### Step 2. Upload new CA certificate to all nodes and clients:

{% include copy-clipboard.html %}
~~~ shell
# Upload the CA certificate to the node
$ scp certs/ca.crt 
<username>@<node1 address>:~/certs
~~~

Repeat for all nodes.

Upload the CA certificate to all clients using your preferred method.

### Step 3. Reload the CA certificate on the node without restarting the nodes, and restart all clients:

To rescan the certs directory and use the new CA certificate without restarting the node, issue a `SIGHUP` signal to the cockroach process:
		
{% include copy-clipboard.html %}
~~~ shell
pkill -SIGHUP -x cockroach
~~~

The `SIGHUP` signal must be sent by the same user running the process (For example: run with `sudo` if cockroach is running under user `root`).	

Also restart all clients.

### Step 4. Check if the certificate rotation was successful

You can check if the certificate rotation was successful by accessing the **Local Node certificates** page on the CockroachDB Admin UI from any node. 

[Access the CockroachDB Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui) from any node and navigate to the local node certificates page, `https://<http-host value>:<http-port value>/#/reports/certificates/local`. If the certificate rotation is successful, the details of old as well as new CA certificates are displayed. Check if the **Valid Until** field of the new CA certificate shows the new certificate expiration time.

### Step 5. Rotate node and client certificates

Rotate the node and client certificates only when you are confident all nodes and clients have the new CA certificate.

To rotate node certificates, see [Rotate Node Certificates](rotate-certificates.html#rotating-node-certificates).
To rotate client certificates, see [Rotate Client Certificates](rotate-certificates.html#rotating-client-certificates).

### Why CockroachDB creates a combined CA certificate

On rotating the CA certificate, the nodes have the new CA certificate after certs directory is rescanned, and the clients have the new CA certificates as and when they are restarted. However, until the node and client certificates are rotated, the nodes and client certificates are still signed with the old CA certificate. Thus the nodes and clients are unable to verify each other's identity using the new CA certificate. 

To overcome the issue, we take advantage of the fact that multiple CA certificates can be active at the same time. While verifying the identity of another node or a client, they can check with multiple CA certificates uploaded to them. Thus instead of creating only the new certificate while rotating the CA certificates, CockroachDB creates a combined CA certificate that contains the new CA certificate followed by the old CA certificate. As and when node and client certificates are rotated, the combined CA certificate is used to verify old as well as new node and client certificates.
 
### Why rotate CA certificates in advance 

On rotating node and client certificates after rotating the CA certificate, the node and client certificates are signed using new CA certificates. The nodes use the new node and CA certificates as soon as the certs directory on the node is rescanned. However, the clients use the new CA and client certificates only when the clients are restarted. Thus node certificates signed by the new CA certificate are not accepted by clients that do not have the new CA certificate yet. To ensure all nodes and clients have the latest CA certificate, rotate CA certificates on a completely different schedule; ideally, months before changing the node and client certificates. 

## See Also

- [Create Security Certificates](create-security-certificates.html): Learn more about creating security certificates
- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)
