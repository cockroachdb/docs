---
title: Rotate Security Certificates
summary: Rotate the security certificates of a secure CockroachDB cluster by generating and reloading new certificates.
toc: false
---

<span class="version-tag">New in v1.1:</span> CockroachDB allows you to rotate security certificates without restarting the nodes. 

<div id="toc"></div>

## How CockroachDB Security Certificates Work

A secure CockroachDB cluster uses [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) for encrypted inter-node and client-node communication and requires CA, node, and client certificates and keys:

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate
`client.<user>.crt` | Client certificate for `<user>` (eg: `client.root.crt` for user `root`)
`client.<user>.key` | Key for the client certificate

The node and client certificates are signed by the CA certificate. 

For each node, the CA certificate, node certificate, and node keys are uploaded to certs directory on the node. For each client, the CA certificate, client certificate, and client keys are uploaded to the client. 

While establishing an inter-node or client-node communication, the nodes and clients use the CA certificate to verify each other's identity. 

For more information, see [Create security certificates](create-security-certificates.html).

## When to Rotate Certificates

You may need to rotate the node, client, or CA certificates in the following scenarios:

- The node, client, or CA certificates are expiring soon. 
- Your organization's compliance policy may require periodical certificate rotation.
- The key (for the node, client, or CA) is compromised.
- You add a new load balancer and need to update the node certificates with the load balancer names and IP addresses. In this case, you need to rotate only the node certificates.

## Rotating Client Certificates

