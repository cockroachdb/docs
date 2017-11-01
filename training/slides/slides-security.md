# Goals

Create security certificates - https://www.cockroachlabs.com/docs/stable/create-security-certificates.html

# Presentation

/----------------------------------------/

## Security

SSL encryption for in-flight data is crucial; let's see how to secure a cluster.

/----------------------------------------/

## Agenda

- Security Overview
- SSL Certificate Requirements
- Generate SSL Certificates w/ `cockroach`
- Cloud Deployment Requirements

/----------------------------------------/

## Security Overview

Cloud deployments of CockroachDB require SSL
- Without SSLs to authenticate clients, anyone can connect to your cluster as root
- Supports any SSL tool (OpenSSL), but also includes built-in CA tool

CockroachDB does not currently encrypt data on disk

/----------------------------------------/

## SSL Certificate Requirements

- A certificate authority (CA) to sign all certificates
- One node certificate per CockroachDB node
- One client cert per client

/----------------------------------------/

## Generate Certificates with `cockroach`

### Overview

1. Using the `cockroach cert` command, you create a CA certificate and key and then node and client certificates that are signed by the CA certificate. Since you need access to a copy of the CA certificate and key to create node and client certs, it's best to create everything in one place.

2. You then upload the appropriate node certificate and key and the CA certificate to each node, and you upload the appropriate client certificate and key and the CA certificate to each client.

3. When nodes establish contact to each other, and when clients establish contact to nodes, they use the CA certificate to verify each other's identity.

/----------------------------------------/

## Generate Certificates with `cockroach`

### Certificate Authority

~~~ shell
$ cockroach cert create-ca --ca-key=${HOME}/.cockroach-certs/ca.key
~~~

After creating the CA, you will need to reference it to generate all of your node and client certificates

/----------------------------------------/

## Generate Certificates with `cockroach`

### Node Certificates

Ideally, you want each node certificate to have the same name (`node.crt` and `node.key`), which makes all of the commands you use to start the same.

1. Generate the certificate and key files:

    ~~~ shell
    cockroach cert create-node \
    [node1 common name 1] \
    [node1 common name 2] \
    --ca-key=${HOME}/.cockroach-certs/ca.key
    ~~~

2. Upload `node.crt` and `node.key` to node1.

3. Repeat step 1, but using node2's common names.

4. Upload `node.crt` and `node.key` to node2.

5. Repeat.

/----------------------------------------/

## Generate Certificates with `cockroach`

### Client Certificates

~~~ shell
cockroach cert create-client \
[username] \
--ca-key=${HOME}/.cockroach-certs/ca.key
~~~

/----------------------------------------/

## Certificate File Rotation

...

/----------------------------------------/

# Lab