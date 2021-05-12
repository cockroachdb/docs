---
title: Use Auto TLS (alpha) to generate security certificates
summary: Let CockroachDB handle TLS cert creation for encrypted inter-node and client-node communication.
toc: true
---

To secure your CockroachDB cluster's inter-node and client-node communication, you need to provide a Certificate Authority (CA) certificate that has been used to sign keys and certificates (SSLs) for:

- Nodes
- Clients
- Optionally: the DB Console and Cluster API

{{site.data.alerts.callout_info}}
This feature is an alpha release in CockroachDB v21.1 with core functionality that may not yet meet your requirements. Planned enhancements in future versions include:

- Auto TLS cert generation when adding nodes to an existing cluster, though cert generation for new nodes is already possible using `cockroach cert` on clusters that initially used Auto TLS.
- Support for cross-region deployments (cases where not all nodes are on the same subnet, and the listening and advertised addresses are different).
- Identification of misconfigurations leading to helpful error messages.
- Other CLI instructions and feedback.
{{site.data.alerts.end}}

With Auto TLS, your cluster creates the CA (certificate authority) required for secure communication with other nodes and clients and then securely distributes it among the nodes. The cluster also creates the certificates that nodes require to connect to other nodes.

To receive all certificates, each node must be started with the same secure token that you provide. This simplifies the default cluster creation process. Rather than requiring an operator to generate and distribute cert files, each node only requires this single token string that you will include as part of a one-time `cockroach connect` command.

{{site.data.alerts.callout_info}}
To create client certificates, you will still need to run [`cockroach cert create-client`](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) or the equivalent [OpenSSL commands](create-security-certificates-openssl.html#step-3-create-the-certificate-and-key-pair-for-the-first-user).
{{site.data.alerts.end}}

## Step 1: Configure nodes

The example commands below must be tailored for your environment and run for each node. In a production environment, this would typically require running the commands once on each machine for the single node that each one hosts. However, these examples depict multiple nodes running on                a single machine, varying their ports rather than their hosts.

1. For each node, ensure that the machine has a directory for the node to use to store cert files.

  ``` shell
  cd node1
  mkdir certs
  ```

2. For each node, run `cockroach connect`, specifying the initial number of nodes and the address and ports that each will use.

  ``` shell
  cockroach connect --listen-addr=localhost:26257 --certs-dir=certs --num-expected-initial-nodes 3 \
  --init-token=<secret> --join=localhost:26258,localhost:26259
  ```

This process will not terminate until the cluster and all its nodes have initialized.

3. Run `cockroach start` for each node from within the directory where you want node data to be stored. This starts the node, but does not yet initialize the cluster.

  ```
  cockroach start --listen-addr=localhost:26257 --certs-dir=certs \
  --join=localhost:26258,localhost:26259 --http-addr=localhost:8080
  ```

## Step 2: Create client certs

On any node’s machine, create client keys to securely distribute for cluster administration.

``` shell
cockroach cert create-client root --ca-key=certs/ca.key --certs-dir=certs
```

{{site.data.alerts.callout_info}}
After using the root user to create additional users, distribute certs for additional users using the principle of least privilege.
{{site.data.alerts.end}}

## Step 3: Initialize the cluster

``` shell
cockroach init --certs-dir=certs --host=localhost:26257`
```
