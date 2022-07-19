---
title: Using HashiCorp Vault to manage PKI certificates
summary: Using Google Cloud Platform Certificate Authority Service to manage PKI certificates
toc: true
docs_area: manage.security
---

This tutorial walks the user through implementing [public key infrastructure (PKI)](security-reference/transport-layer-security.html) using [Vault PKI Secrets Engine](https://www.vaultproject.io/docs/secrets/pki) for a {{ site.data.products.core }} cluster deployed in Google Cloud Platform (GCP).

PKI involves careful management of the certificates used for authentication and encryption in network traffic between servers and clients.

**Goals**:

- Get a CockroachDB cluster running in Google Cloud Platform.
- Provision two root certificate authorities (CAs), one for issuing certificates for internode communication, and one for issuing certificates for SQL client connections.
- Issue private key/public certificate pairs for use by the CockroachDB nodes comprising our cluster.
- Use the client CA to issue client credentials.
- Access the cluster.

**Prerequisites**:

- Understand [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](security-reference/transport-layer-security.html).
- Vault:
  - A Vault Enterprise cluster, perhaps [deployed locally](https://learn.hashicorp.com/tutorials/nomad/hashicorp-enterprise-license?in=vault/enterprise).
  - Sufficient permissions on the cluster to enable secrets engines and create policies, either via the root access token for this cluster or through a [custom policy](https://learn.hashicorp.com/tutorials/vault/policies).
- Google Cloud Platform (GCP):
  - Create a GCP account and project.
  - Install and configure the Google Cloud CLI (gcloud) and enable [Google CA Service](https://console.cloud.google.com/security/cas).

See also:
- [Build your own CA with Vault](https://learn.hashicorp.com/tutorials/vault/pki-engine)


## Intro
### The strategy

PKI can be implemented in many ways; key pairs can be generated and certificates signe with open-source tools such `openssl` or even with the CockroachDB CLI, or with myriad available tools and services. The distribution of those credentials to servers and clients can be done in even more different possible ways.

The key elements of the strategy here are:

- To leverage the strength of Vault's secrets engines to manage the certificates.
- To enforce short validity durations for all issued certificates (eschewing certificate revocation lists or OCSP).

#### Vault secrets

The solution demonstrated here uses HashiCorp Vault as a secrets management platform. This takes advantage of Vault's generally strong security model, and also eases many tasks.

#### Short-lived credentials

If credentials are obtained by malicious actors, they can be used to impersonate (spoof) a client or server, potentially wreaking havoc on any system. Any PKI implementation must deal with this in one of two ways:

- By using a revocation mechanism, so that existing certificates can be invalidated. Two standard solutions are Certificate Revocation Lists (CRLS) and the Online Certificate Status Protocol (OCSP).
- By issuing only certificates with short validity durations, so that any compromised certificate quickly becomes unusable. 

CockroachDB does support OCSP, but not CRls. See: [Using Online Certificate Status Protocol (OCSP) with CockroachDB](manage-certs-revoke-ocsp.html).

Without OCSP, there is a premium on enforcing short validity durations for certificates; otherwise, stolen credentials may be used to work persistent mischief over a long window.

The approach taken here is intended to be automation friendly. Users should consider automating PKI-related operations to reduce latency and ease repition, hence reducing the time-cost of frequently issuing fresh certificates.

For example, a broad baseline recommendation might be to issue new certificates daily, keeping the validity duration under two days.

### The plan
#### Task personas

The work described here can be divided up into three chunks, each of which might be performed by a different person and therefore which require access to different GCP and Vault resources. Each of the three personas will therefore correspond to a GCP service account and a Vault policy.

persona | tasks | Vault permissions | GCP Permissions
----|------|-------|---
`ca-admin` | <ul><li>Manage CA lifycyle</li><li>Issue node certificates</li><li>Issue client certificates</li></ul>| <ul><li>Admin</li></ul>|<ul><li>CA jumpbox access</li><li>Node SSH access</li><li>Client SSH access</li></ul>
`node-operator` | <ul><li>Install, configure and run CockroachDB and dependencies on nodes</li></ul>|   |<ul><li>Node SSH access</li></ul>
`client-operator` | <ul><li>Install, configure and run CockroachDB and dependencies on clients</li></ul>| |<ul><li>Client SSH access</li></ul>

#### Resources 
Our cluster will contain three classes of compute instance:

- The CA administrative jumpbox, where sensitive credentials will be handled and secure operations related to certificate authority performed.
- Three database nodes.
- A client, which could represent, in a more realistic scenario, either an operations jumpbox or an application server.

Additionally, our project's firewall rules must be configured to allow communication between nodes and from client to nodes.

#### Steps

- Step 1. Provision GCP Resources
- Step 2. Provision PKI certificate hierarchy with Vault

## Admin operations

### Provision your GCP resources

1. Create the CA admin jumpbox.

    Specify the ca-admin service account, and grant the `cloud-platform` scope, so that the service account can access the secrets API.


    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute instances create ca-admin-jumpbox \
    --service-account ca-admin@noobtest123.iam.gserviceaccount.com \
    --scopes "https://www.googleapis.com/auth/cloud-platform"
    ```

    ```txt
    Created [https://www.googleapis.com/compute/v1/projects/noobtest123/zones/us-central1-a/instances/ca-admin-jumpbox].
    NAME              ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    ca-admin-jumpbox  us-central1-a  n1-standard-1               10.128.0.59  35.184.145.196  RUNNING
    ```

1. Configure cluster firewall rules

    Our rules will allow nodes to send requests to eachother, and to recieve requests from clients (as specified with tags).

    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute firewall-rules create roach-talk \
      --direction ingress \
      --action allow  \
      --source-tags roach-node,roach-client \
      --target-tags roach-node \
      --rules TCP:26257,TCP:8080
    ```
     
    ```txt
    Creating firewall...done.
    NAME        NETWORK  DIRECTION  PRIORITY  ALLOW               DENY  DISABLED
    roach-talk  default  INGRESS    1000      tcp:26257,tcp:8080        False 
    ``` 

1. Create node instances

    Create three compute instances to use as CockroachDB nodes. Follow the guidelines described [here](deploy-cockroachdb-on-google-cloud-platform.html#step-2-create-instances), and additionally, specify the `node-operator` service account as the managing service account.

    {{site.data.alerts.callout_info}}
    Here we add the network tag 'roach-node', which will allow our firewall rule to apply to the nodes instances.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute instances create roach-node-1 \
    --machine-type=n2-standard-2 \
    --network-interface=network-tier=PREMIUM,subnet=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=roach-node

    gcloud compute instances create roach-node-2 \
    --machine-type=n2-standard-2 --network-interface=network-tier=PREMIUM,subnet=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=roach-node

    gcloud compute instances create roach-node-3 \
    --machine-type=n2-standard-2 --network-interface=network-tier=PREMIUM,subnet=default \
    --scopes=https://www.googleapis.com/auth/cloud-platform \
    --tags=roach-node
    ```

    ```txt
    Created [https://www.googleapis.com/compute/v1/projects/noobtest123/zones/us-central1-a/instances/roach-node-1].
    Created [https://www.googleapis.com/compute/v1/projects/noobtest123/zones/us-central1-a/instances/roach-node-2].
    Created [https://www.googleapis.com/compute/v1/projects/noobtest123/zones/us-central1-a/instances/roach-node-3].
    ```

1. Create the client instance.

    {{site.data.alerts.callout_info}}
    Here we add the network tag 'roach-client', which will allow our firewall rule to apply to the nodes instances.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute instances create roach-client \
    --scopes "https://www.googleapis.com/auth/cloud-platform" \
    --tags=roach-client
    ```

1. Reserve a static IP address for the cluster.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute addresses create roach-point --global --ip-version IPV4
    ~~~
    
    ~~~txt
    Created [https://www.googleapis.com/compute/v1/projects/trestdocs2/global/addresses/roach-point].
    ~~~

1. Fetch the static IP address.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute addresses list
    ~~~
    
    ~~~txt
    NAME         ADDRESS/RANGE  TYPE      PURPOSE  NETWORK  REGION  SUBNET  STATUS
    roach-point  35.241.9.82    EXTERNAL                                    RESERVED
    ~~~

1. List the names and network addresses of your compute instances.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute instances list
    ~~~
    
    ~~~txt
    NAME              ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    ca-admin-jumpbox  us-central1-a  n1-standard-1               10.128.0.2   35.223.61.117   RUNNING
    roach-client      us-central1-a  n1-standard-1               10.128.0.8   34.72.75.145    RUNNING
    roach-node-1      us-central1-a  n2-standard-2               10.128.0.4   34.171.124.137  RUNNING
    roach-node-2      us-central1-a  n2-standard-2               10.128.0.5   35.202.106.229  RUNNING
    roach-node-3      us-central1-a  n2-standard-2               10.128.0.6   35.192.202.186  RUNNING
    ~~~

1. Compile an environment manifest

    Collect the network names and IP addresses of these resources, which you should be able to glean from the output of `gcloud compute instances list`

    For ease of use, save the following in a file, for example called `cockroach-cluster.env`. Then initialize your shell by pasting in the contents or running `source cockroach-cluster.env`. 

    {% include_cached copy-clipboard.html %}
    ```shell

    # replace with your project ID
    export PROJECT_ID=docsrule123

    # replace with your cluster's static IP
    export ex_ip=35.241.9.82

    # replace with your compute instance names and *internal* IP addresses
    export node1name=roach-node-1
    export node1addr=10.128.0.4

    export node2name=roach-node-2
    export node2addr=10.128.0.5

    export node3name=roach-node-3
    export node3addr=10.128.0.6    
    ```

### Provision the certificate authority (CA) with Vault

#### Step 1: Access and prepare the CA admin jumpbox.

The operations in this section fall under the persona of `ca-admin`, and therefore require admin Vault access and ssh access to the CA admin jumpbox.

1. SSH onto the CA admin jumpbox.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute ssh ca-admin-jumpbox 
    ~~~

1. Initialize your shell inside the jumpbox with your cluster information by running the contents of your `cockroach-cluster.env` file.

1. Create a secrets directory on the jumpbox

    We need somewhere to put key and certificate files while we work. By working on the secure CA jumpbox, which can be carefully gated behind IAM policies controlling SSH access, we minimize the risk of leaking a sensitive credential. Remember that credentials can be leaked other ways&mdash;for example by printing out a private key or plain-text password to your terminal in a public place where a camera is pointed at your laptop's screen.

    Public certificates are not such an issue if they leak, but private keys for nodes and clients are critical secrets and must be managed with extreme care.

    {% include_cached copy-clipboard.html %}
    ```shell

    export secrets_dir="/tmp/secrets" # replace with desired path to secrets directory
    mkdir "${secrets_dir}"
    mkdir "${secrets_dir}/certs"
    mkdir "${secrets_dir}/$node1name"
    mkdir "${secrets_dir}/$node2name"
    mkdir "${secrets_dir}/$node3name"
    mkdir "${secrets_dir}/clients"
    ```
1. [Install vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install) on the jumpbox, following the instructions for **Ubuntu/Debian** Linux.

1. Initialize your shell for Vault on the jumpbox

    Go to the [HCP console](https://portal.cloud.hashicorp.com), choose Vault from the **Services** menu and then select your cluster.

    Find the **Public Cluster URL** for your Vault cluster, and set it as the `VAULT_ADDR` environment variable in your shell.

    Generate an admin token by clicking **Generate token**, and set it as the `VAULT_TOKEN` environment variable.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export VAULT_ADDR= # your Vault cluster's Public URL
    export VAULT_TOKEN= # your Vault token
    export VAULT_NAMESPACE="admin"
    ~~~

1. Authenticate with the admin token 

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault login $VAULT_TOKEN
    ~~~

#### Step 2. Create the certificate authority

1. Create a PKI secrets engine to serve as your CA

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable -path=cockroach_cluster_ca pki
    ~~~

    ~~~txt
    Success! Enabled the pki secrets engine at: cockroach_cluster_ca/
    ~~~

1. Set a maximum validity duration for certificates signed by your CAs

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets tune -max-lease-ttl=48h cockroach_cluster_ca
    ~~~

    ~~~txt
    Success! Tuned the secrets engine at: cockroach_cluster_ca/
    ~~~

1. Generate a root credential pair for the CA. Certificates created with this CA/secrets engine will be signed with the private key generated here. 

    {{site.data.alerts.callout_info}}
    Note that the CA private key cannot be exported from Vault, preventing it from being leaked and used to issue fraudulent certificates.

    The CA public certificate is downloaded in the resulting JSON payload. We'll need provision the CA public certificate to each nodes and client, so they can use it to validate the trust chain of each-other's certificates when performing [TLS authentication](security-reference/transport-layer-security.html).

    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write cockroach_cluster_ca/root/generate/internal ttl=87600h --format=json > "${secrets_dir}/certs/cockroach_cluster_ca.json"
    ~~~

1. Parse the CA's public certificate from the corresponding JSON payload.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${secrets_dir}/certs/cockroach_cluster_ca.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/certs/cockroach_cluster_ca.crt"
    ~~~

1. Copy the public certificate to the directory intended for each node:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    cp "${secrets_dir}/certs/cockroach_cluster_ca.crt" "${secrets_dir}/$node1name/"
    cp "${secrets_dir}/certs/cockroach_cluster_ca.crt" "${secrets_dir}/$node2name"
    cp "${secrets_dir}/certs/cockroach_cluster_ca.crt" "${secrets_dir}/$node3name"
    ~~~

1. Use `openssl` to examine a certificate, confirming that it has been generated and copied correctly.
        {% include_cached copy-clipboard.html %}
        ```shell
        openssl x509 -in "${secrets_dir}/${node1name}/cockroach_cluster_ca.crt" -text | less
        ```
        ~~~txt
        Certificate:
            Data:
                Version: 3 (0x2)
                Serial Number:
                    1a:72:ac:49:e9:38:38:65:e3:40:16:a8:48:6e:34:a0:3f:0f:00:96
            Signature Algorithm: sha256WithRSAEncryption
                Issuer:
                Validity
                    Not Before: Jun 21 17:24:39 2022 GMT
                    Not After : Jul 23 17:25:09 2022 GMT
                Subject:
                Subject Public Key Info:
                    Public Key Algorithm: rsaEncryption
                        Public-Key: (2048 bit)
              ...
        ~~~

    
### Create PKI roles and issue certificates for the nodes

In Vault, a PKI role is a template for a certificate.

1.  Create a node role for each node. The role will be used to generate certifates for the corresponding node.

    Each certificate is tailored to the node:
    - The extended key usages attribute `ext_key_usage` must include both server and client auth usages; this is because nodes must frequently initiate requests to other nodes in order to maintain cluster synchrony and load-balance work.
    - The Subject Alternative Name (SAN) - IP addresses field contains:
      - the IP address of the node on the internal network of your GCP project (so the node can serve at that address  locally, to other nodes).
      - the IP address of your cluster on the external, public internet (so the node can serve at that address publicly, to application servers).

    {{site.data.alerts.callout_info}}
    Note that certificate attributes must be provided with Vault's specific parameter syntax, which is documented here: 
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write "cockroach_cluster_ca/roles/${node1name}" \
    allow_bare_domains=true \
    common_name="node" \
    allowed_domains="${node1name},localhost,node" \
    ip_sans="${node1addr},${ex_ip}" \
    ext_key_usage="server_auth,client_auth" \
    max_ttl=1h

    vault write "cockroach_cluster_ca/roles/${node2name}" \
    allow_bare_domains=true \
    common_name="node" \
    allowed_domains="${node2name},localhost,node" \
    ip_sans="${node2addr},${ex_ip}" \
    ext_key_usage="server_auth,client_auth" \
    max_ttl=1h

    vault write "cockroach_cluster_ca/roles/${node3name}" \
    allow_bare_domains=true \
    common_name="node" \
    allowed_domains="${node3name},localhost,node" \
    ip_sans="${node3addr},${ex_ip}" \
    ext_key_usage="server_auth,client_auth" \
    max_ttl=1h
    ~~~

    ~~~txt
    Success! Data written to: cockroach_node_ca/roles/cockroach-cluster-alpha-1bth
    Success! Data written to: cockroach_node_ca/roles/cockroach-cluster-alpha-1bth
    Success! Data written to: cockroach_node_ca/roles/cockroach-cluster-alpha-1bth
    ~~~

1. Issue a certificate pair for each node.
  {% include_cached copy-clipboard.html %}
  ~~~shell
  vault write "cockroach_cluster_ca/issue/${node1name}" \
      common_name=node --format=json > "${secrets_dir}/$node1name/certs.json"

  vault write "cockroach_cluster_ca/issue/${node2name}" \
      common_name=node --format=json > "${secrets_dir}/${node2name}/certs.json"

  vault write "cockroach_cluster_ca/issue/${node3name}" \
      common_name=node --format=json > "${secrets_dir}/${node3name}/certs.json"
  ~~~

1. Parse the key and certificate pair from each return payload.
  {% include_cached copy-clipboard.html %}
  ~~~shell
  echo -e $(cat "${secrets_dir}/$node1name/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/${node1name}/node.key"
  echo -e $(cat "${secrets_dir}/$node1name/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/${node1name}/node.crt"

  echo -e $(cat "${secrets_dir}/$node2name/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/${node2name}/node.key"
  echo -e $(cat "${secrets_dir}/$node2name/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/${node2name}/node.crt"

  echo -e $(cat "${secrets_dir}/$node3name/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/${node3name}/node.key"
  echo -e $(cat "${secrets_dir}/$node3name/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/${node3name}/node.crt"
  ~~~

### Provision each node's [trust store](security-reference/transport-layer-security.html#trust-store)

1. Prepare the certs directory on each node:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute ssh $node1name \
    --command 'rm -rf ~/certs && mkdir ~/certs'

    gcloud compute ssh $node2name \
    --command 'rm -rf ~/certs && mkdir ~/certs'

    gcloud compute ssh $node3name \
    --command 'rm -rf ~/certs && mkdir ~/certs'
    ~~~

1. Use SCP to propagate the CA crt and corresponding key pair to each node
    {% include_cached copy-clipboard.html %}
    ~~~shell

    gcloud compute scp -r "${secrets_dir}/$node1name/" !!!"$node1name/certs"
    gcloud compute scp -r "${secrets_dir}/$node2name/" !!!"$node2name/certs"
    gcloud compute scp -r "${secrets_dir}/$node3name/" !!!"$node3name/certs"
    ~~~

### Create a role and issue a certificate for the client

#### Issue a root client certificate

Generate a private key/public certificate pair for the root SQL user.
This is a very powerful private key, as anyone 

{% include_cached copy-clipboard.html %}
```shell

```

```txt

```

### Provision the Client's trust store

### Clean up the CA admin jumpbox

Be sure to delete the private keys (after they've been copied to the nodes). You may have to respond `y` to over-ride permissions in order to delete the keys.

{% include_cached copy-clipboard.html %}
```shell
rm ${secrets_dir}/${node1name}/node.*
rm ${secrets_dir}/${node2name}/node.*
rm ${secrets_dir}/${node3name}/node.*
rm ${secrets_dir}/clients/*
```
## Node operations

### Prepare CockroachDB on each node

#### Install CockroachDB on each node

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

#### Generate and provision a start script for each node

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

### Start or reset the cluster

#### Start the nodes

To start the cluster, execute the pre-provisioned start script.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh --command './start_roach.sh' "${node1name}"
gcloud beta compute ssh --command './start_roach.sh' "${node2name}"
gcloud beta compute ssh --command './start_roach.sh' "${node3name}"
````

#### Reset the nodes

To cause an already running cluster to switch to the new credentials, send a `SIGHUP` signal to each node.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh "$node1name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node2name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node3name" --command 'pkill -SIGHUP -x cockroach'
```

## Client operations

### Provision the client

#### Install CockroachDB

Install Cockroach locally [another way](install-cockroachdb-mac.html) or with docker as follows:

{% include_cached copy-clipboard.html %}
```shell
docker pull cockroachdb/cockroach:latest
```

### Intialize the cluster

### Client Operator role: Connect the client to the cluster

Use this to issue a signing cert for the cluster.

{% include_cached copy-clipboard.html %}
```shell
docker run -it cockroachdb/cockroach:latest \
sql --certs-dir="${secrets_dir}/clients/" --host="${ex_ip}"
```
