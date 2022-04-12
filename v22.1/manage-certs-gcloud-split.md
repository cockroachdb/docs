---
title: Using Google Cloud Platform to implement a Split-CA PKI
summary: Using Google Cloud Platform to manage PKI in a spit-CA deployment
toc: true
docs_area: manage.security
---



This tutorial walks the user through implementing a split-CA Private Key Infrastruture (PKI) for a CockroachDB Cluster, i.e. a  a private key infrastructure (PKI) split between an internal-to-the-cluster root CA (used only for internode communication) and an external-to-the-cluster root CA for connections to the cluster from external clients.

prerequisites:

Node names and addresses for three compute nodes that will house the cluster, and an external IP addres such as a TCP load balancer

```
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/cockroach-cluster.env %}
```

## Provision a CRDB cluster root CA for internode communication

I mean do we just  pick a node and call it the CA node and do `cockroach cert` stuff there and SCP between nodes in the cluster? that has the advantage of consolidated IAM and limited moving around... but you probably don't really want it actually on one of the nodes... except in this case do you? it'll only ever be used on the nodes so why have it elsewhere? it's no good elsewhere and the nodes are no good if it isn't there

The CA node needs SCP access, that's all... limited IAM SCP access... Talk  to Catherine about this


## Provision a CRDB client CA for client-to-cluster communication

Let's begin by provisioning a Certificate Authority (CA) for managing CRDB. In a realistic scenario, this CA would itself be subordinate to an organizational root CA, but in this case we will make it a self-signed root CA.

We will use [Google CA Service](https://console.cloud.google.com/security/cas) to perform most operations.

### Create a roach test client-CA Pool

In GCP, CAs are organized into CA pools. Signing requests are issued by default to a CA pool rather than a particular CA. Create a CA pool.

~~~shell
gcloud privateca pools create roach-test-client-CA-pool

Creating CA Pool....done.
Created CA Pool [projects/noobtest123/locations/us-east1/caPools/roach-test-pool].
~~~

Either:
- A: Create a *root* client-CA *solely for use in development*, as shown here.
- B: Create a subordinate client-CA by issuing a certificate signing request (CSR) to your organization's CA administrators.

### Create your roach test client-CA

#### Option A: Create a root CA for CRDB clients (only suitable for development)

to create a root CA to use for your whole cluster, called RoachTestSubCA. Answer `y` to enable the CA

```
gcloud privateca roots create roach-test-ca \
--pool=roach-test-ca-pool \
--subject="CN=roach-test-ca, O=RoachTestMegaCorp"

Creating Certificate Authority....done.
Created Certificate Authority [projects/noobtest123/locations/us-central1/caPools/roach-test-CA-pool/certificateAuthorities/roach-test-ca].
The CaPool [roach-test-CA-pool] has no enabled CAs and cannot issue any certificates until at least one CA is enabled. Would
you like to also enable this CA?

Do you want to continue (y/N)?  y

Enabling CA....done.
```
#### Option B: Create a subordinate CA for CRDB

If your organizational CA is managed with Google Certificate Authority Service, you can request a subordinate CA from the [GCP CAS Console](https://console.cloud.google.com/security/cas/certificateAuthorities).

Otherwise, you must create a subordinate certifcate authority by [submitting a certificate signing request (CSR)](https://cloud.google.com/certificate-authority-service/docs/requesting-certificates#use-csr) to your organizational certificate authority.

View the CA in the GCP CAS console and ensure that its status is set to **enabled**.



## Issue and provision node keys and certificates

### Create a private key and public certifiate for each node in the cluster.

!!! what should the validity duration be?

~~~shell
gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node1/node.key \
  --cert-output-file node1/node.crt \
  --dns-san "$node1name,localhost" \
  --ip-san "$node1addr,$ex_ip" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node2/node.key \
  --cert-output-file node2/node.crt \
  --dns-san "$node2name,localhost" \
  --ip-san "$node2addr,$ex_ip" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool roach-test-node-ca-pool \
  --generate-key \
  --key-output-file node3/node.key \
  --cert-output-file node3/node.crt \
  --dns-san "$node3name,localhost" \
  --ip-san "$node3addr,$ex_ip" \
  --subject "CN=node"
~~~

### Propagate key pairs to the nodes.

~~~shell
gcloud compute ssh $node1name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node1/node.* ${node1name}:~/certs

gcloud compute ssh $node2name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node2/node.* ${node2name}:~/certs

gcloud compute ssh $node3name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node3/node.* ${node3name}:~/certs
~~~

### Provision the CA's public cert on the nodes

Download the CA's pulic cert into a file called `ca.cert`. If it is a self-signed cert, you can download it from the [GCP console](https://console.cloud.google.com/security/cas/), otherwise you must obtain it from your organization's CA.

~~~shell
gcloud compute scp certs/ca.crt ${node1name}:~/certs
gcloud compute scp certs/ca.crt ${node2name}:~/certs
gcloud compute scp certs/ca.crt ${node3name}:~/certs
~~~

### Start and Initialize the cluster

```shell
echo "" > start_roach.sh
chmod +x ./start_roach.sh

# Node 1
cat <<~~~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node1addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~~~

gcloud compute scp ./start_roach.sh $node1name:~

# Start Node 2
cat <<~~~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node2addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~~~

gcloud compute scp ./start_roach.sh $node2name:~

# Start Node 3
cat <<~~~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node3addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~~~

gcloud compute scp ./start_roach.sh $node3name:~

run the start scripts

```shell
function install_roach_on_node {

    gcloud compute ssh $1 --command 'if [[ ! -e cockroach-v21.2.4.linux-amd64 ]];
    then
        echo "roach not installed"
        sudo curl https://binaries.cockroachdb.com/cockroach-v21.2.4.linux-amd64.tgz | tar -xz
        sudo cp -i cockroach-v21.2.4.linux-amd64/cockroach /usr/local/bin/
        sudo mkdir -p /usr/local/lib/cockroach
        sudo cp -i cockroach-v21.2.4.linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/
        sudo cp -i cockroach-v21.2.4.linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/
    else
        echo "roach already installed"
    fi'
}

function start_roach_node {
    gcloud beta compute ssh --command 'chmod +x start_roach.sh && ./start_roach.sh' \
    $1
}

install_roach_on_node $node1name
start_roach_node $node1name &

install_roach_on_node $node2name
start_roach_node $node2name &

install_roach_on_node $node3name
start_roach_node $node3name &
```


## Issue and Provision Client Certificates

~~~shell
gcloud privateca certificates create \
  --issuer-pool roach-test-client-ca-pool \
  --generate-key \
  --key-output-file client.root.key \
  --cert-output-file client.root.crt \
  --subject "CN=root"
~~~

## Connect your Client

Use this to issue a signing cert for the cluster