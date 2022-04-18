---
title: Using Google Cloud Platform to manage PKI certificates
summary: Using Google Cloud Platform to manage PKI certificates
toc: true
docs_area: manage.security
---

This tutorial walks the user through implementing [private key infrastructure (PKI)](security-reference/transport-layer-security.html) for a {{ site.data.products.core }} cluster deployed in Google Cloud Platform (GCP). PKI involves careful management of the certificates used for authentication and encryption in network traffic between servers and clients.

**Goals**:

- Get a CockroachDB cluster running in Google Cloud Platform.
- Provision two root certificate authorities (CAs), one for issuing certificates for internode communication, and one for issuing certificates for SQL client connections.
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

## The approach: Cloud native, short credential life-cycle

PKI can be implemented in many ways; key pairs can be generated and certificates signe with open-source tools such `openssl` or even with the CockroachDB CLI, or with myriad available tools and services. The distribution of those credentials to servers and clients can be done in even more different possible ways.

### Cloud native
The solution demonstrated here consolidates the tasks within services offered by Google Cloud Platform (GCP), and which can be scripted using `gcloud`, the GCP command line interface (CLI).

This implementation has the advantage of making full use of GCP's strong general security, and in particular, their strong IAM model. By managing CA operations, network and compute resource access, and secrets access in Google cloud, we can confidently manage access according to the [principle of least privelege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), ensuring best security.

The work described here can be divided up into three chunks, each of which might well correspond to a seperate IAM role containing the required privileges:

role | tasks | permissions
----|------|-------
CA Admin | <ul><li>Manage CA lifycyle</li><li>Issue node certificates</li><li>Issue client certificates</li></ul>| <ul><li>CA owner</li><li>Node secrets create/write</li><li>Client secrets create/write</li></ul>
Node Operator | <ul><li>Install, configure and run CockroachDB and dependencies on nodes</li></ul>| <ul><li>Node SSH access</li><li>Node secrets read access</li></ul>
Client Operator | <ul><li>Install, configure and run CockroachDB and dependencies on clients</li></ul>| <ul><li>Client SSH access</li><li>Client secrets read access</li></ul>

### Short-lived credentials

What happens if a credential, such as a private key for a server or a client, is compromised? A PKI implementation must deal with this in one of two ways:

- By implementation a revocation mechanism, either Certificate Revocation Lists (CRLS) or the Online Certificate Status Protocol.
- By issuing only certificates with short validity durations, so that any compromised certificate quickly becomes unusable. 

CockroachDB does support OCSP, but not CRls. See: [Using Online Certificate Status Protocol (OCSP) with CockroachDB](manage-certs-revoke-ocsp.html).

Without OCSP, there is a premium on enforcing short validity durations for certificates; otherwise, stolen credentials may be used to work persistent mischief over a long window.

The approach taken here is intended to be automation friendly. Users should consider automating PKI-related operations to reduce latency and ease repition, hence reducing the time-cost of frequently issuing fresh certificates.

For example, a broad baseline recommendation might be to issue new certificates daily, keeping the validity duration under two days.

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


## Create certificate authorities (CA admin role) 

In GCP, CAs must be organized into certificate authority pools. By default, signing requests are targeted to a CA pool rather than an individual CA.

Create a CA pool and then a single CA each for your nodes and clients.

Respond `y` to enable each CA upon creation.

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
Creating CA Pool....done.
Created CA Pool [projects/noobtest123/locations/us-central1/caPools/cucaracha_node_CA_pool].
Creating Certificate Authority....done.
Created Certificate Authority [projects/noobtest123/locations/us-central1/caPools/cucaracha_node_CA_pool/certificateAuthorities/roach-test-ca].
The CaPool [cucaracha_node_CA_pool] has no enabled CAs and cannot issue any
certificates until at least one CA is enabled. Would you like to also enable
this CA?

