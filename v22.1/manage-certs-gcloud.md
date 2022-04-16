---
title: Using Google Cloud Platform to manage PKI certificates
summary: Using Google Cloud Platform to manage PKI certificates
toc: true
docs_area: manage.security
---

This tutorial walks the user through provisioning a [secure certificate authority (CA) infrastructure](security-reference/transport-layer-security.html) for a {{ site.data.products.core }} cluster deployed in Google Cloud Platform (GCP).

The solution demonstrated here has the advantages of making full use of GCP's strong IAM model. By managing CA operations, network and compute resource access, and secrets access in Google cloud, we can confidently manage access according to the principle of least privelege, ensuring best security.

**Goals**:

- Get a CockroachDB cluster running in Google Cloud Platform.
- Provision 2 root CAs, one for issuing certificates for internode communication, and one for issuing certificates for SQL client connections.
- Issue private key/public certificate pairs for use by the CockroachDB nodes comprising our cluster.
- Use the client CA to issue client credentials.
- Access the cluster.

**Prerequisites**:

- Understand [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](security-reference/transport-layer-security.html).
- Google Cloud Platform (GCP):
	- Create a GCP account and project.
	- Install and configure the Google Cloud CLI (gcloud) and enable [Google CA Service](https://console.cloud.google.com/security/cas).
- Provision [three compute nodes](deploy-cockroachdb-on-google-cloud-platform.html#step-2-create-instances) in a [properly configured network](deploy-cockroachdb-on-google-cloud-platform.html#step-1-configure-your-network).
- Provision either a static IP on one of the nodes, or a load balancer sitting in front of the instance group.

## Create an environment manifest

Collect the network names and IP addresses of these resources, which you should be able to glean from the output of `gcloud compute instances list`

{% include_cached copy-clipboard.html %}
```shell
# cockroach-cluster.env

# replace with names for your node CA and CA pool
export node_CA=cucaracha_node_CA
export node_CA_pool=cucaracha_node_CA_pool

# replace with names for your client CA and CA pool
export client_CA=cucaracha_client_CA
export client_CA_pool=cucaracha_client_CA_pool

# replace with your cluster's static IP
export ex_ip=34.134.15.116

# replace with your compute instance names
export node1name=cockroach-cluster-alpha-18kj
export node2name=cockroach-cluster-alpha-rbg8
export node3name=cockroach-cluster-alpha-zdzp

# replace with your node IP addresses
export node1addr=10.128.0.55
export node2addr=10.128.0.53
export node3addr=10.128.0.54
```

## Prepare CockroachDB on each node

### Install CRDB on each node

{% include_cached copy-clipboard.html %}
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

install_roach_on_node $node1name
install_roach_on_node $node2name
install_roach_on_node $node3name
```

```txt
```

### Generate and provision a start script for each node.

{% include_cached copy-clipboard.html %}
```shell
cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node1addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo
chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node1name:~

# Start Node 2
cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node2addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo
chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node2name:~

cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node3addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo
chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node3name:~

```


### Prepare a trust store directory on each node.


CockroachDB trusts any certificate signed by any CA whose public certificate is in its [**trust store**](security-reference/transport-layer-security.html#trust-store), i.e. its `certs` dir.

Prepare each node by making sure each node has a clear trust store.

{% include_cached copy-clipboard.html %}
```shell
gcloud compute ssh $node1name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute ssh $node2name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute ssh $node3name \
--command 'rm -rf ~/certs && mkdir ~/certs'
```

## Provision certificate authorities

In GCP, CAs must be organized into certificate authority pools. By default, signing requests are targeted to a CA pool rather than an individual CA.

Create a CA pool and then a single CA each for your nodes and clients.

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca pools create $node_CA_pool
gcloud privateca roots create roach-test-ca \
--pool=$node_CA_pool \
--subject="CN=roach-test-ca, O=RoachTestMegaCorp"

gcloud privateca pools create $client_CA_pool
gcloud privateca roots create roach-test-client-ca \
--pool=$client_CA_pool \
--subject="CN=roach-test-client-ca, O=RoachTestMegaCorp"

```

```txt

```
Pull the public certificate from each CA and push both to the trust store on each node.

By adding these certificates to your the trust stores of your cluster's nodes, you allow your cluster to 

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca roots describe roach-test-ca \
--pool $node_CA_pool --format json \
| jq -r '.pemCaCertificates[]' > certs/ca.crt

gcloud compute scp certs/ca.crt ${node1name}:~/certs
gcloud compute scp certs/ca.crt ${node2name}:~/certs
gcloud compute scp certs/ca.crt ${node3name}:~/certs

gcloud privateca roots describe roach-test-client-ca \
--pool $client_CA_pool --format json \
| jq -r '.pemCaCertificates[]' > certs/ca-client.crt

gcloud compute scp certs/ca-client.crt ${node1name}:~/certs
gcloud compute scp certs/ca-client.crt ${node2name}:~/certs
gcloud compute scp certs/ca-client.crt ${node3name}:~/certs
```

```text

```

## Issue and provision node keys and certificates

### Create a private key and public certifiate for each node in the cluster.

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node1name}/node.key" \
  --cert-output-file "${node1name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node1name},localhost" \
  --ip-san "${node1addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node2name}/node.key" \
  --cert-output-file "${node2name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node2name},localhost" \
  --ip-san "${node2addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${node3name}/node.key" \
  --cert-output-file "${node3name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node3name},localhost" \
  --ip-san "${node3addr},${ex_ip}" \
  --subject "CN=node"
```

```txt

```
### Propagate key pairs to the nodes.

{% include_cached copy-clipboard.html %}
```shell
gcloud compute scp ./$node1name/node.* ${node1name}:~/certs
gcloud compute scp ./$node2name/node.* ${node2name}:~/certs
gcloud compute scp ./$node3name/node.* ${node3name}:~/certs
```

## Start the cluster

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh --command './start_roach.sh' $node1name
gcloud beta compute ssh --command './start_roach.sh' $node2name
gcloud beta compute ssh --command './start_roach.sh' $node3name
````

## Provision a client

### Install CockroachDB locally

Install Cockroach locally [another way](install-cockroachdb-mac.html) or with docker as follows:

{% include_cached copy-clipboard.html %}
```shell
docker pull cockroachdb/cockroach:latest
```

### Issue a root client certificate

Issue a 
{% include_cached copy-clipboard.html %}
```shell
gcloud privateca certificates create \
  --issuer-pool $client_CA_pool \
  --generate-key \
  --extended-key-usages "client_auth" \
  --key-output-file client.root.key \
  --cert-output-file client.root.crt \
  --subject "CN=root"
```
```txt

```

## Connect the client to the cluster

Use this to issue a signing cert for the cluster.

{% include_cached copy-clipboard.html %}
```shell
docker run -it cockroachdb/cockroach:latest \
sql --certs-dir=certs --host=${ex_ip}
```