To rotate a client certificate, [generate a new client certificate](create-security-certificates.html#create-the-certificate-and-key-pair-for-a-client), upload it to the client using your preferred method, and restart the client.

## Rotating Node Certificates 

Rotating a node certificate requires generating a new node certificate and reloading the certificate on the node. Reloading the certificate involves uploading the node certificate to the node and rescanning the certs directory and using the new node certificate in the directory:

1. Generate new node certificate and key

	
	Because the node certificate and key already exist, use the `--overwrite` flag to overwrite both certificate and key. Also specify all addresses at which node can be reached:

	~~~ shell
	$ cockroach cert create-node \
	 [node-hostname] \
	 [node-other-hostname] \
	 [node-yet-another-hostname] \
	 --certs-dir=[path-to-certs-directory] \
	 --ca-key=[path-to-ca-key] \
	 --overwrite
	~~~ 
	
2. Upload the certificate and key to the node

	~~~ shell
	# Upload the node certificate and key:
	$ scp certs/node.crt \
	certs/node.key \
	<username>@<node1 address>:~/certs
	~~~

3. Reload the node certificate

	To make a running node rescan the certificates directory and use the new certificates without restarting the node, issue a `SIGHUP` signal to the cockroach process:
	
	~~~ shell
	pkill -SIGHUP -x cockroach
 	~~~

	The `SIGHUP` signal must be sent by the same user running the process (eg: run with `sudo` if cockroach is running under user `root`).	

## Rotating CA Certificate 

As mentioned [earlier](certificate-rotation.html#how-cockroachdb-security-certificates-work), the node and client certificates are signed by the CA certificate. For each node, the CA certificate, node certificate, and node keys are uploaded to the node. For each client, the CA certificate, client certificate, and client keys are uploaded to the client. While establishing an inter-node or client-node communication, the nodes and clients use the CA certificate to verify each other's identity. 

Consider an inter-node communication between two nodes: Node1 and Node2. Node1 checks that the node certificate for Node2 is signed by the same CA certificate as present on Node1, and vice versa for Node2. This is also true for client-node communication. Thus all nodes and clients need to have the same CA certificate uploaded to them, else they cannot verify each other's identity during inter-node or client-node communication. Hence rotating CA certificate also requires rotating node and client certificates. The process to rotate CA certificate is then as follows:

- Rotating the CA certificates: CockroachDB generates a new CA key and a [combined CA certificate](certificate-rotation.html#why-cockroachdb-generates-a-combined-ca-certificate). The combined CA certificate contains the new CA certificate followed by the old CA certificate. The combined CA certificate is uploaded to each node and client. The certs directory on the nodes is rescanned and the clients restarted to use the combined CA certificate for verifying identities during inter-node and client-node communications. 
- Rotating the node and client certificates: CockroachDB generates new node and client certificates signed with the new CA certificate. The new node and client certificates are uploaded to the respective nodes and clients. The certs directory on the nodes is rescanned and the clients restarted to use the new certificates for verifying identities during inter-node and client-node communications. We highly recommend that you rotate the CA certificates in advance, and rotate the node and client certificates only when you are confident all the nodes and client have the combined CA uploaded to them. See [Why rotate CA certificate in advance](certificate-rotation.html#why-rotate-ca-certificates-in-advance) for detailed explanation.

### Why CockroachDB generates a combined CA certificate

After completing this process, the nodes have the new CA certificate, and the clients have the new CA certificates as and when they are restarted. But the nodes and client certificates are still signed with the old CA certificate. Thus the nodes and clients are unable to verify each other's identity during inter-node or client-node communication. 

To overcome the issue, we take advantage of the fact that multiple CA certificates can be active at the same time. The node and client certificates can be signed with only the latest CA certificate, but while verifying the identity of another node or a client, they can check with multiple CA certificates uploaded to them. Thus instead of creating only the new certificate while rotating the CA certificates, CockroachDB creates a combined CA certificate that contains the new CA certificate followed by the old CA certificate. As and when node and client certificates are rotated, the combined CA certificate is used to verify old as well as new node and client certificates.
 
### Why rotate CA certificates in advance 

Going back to the CA certificate rotation process, the second step of the process involves rotating the node and client certificates. This involves signing the node certificates with new CA certificates. These new node certificates are uploaded to the nodes as soon as the certs directory on the node is rescanned. But the clients will get their new client certificates signed with the new CA certificates only when they are restarted. The clients won't even have the new CA certificates till they are restarted. Thus node certificates signed by the new CA certificate will not be accepted by clients that do not have the new CA certificate yet. To ensure all nodes and clients have the latest CA certificate, change CA certificates on a completely different schedule, for instance, months before changing the node and client certificates. 

## Steps to rotate CA certificate

### Step 1: Generate new CA certificate and append it to existing CA certificate:

To rotate CA certificates, use the `--overwrite` flag to generate a new CA certificate and key. 

~~~ shell
$ cockroach cert create-ca --certs-dir=certs --ca-key=ca.new.key --overwrite 
~~~

Flags:

* `--ca-key=ca.new.key`: path to the new key to generate. To re-use the existing key (not recommended), use `--ca-key=ca.key` and `--allow-key-reuse`. Reusing the old key is possible, but not recommended. For security reasons, it is considered good practice to rotate keys on a regular basis.
* `--overwrite`: add the new certificate to the existing `ca.crt` file.

This results in a `ca.crt` containing the new certificate followed by the old certificate. 

### Step 2: Upload new CA certificate to all nodes and clients:

~~~ shell
# Upload the CA certificate to the node
$ scp certs/ca.crt 
<username>@<node1 address>:~/certs
~~~

Repeat for all nodes.

Upload the CA certificate to all clients using your preferred method.

### Step 3: Reload CA certificate on the node without restarting the nodes, and restart all clients:

For each node, issue a `SIGHUP` signal to the cockroach process. This makes a running node rescan the certificates directory and use the new certificates without restarting:
		
~~~ shell
pkill -SIGHUP -x cockroach
~~~

The `SIGHUP` signal must be sent by the same user running the process (eg: run with `sudo` if cockroach is running under user `root`).	

Also restart all clients.

### Step 4: Rotate node and client certificates

We recommend that you rotate the node and client certificates only when you are confident all nodes and clients have the new CA certificate.

To rotate node certificates, see [Rotate Node Certificates](certificate-rotation.html#rotating-node-certificates).
To rotate client certificates, see [Rotate Client Certificates](certificate-rotation.html#rotating-client-certificates).

## See Also

- [Create Security Certificates](create-security-certificates.html): Learn more about creating security certificates
- [Manual Deployment](manual-deployment.html): Walkthrough starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](start-a-node.html): Learn more about the flags you pass when adding a node to a secure cluster.
- [Other Cockroach Commands](cockroach-commands.html)