Do you want to continue (y/N)?  ^[y
Please enter 'y' or 'n':  y

Enabling CA....done.
Creating CA Pool....done.
Created CA Pool [projects/noobtest123/locations/us-central1/caPools/cucaracha_client_CA_pool].
Creating Certificate Authority....done.
Created Certificate Authority [projects/noobtest123/locations/us-central1/caPools/cucaracha_client_CA_pool/certificateAuthorities/roach-test-client-ca].
The CaPool [cucaracha_client_CA_pool] has no enabled CAs and cannot issue any
certificates until at least one CA is enabled. Would you like to also enable
this CA?

Do you want to continue (y/N)?  y

Enabling CA....done.
```


### Create a local secrets directory

We need somewhere to put key and certificate files while we work. Make sure the directory is not under source control; either add it your `.gitignore` or place it in a dedicated directory.

Public certificates are not such an issue if they leak, but private keys for nodes and clients are critical secrets and must be managed with extreme care.

{% include_cached copy-clipboard.html %}
```shell
secrets_dir= #fill you path to your secrets directory
mkdir "${secrets_dir}"
mkdir "${secrets_dir}/certs"
mkdir "${secrets_dir}/$node1name"
mkdir "${secrets_dir}/$node2name"
mkdir "${secrets_dir}/$node3name"
mkdir "${secrets_dir}/clients"
```
## Acquire CA certificates (CA admin role)

### Pull the public certificate from each CA.

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca roots describe roach-test-ca \
--pool $node_CA_pool --format json \
| jq -r '.pemCaCertificates[]' > "${secrets_dir}/certs/ca.crt"

gcloud privateca roots describe roach-test-client-ca \
--pool $client_CA_pool --format json \
| jq -r '.pemCaCertificates[]' > "${secrets_dir}/certs/ca-client.crt"
```

### Use `openssl` to examine the certificates.

{% include_cached copy-clipboard.html %}
```shell
openssl x509 -in "${secrets_dir}/certs/ca.crt"  -text | less
```

### Push the CA certificates to the nodes' trust stores

By adding these certificates to your the trust stores of your cluster's nodes, you allow the nodes to accept authentication from other nodes or clients bearing certificates that CA has signed. The integrity of your cluster depends entirely on the security of the CA. 

{% include_cached copy-clipboard.html %}
```shell
gcloud compute scp ${secrets_dir}/certs/ca.crt ${node1name}:~/certs
gcloud compute scp ${secrets_dir}/certs/ca-client.crt ${node1name}:~/certs

gcloud compute scp ${secrets_dir}/certs/ca.crt ${node2name}:~/certs
gcloud compute scp ${secrets_dir}/certs/ca-client.crt ${node2name}:~/certs

gcloud compute scp ${secrets_dir}/certs/ca.crt ${node3name}:~/certs
gcloud compute scp ${secrets_dir}/certs/ca-client.crt ${node3name}:~/certs
```

## Issue and provision node keys and certificates (CA admin role)

### Create a private key and public certifiate for each node in the cluster.

Note how each certificate is tailored to the node:

- The `extended-key-usages` must include both server and client auth usages; this is because nodes must frequently initiate requests to other nodes in order to maintain cluster synchrony and load-balance work.
- The Subject Alternative Name (SAN) - domain names (DNS) field contains:
  - the instance name assigned by GCP.
  - `localhost` for loopback requests.
- The Subject Alternative Name (SAN) - IP addresses field contains:
  - the IP address of the node on the internal network of your GCP project (so the node can serve at that address  locally, to other nodes).
  - the IP address of your cluster on the external, public internet (so the node can serve at that address publicly, to application servers).

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${secrets_dir}/${node1name}/node.key" \
  --cert-output-file "${secrets_dir}/${node1name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node1name},localhost" \
  --ip-san "${node1addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${secrets_dir}/${node2name}/node.key" \
  --cert-output-file "${secrets_dir}/${node2name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node2name},localhost" \
  --ip-san "${node2addr},${ex_ip}" \
  --subject "CN=node"

gcloud privateca certificates create \
  --issuer-pool $node_CA_pool \
  --generate-key \
  --key-output-file "${secrets_dir}/${node3name}/node.key" \
  --cert-output-file "${secrets_dir}/${node3name}/node.crt" \
  --extended-key-usages "server_auth,client_auth" \
  --dns-san "${node3name},localhost" \
  --ip-san "${node3addr},${ex_ip}" \
  --subject "CN=node"
```

```txt
WARNING: A private key was exported to /tmp/secretos/cockroach-cluster-alpha-18kj/node.key.

Possession of this key file could allow anybody to act as this certificate's
subject. Please make sure that you store this key file in a secure location at
all times, and ensure that only authorized users have access to it.

Created Certificate [projects/35961569477/locations/us-central1/caPools/cucaracha_node_CA_pool/certificates/20220418-V02-05G] and saved it to [/tmp/secretos/cockroach-cluster-alpha-18kj/node.crt].
WARNING: A private key was exported to /tmp/secretos/cockroach-cluster-alpha-rbg8/node.key.

Possession of this key file could allow anybody to act as this certificate's
subject. Please make sure that you store this key file in a secure location at
all times, and ensure that only authorized users have access to it.

Created Certificate [projects/35961569477/locations/us-central1/caPools/cucaracha_node_CA_pool/certificates/20220418-SXZ-HE0] and saved it to [/tmp/secretos/cockroach-cluster-alpha-rbg8/node.crt].
WARNING: A private key was exported to /tmp/secretos/cockroach-cluster-alpha-zdzp/node.key.

Possession of this key file could allow anybody to act as this certificate's
subject. Please make sure that you store this key file in a secure location at
all times, and ensure that only authorized users have access to it.

Created Certificate [projects/35961569477/locations/us-central1/caPools/cucaracha_node_CA_pool/certificates/20220418-WCL-D7F] and saved it to [/tmp/secretos/cockroach-cluster-alpha-zdzp/node.crt].
```

### Write the credentials to the GCP Secrets Manager

{% include_cached copy-clipboard.html %}
```shell
gcloud secrets create "${node1name}-key" \
--replication-policy=automatic --data-file "${secrets_dir}/${node1name}/node.key"
gcloud secrets create "${node1name}-crt" \
--replication-policy=automatic --data-file "${secrets_dir}/${node1name}/node.crt"

gcloud secrets create "${node2name}-key" \
--replication-policy=automatic --data-file "${secrets_dir}/${node2name}/node.key"
gcloud secrets create "${node2name}-crt" \
--replication-policy=automatic --data-file "${secrets_dir}/${node2name}/node.crt"

gcloud secrets create "${node3name}-key" \
--replication-policy=automatic --data-file "${secrets_dir}/${node3name}/node.key"
gcloud secrets create "${node3name}-crt" \
--replication-policy=automatic --data-file "${secrets_dir}/${node3name}/node.crt"
```

```
Created version [1] of the secret [cockroach-cluster-alpha-18kj-key].
Created version [1] of the secret [cockroach-cluster-alpha-18kj-crt].
Created version [1] of the secret [cockroach-cluster-alpha-rbg8-key].
Created version [1] of the secret [cockroach-cluster-alpha-rbg8-crt].
Created version [1] of the secret [cockroach-cluster-alpha-zdzp-key].
Created version [1] of the secret [cockroach-cluster-alpha-zdzp-crt].
```

### Clean up secrets

Be sure to delete the private keys (after they've been copied to the nodes). You may have to respond `y` to over-ride permissions in order to delete the keys.

{% include_cached copy-clipboard.html %}
```shell
rm ${secrets_dir}/${node1name}/node.*
rm ${secrets_dir}/${node2name}/node.*
rm ${secrets_dir}/${node3name}/node.*
```

## Prepare CockroachDB on each node (Node Operator role)

### Install CockroachDB on each node

Download the CockroachDB executable from `binaries.cockroachdb.com`.

{% include_cached copy-clipboard.html %}
```shell
function install_roach_on_node {
    gcloud compute ssh $1 --command 'if [[ ! -e cockroach-v21.2.4.linux-amd64 ]];
    then
        echo "roach not installed; installing roach"
        sudo curl https://binaries.cockroachdb.com/cockroach-v22.1.0-beta.2.linux-amd64.tgz | tar -xz
        sudo cp -i cockroach-v22.1.0-beta.2.linux-amd64/cockroach /usr/local/bin/
        sudo mkdir -p /usr/local/lib/cockroach
        sudo cp -i cockroach-v22.1.0-beta.2.linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/
        sudo cp -i cockroach-v22.1.0-beta.2.linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/
    else
        echo "roach already installed"
    fi'
}

install_roach_on_node $node1name
install_roach_on_node $node2name
install_roach_on_node $node3name
```

```txt
roach not installed; installing roach
roach not installed; installing roach
roach not installed; installing roach
```

### Generate and provision a start script for each node

Note that each start script is node specific, configuring each node to advertise its own IP address to the cluster, and attempt to `join` a specified list of peers at specific IP addresses.

{% include_cached copy-clipboard.html %}
```shell
# for node 1
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

# for node 2
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

# for node 3
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

```shell
start_roach.sh                                                                              100%  156     3.0KB/s   00:00
start_roach.sh                                                                              100%  156     3.0KB/s   00:00
start_roach.sh                                                                              100%  156     3.1KB/s   00:00
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


## Start or reset the cluster (Node Operator role)

### Start the nodes

To start the cluster, execute the pre-provisioned start script.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh --command './start_roach.sh' "${node1name}"
gcloud beta compute ssh --command './start_roach.sh' "${node2name}"
gcloud beta compute ssh --command './start_roach.sh' "${node3name}"
````

### Reset the nodes

To cause an already running cluster to switch to the new credentials, send a `SIGHUP` signal to each node.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh "$node1name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node2name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node3name" --command 'pkill -SIGHUP -x cockroach'
```


## Provision the client (Client Operator role)

### Install CockroachDB

Install Cockroach locally [another way](install-cockroachdb-mac.html) or with docker as follows:

{% include_cached copy-clipboard.html %}
```shell
docker pull cockroachdb/cockroach:latest
```

### Issue a root client certificate

Generate a private key/public certificate pair for the root SQL user.
This is a very powerful private key, as anyone 

{% include_cached copy-clipboard.html %}
```shell
gcloud privateca certificates create \
  --issuer-pool $client_CA_pool \
  --generate-key \
  --extended-key-usages "client_auth" \
  --key-output-file "${secrets_dir}/clients/client.root.key" \
  --cert-output-file "${secrets_dir}/clients/client.root.crt" \
  --subject "CN=root"
```
```txt
WARNING: A private key was exported to /tmp/secretos/clients/client.root.key.

Possession of this key file could allow anybody to act as this certificate's
subject. Please make sure that you store this key file in a secure location at
all times, and ensure that only authorized users have access to it.

Created Certificate [projects/35961569477/locations/us-central1/caPools/cucaracha_client_CA_pool/certificates/20220418-UUY-GMD] and saved it to [/tmp/secretos/clients/client.root.crt].
```

## Intialize the cluster

## Client Operator role: Connect the client to the cluster

Use this to issue a signing cert for the cluster.

{% include_cached copy-clipboard.html %}
```shell
docker run -it cockroachdb/cockroach:latest \
sql --certs-dir="${secrets_dir}/clients/" --host="${ex_ip}"
```
