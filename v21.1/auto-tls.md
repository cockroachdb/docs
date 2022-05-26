---
title: Use Auto TLS (alpha) to generate security certificates
summary: Let CockroachDB handle TLS cert creation for encrypted inter-node and client-node communication.
toc: true
---

To secure your CockroachDB cluster's inter-node and client-node communication, the cluster requires a certificate authority (CA) certificate that is used to sign keys and certificates (SSLs) for:

- Nodes
- Clients
- Optionally: the [DB Console](authentication.html#using-a-public-ca-certificate-to-access-the-db-console-for-a-secure-cluster).

With Auto TLS, your cluster creates the CA (certificate authority) certificate and key pair required for secure communication with other nodes and clients and then securely distributes these among the nodes. The cluster also creates the additional certificates that each node requires to connect to other nodes and enable connections from clients.

{{site.data.alerts.callout_info}}
{% include_cached new-in.html version="v21.1" %} This feature is an alpha release with core functionality that may not yet meet your requirements. Planned enhancements in future versions include:

- Auto TLS cert generation when adding more nodes to an existing cluster, though cert generation for such nodes is already possible using [`cockroach cert`](cockroach-cert.html) on clusters that initially used Auto TLS. Note that relevant example steps in [Start a Local Cluster](secure-a-cluster.html) show a folder name for storing the CA key that may differ from what you have used with Auto TLS, so these may need to be adapted.
- Support for cross-region deployments (cases where not all nodes are on the same subnet, and the listening and advertised addresses are different).
- Identification of misconfigurations leading to helpful error messages, while suppressing unnecessary warnings.
- Additional CLI instructions and feedback.
{{site.data.alerts.end}}

Auto TLS simplifies the default method for [creating secure clusters](secure-a-cluster.html). Rather than manually generating certificates and keys and distributing them to all nodes, you run a one-time `cockroach connect` command for each node, specifying a common token. A CA cert and key are distributed to all nodes, along with all other certificates that nodes require to communicate with other nodes and with clients, all signed by the CA.

{{site.data.alerts.callout_info}}
To create client certificates, you will still need to run [`cockroach cert create-client`](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) or the equivalent [OpenSSL commands](create-security-certificates-openssl.html#step-3-create-the-certificate-and-key-pair-for-the-first-user) and manually distribute these.
{{site.data.alerts.end}}

## Step 1: Configure nodes

The example commands below must be tailored for your environment and run for each node. In a production environment, this would typically require running the commands once on each machine for the single node that each one hosts. However, these examples depict multiple nodes running on a single machine, varying their ports rather than their hosts.

1. For each node, prepare a directory for the node to use to store the generated certificates and keys.

    ~~~ shell
    cd node1
    mkdir certs
    ~~~

    Alternatively, the directory `~/.cockroach-certs` is used, by default, if none is specified in the next step.

2. For each node, run `cockroach connect`. Specify a shared token, certs directory, number of nodes you'll have when starting the cluster, and the address and port on which the node will listen for connections from the others (which defaults to `localhost:26257`).

    For example, for the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach connect \
    --listen-addr=localhost:26257 \
    --num-expected-initial-nodes 3 \
    --certs-dir=certs \
    --init-token={secret}
    ~~~

    The interface responds that it is `waiting for handshake from 2 peers`. The `cockroach connect` process remains active until the specified number of nodes are in communication and the cert distribution is complete.

    Prepare each additional node, specifying the addresses of those to `join` which are awaiting the handshake. 

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach connect \
    --listen-addr=localhost:26258 \
    --num-expected-initial-nodes 3 \
    --join=localhost:26257 \
    --certs-dir=certs \
    --init-token={secret}
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach connect \
    --listen-addr=localhost:26259 \
    --num-expected-initial-nodes 3 \
    --join=localhost:26257,localhost:26258 \
    --certs-dir=certs \
    --init-token={secret}
    ~~~

    Each node displays feedback as it connects to each peer. For example, the first would report:

    ~~~ shell
    waiting for handshake for 2 peers
    trusted peer: 127.0.0.1:26258
    trusted peer: 127.0.0.1:26259
    ~~~

    When the handshakes are successful among all expected nodes, one is automatically selected to generate the certificates and distribute them. It reports that it is `generating` and `sending` a cert bundle to its peers, while the others report that they are `waiting` for and then `receiving` the cert bundle.
    
    Finally, all nodes report `server certificate generation complete`. The `certs-dir` directory on each is populated with all required files.

2. Run [`cockroach start`](cockroach-start.html) for each node. This starts the node, but does not yet initialize the cluster. If testing this process on a single machine, run the following in each node's directory, adjusting the port numbers for each.

  {% include copy-clipboard.html %}
  ~~~ shell
  cockroach start \
  --listen-addr=localhost:26257 \
  --certs-dir=certs \
  --join=localhost:26258,localhost:26259
  --http-addr=localhost:8080
  ~~~

## Step 2: Create a client certificate for the `root` user

On any node's machine, manually [create the certificate and key pair](cockroach-cert.html#create-the-certificate-and-key-pair-for-a-client) for the root user.

{{site.data.alerts.callout_danger}}
Do not share the root cert. In a later step, you can use the root user to create additional administrative users, specifying their privileges. You can then create and securely share their certs, as appropriate, using the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege).
{{site.data.alerts.end}}

~~~ shell
cockroach cert create-client root \
--ca-key=certs/ca.key --certs-dir=certs
~~~

## Step 3: Initialize the cluster

Run [`cockroach-init`](cockroach-init.html).

~~~ shell
cockroach init --certs-dir=certs --host=localhost:26257
~~~

## Step 4: Create additional users to administer the cluster

1. Using the `root` user, log in to the [SQL shell](cockroach-sql.html). [Create additional users](create-role.html#create-a-role-that-can-log-in-to-the-database), specifying role options as [parameters](create-role.html#parameters), or add the users as members of the `admin` role to confer all role options, if appropriate.

2. Create the certificate and key pair for each of the additional users.

    ~~~ shell
    cockroach cert create-client {username} \
    --ca-key=certs/ca.key --certs-dir=certs
    ~~~

3. Securely send each user the certificate and key that matches their username: `client.{username}.crt` and `client.{username}.key`.
