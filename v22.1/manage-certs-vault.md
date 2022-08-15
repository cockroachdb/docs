---
title: Manage PKI certificates for a CockroachDB deployment with HashiCorp Vault
summary: Using Google Cloud Platform Certificate Authority Service to manage PKI certificates
toc: true
docs_area: manage.security
---

This tutorial walks the user through implementing [public key infrastructure (PKI)](security-reference/transport-layer-security.html) using [Vault PKI Secrets Engine](https://www.vaultproject.io/docs/secrets/pki) for a {{ site.data.products.core }} cluster deployed in Google Cloud Platform (GCP).

PKI involves careful management of the certificates used for authentication and encryption in network traffic between servers and clients.

**Goals**:

- Deploy a secure three-node CockroachDB cluster in Google Cloud Platform.
- Create two certificate authorities (CAs), one each for clients and for cluster nodes
- Define PKI roles for CockroachDB nodes and clients
- Issue private key/public certificate pairs for use by our CockroachDB cluster nodes
- Issue a private key/public certificate pair for use by the CockroachDB client
- Access the cluster using the client credentials

**Prerequisites**:

- Review [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](security-reference/transport-layer-security.html).
- Vault:
  - You must have access to a Vault cluster. This can be a, a) cluster provisioned online through [HachiCorp Cloud Platform (HCP)](https://portal.cloud.hashicorp.com/services/vault), b) a Vault cluster deployed by your organization, or even c) a quickstart Vault cluster you deploy yourself in ["dev" mode](https://learn.hashicorp.com/tutorials/vault/getting-started-dev-server?in=vault/getting-started).
  - Sufficient permissions on the cluster to enable secrets engines and create policies, either via the root access token for this cluster or through a [custom policy](https://learn.hashicorp.com/tutorials/vault/policies).
- Google Cloud Platform (GCP):
  - Create a GCP account and project.
  - Install and configure the Google Cloud CLI (gcloud) and enable [Google CA Service](https://console.cloud.google.com/security/cas).

## Introduction

### PKI strategy

PKI can be implemented in many ways; key pairs can be generated and certificates signed using many different commands or tools, including OpenSSL, the CockroachDB CLI, or other utilities or services. Similarly, there are multiple ways to safely distribute those credentials to servers and clients.

The key elements of the strategy here are:

- To leverage the strength of Vault's secrets engines to manage the certificates.
- To enforce *short validity durations for all issued certificates*, rather than employing the more heavy-weight option of [Online Certificate Status Protocol (OCSP)](manage-certs-revoke-ocsp.html)).

### Vault secrets

The solution demonstrated here uses HashiCorp Vault to manage these credentials as secrets. This approach benefits from Vault's generally strong security model and ease of use.

### Short-lived credentials

If credentials are obtained by malicious actors, they can be used to impersonate (spoof) a client or server. Any PKI implementation must prevent this type of impersonation:

- By using a revocation mechanism, so that existing certificates can be invalidated. Two standard solutions are Certificate Revocation Lists (CRLS) and the Online Certificate Status Protocol (OCSP).
- By issuing only certificates with short validity durations, so that any compromised certificate quickly becomes unusable. 

CockroachDB does support OCSP, but not CRLs. To learn more, read [Using Online Certificate Status Protocol (OCSP) with CockroachDB](manage-certs-revoke-ocsp.html).

Without OCSP, there is a premium on enforcing short validity durations for certificates; otherwise, stolen credentials may be used to work persistent mischief over a long window.

The approach taken here can be automated. Users should consider automating PKI-related operations to reduce latency, repetition, and mistakes.

For example, you might choose to issue new certificates daily, and for those certificates to remain valid for two days.

### Task personas

The work described here can be divided up into three chunks, each of which might be performed by a different team or individual, and each of which might require access to different resources in both GCP and Vault. Each of the three personas in the following table correspond to a GCP service account and a Vault policy.

persona | tasks | Vault permissions | GCP Permissions
----|------|-------|---
`ca-admin` | <ul><li>Manage CA lifycyle</li><li>Issue node certificates</li><li>Issue client certificates</li></ul>| <ul><li>Admin</li></ul>|<ul><li>CA jumpbox access</li><li>Node SSH access</li><li>Client SSH access</li></ul>
`node-operator` | <ul><li>Install, configure and run CockroachDB and dependencies on nodes</li></ul>|   |<ul><li>Node SSH access</li></ul>
`client-operator` | <ul><li>Install, configure and run CockroachDB and dependencies on clients</li></ul>| |<ul><li>Client SSH access</li></ul>

### Resources 

Our cluster will contain three classes of compute instance:

- The CA administrative jumpbox, where sensitive credentials will be handled and secure operations related to certificate authority performed.
- Database nodes. These examples use a three-node cluster.
- A client, which could represent, in a more realistic scenario, either an operations jumpbox for database adminstrators, or an application server.

Additionally, our project's firewall rules must be configured to allow communication between nodes and from client to nodes.

## Admin operations

### Provision and configure your GCP resources

1. Create the CA admin jumpbox.

    Specify the ca-admin service account, and grant the `cloud-platform` scope, so that files can be sent with SCP from here to the nodes to be provisioned.

    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute instances create ca-admin-jumpbox \
    --scopes "https://www.googleapis.com/auth/cloud-platform"
    ```

    ```txt
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/ca-admin-jumpbox].
    NAME              ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    ca-admin-jumpbox  us-central1-a  n1-standard-1               10.128.0.59  35.184.145.196  RUNNING
    ```

1. Configure cluster firewall rules.

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

    Create three compute instances to use as CockroachDB nodes. Follow the guidelines described in [Deploy CockroachDB on Google Cloud Platform](deploy-cockroachdb-on-google-cloud-platform.html#step-2-create-instances), and additionally, specify the `node-operator` service account as the managing service account.

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
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-1].
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-2].
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-3].
    ```

1. Create the client instance.

    {{site.data.alerts.callout_info}}
    Here we add the network tag 'roach-client', which will allow our the client to reach the nodes, according to our firewall rule.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ```shell
    gcloud compute instances create roach-client \
    --scopes "https://www.googleapis.com/auth/cloud-platform" \
    --tags=roach-client
    ```
    ~~~txt
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-1].
    NAME          ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP    STATUS
    roach-node-1  us-central1-a  n2-standard-2               10.128.0.3   34.134.11.238  RUNNING
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-2].
    NAME          ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    roach-node-2  us-central1-a  n2-standard-2               10.128.0.4   34.136.190.120  RUNNING
    Created [https://www.googleapis.com/compute/v1/projects/pki-docs-test1/zones/us-central1-a/instances/roach-node-3].
    NAME          ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    roach-node-3  us-central1-a  n2-standard-2               10.128.0.5   34.170.109.109  RUNNING
    ~~~

1. Create or designate a load balancer endpoint. You can do this either by creating a TCP load balancer with a static IP address, or, as a short-cut in development, by simply designating one of the nodes as your load balancer:

- Option 1: Create a TCP load balancer. Visit the load balancer page in the GCP console, and create a TCP load balancer, selecting your node instances as targets for a new back-end service, and reserving a static IP address for your front-end service. This IP address will serve as the load balancer IP, `lb_ip`, in the configuration manifest in the following step.

- Option 2: Use one of the nodes as a load balancer. Any node in a CockroachDB cluster hande SQL requests, which includes load-balancing work across nodes in the cluster. As a development mode short, cut, simply use the `INTERNAL_IP` for one of your nodes as `lb_ip` in the configuration manifest in the following step.

1. Compile an environment manifest

    Collect the network names and IP addresses of the resources, which you should be able to glean from the output of `gcloud compute instances list`:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute instances list
    ~~~
    
    ~~~txt
    NAME              ZONE           MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP     STATUS
    ca-admin-jumpbox  us-central1-a  n1-standard-1               10.128.0.2   34.70.101.145   RUNNING
    roach-client      us-central1-a  n1-standard-1               10.128.0.6   34.134.58.108   RUNNING
    roach-node-1      us-central1-a  n2-standard-2               10.128.0.3   34.134.11.238   RUNNING
    roach-node-2      us-central1-a  n2-standard-2               10.128.0.4   34.136.190.120  RUNNING
    roach-node-3      us-central1-a  n2-standard-2               10.128.0.5   34.170.109.109  RUNNING
    ~~~

    For ease of use, save the required information in a file, for example called `cockroach-cluster.env`. Then initialize your shell by pasting in the contents or running `source cockroach-cluster.env`.

    {% include_cached copy-clipboard.html %}
    ```shell

    # replace with your project ID
    export PROJECT_ID=pki-docs-test1

    # replace with your cluster's load-balancer IP.
    export lb_ip=35.238.8.215

    # replace with your compute instance names and *internal* IP addresses
    export node1name=roach-node-1
    export node1addr=10.128.0.3

    export node2name=roach-node-2
    export node2addr=10.128.0.4

    export node3name=roach-node-3
    export node3addr=10.128.0.5

    export client_addr=10.128.0.6
    ```

### Provision the certificate authorities (CAs) with Vault

The operations in this section are performed by the`ca-admin` persona, and therefore require admin Vault access and SSH access to the CA admin jumpbox.

#### Step 1: Access and prepare the CA admin jumpbox.

1. Connect to the CA admin jumpbox using SSH.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute ssh ca-admin-jumpbox 
    ~~~

1. Initialize your shell inside the jumpbox with your cluster information by running the contents of your `cockroach-cluster.env` file.

1. Create a secrets directory on the jumpbox.

    We need somewhere to put key and certificate files while we work. By working on the secure CA jumpbox, which can be carefully gated behind IAM policies controlling SSH access, we minimize the risk of leaking a sensitive credential. Remember that credentials can be leaked other ways, such as by printing out a private key or plain-text password to your terminal in a public place where a camera is pointed at your laptop's screen.

    Public certificates are less sensitive if they leak, but private keys for nodes and clients are critical secrets and must be managed with extreme care.

    {% include_cached copy-clipboard.html %}
    ```shell
    cd ~
    export secrets_dir="secrets" # replace with desired path to secrets directory
    mkdir "${secrets_dir}"
    mkdir "${secrets_dir}/certs"
    mkdir -p "${secrets_dir}/node1/certs"
    mkdir -p "${secrets_dir}/node2/certs"
    mkdir -p "${secrets_dir}/node3/certs"
    mkdir -p "${secrets_dir}/clients/certs"
    ```
1. [Install Vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install) on the jumpbox, following the [instructions for **Ubuntu/Debian** Linux](https://www.vaultproject.io/downloads).

1. Obtain the required parameters to target and authenticate to Vault.
    
    1. Option 1: If using HashiCorp Cloud Platform (HCP):

        1. Go to the [HCP console](https://portal.cloud.hashicorp.com), choose Vault from the **Services** menu and then select your cluster.

        1. Find the **Public Cluster URL** for your Vault cluster. This will be set as the `VAULT_ADDR` environment variable, in the following step.

        1. Generate an admin token by clicking **Generate token**. This will be set as the `VAULT_TOKEN` environment variable, in the following step.

    1. Option 2: If using a Vault deployment internal to your organization, contact your Vault administrator for a token and the appropriate endpoint.

    1. Option 3: If using a development Vault server (*suitable only for tutorial/testing purposes*), start the Vault development server and obtain credentials locally on your CA admin jumpbox by running `vault server --dev`.

1. Initialize your shell for Vault on the jumpbox

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

1. Create one PKI secrets engine to serve as your cluster CA, and another to serve as your client CA.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable -path=cockroach_cluster_ca pki
    vault secrets enable -path=cockroach_client_ca pki
    ~~~

    ~~~txt
    Success! Enabled the pki secrets engine at: cockroach_cluster_ca/
    Success! Enabled the pki secrets engine at: cockroach_client_ca/
    ~~~
    
1. Set a maximum validity duration for certificates signed by your CAs. In this example this maximum duration is 48 hours, appropriate for a scenario where the certificates are provisioned each day, with another 24 hours grace period.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets tune -max-lease-ttl=1000h cockroach_cluster_ca
    vault secrets tune -max-lease-ttl=1000h cockroach_client_ca
    ~~~

    ~~~txt
    Success! Tuned the secrets engine at: cockroach_cluster_ca/
    Success! Tuned the secrets engine at: cockroach_client_ca/
    ~~~

1. Generate a root credential pair for each CA. Certificates created with this CA/secrets engine will be signed with the private key generated here. 

    {{site.data.alerts.callout_info}}
    The CA private key cannot be exported from Vault. This safeguards it from being leaked and used to issue fraudulent certificates.

    The CA public certificate is downloaded in the resulting JSON payload. 

    In a following step, we'll add both CA public certificate to each node's trust store (`cert` directory) so it can be used by the nodes to authenticate the client. The client will also need the cluster CA public certificate in order to authenticate the cluster.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write \
    cockroach_cluster_ca/root/generate/internal \
    ttl=1000h \
    --format=json > "${secrets_dir}/certs/cockroach_cluster_ca.json"

    vault write \
    cockroach_client_ca/root/generate/internal \
    ttl=1000h \
    --format=json > "${secrets_dir}/certs/cockroach_client_ca.json"
    ~~~

1. Parse the CA's public certificate from the corresponding JSON payload.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${secrets_dir}/certs/cockroach_cluster_ca.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/certs/ca.crt"

    echo -e $(cat "${secrets_dir}/certs/cockroach_client_ca.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/certs/ca-client.crt"
    ~~~

1. Copy the public certificate for the cluster CA to the directory intended to populate the trust store for each node, and for the client. This is necessary because the nodes, as well as external clients, act as clients and must authenticate the server.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cp "${secrets_dir}/certs/ca.crt" "${secrets_dir}/node1/certs"
    cp "${secrets_dir}/certs/ca.crt" "${secrets_dir}/node2/certs"
    cp "${secrets_dir}/certs/ca.crt" "${secrets_dir}/node3/certs"
    cp "${secrets_dir}/certs/ca.crt" "${secrets_dir}/clients/certs"
    ~~~

1. Copy the public certificate for the client CA to the directory intended to populate the trust store for each node, so that each node can authenticate the client. The client does not need the client CA public certificate in its trust store.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cp "${secrets_dir}/certs/ca-client.crt" "${secrets_dir}/node1/certs"
    cp "${secrets_dir}/certs/ca-client.crt" "${secrets_dir}/node2/certs"
    cp "${secrets_dir}/certs/ca-client.crt" "${secrets_dir}/node3/certs"
    ~~~

1. (Optional) Use `openssl` to examine each certificate, confirming that it has been generated and copied correctly.
    {% include_cached copy-clipboard.html %}
    ```shell
    # for example...
    openssl x509 -in "${secrets_dir}/node1/ca.crt" -text | less
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

1.  Create a node role. The role will be used to generate certifates for the all cluster nodes.

    {{site.data.alerts.callout_info}}
    Note that certificate attributes must be provided with Vault's specific parameter syntax, which is documented here: 
    {{site.data.alerts.end}}


    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write "cockroach_cluster_ca/roles/node" \
    allow_any_name=true \
    client_flag=true \
    server_flag=true \
    allow_ip_sans=true \
    allow_localhost=true \
    max_ttl=48h

    ~~~

    ~~~txt
    Success! Data written to: cockroach_cluster_ca/roles/node
    ~~~

1. Issue a certificate pair for each node.

    Each certificate is tailored to the node:
    - The extended key usages attribute `ext_key_usage` must include both server and client auth usages; this is because nodes must frequently initiate requests to other nodes in order to maintain cluster synchrony and load-balance work. (Not true???!!!)
    - The Subject Alternative Name (SAN) - IP addresses field contains:
      - the IP address of the node on the internal network of your GCP project (so the node can serve at that address  locally, to other nodes).
      - the IP address of your cluster on the external, public internet (so the node can serve at that address publicly, to application servers).

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write cockroach_cluster_ca/issue/node \
    common_name="node" \
    alt_names="roachnode1,localhost,node" \
    ip_sans="${node1addr},${lb_ip}" \
    max_ttl=48h \
    --format=json > "${secrets_dir}/node1/certs.json"

    vault write cockroach_cluster_ca/issue/node \
    common_name="node" \
    alt_names="${node2name},localhost,node" \
    ip_sans="${node2addr},${lb_ip}" \
    max_ttl=48h \
    --format=json > "${secrets_dir}/node2/certs.json"

    vault write cockroach_cluster_ca/issue/node \
    common_name="node" \
    alt_names="${node3name},localhost,node" \
    ip_sans="${node3addr},${lb_ip}" \
    max_ttl=48h \
    --format=json > "${secrets_dir}/node3/certs.json"
    ~~~

1. Parse the key and certificate pair from each return payload.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${secrets_dir}/node1/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/node1/node.key"
    echo -e $(cat "${secrets_dir}/node1/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/node1/node.crt"

    echo -e $(cat "${secrets_dir}/node2/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/node2/node.key"
    echo -e $(cat "${secrets_dir}/node2/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/node2/node.crt"

    echo -e $(cat "${secrets_dir}/node3/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/node3/node.key"
    echo -e $(cat "${secrets_dir}/node3/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/node3/node.crt"
    ~~~

1. Set key file permissions.

{% include_cached copy-clipboard.html %}
~~~shell
chmod 0600  ${secrets_dir}/*/node.key
chown $USER ${secrets_dir}/*/node.key
~~~

### Provision each node's credentials and [trust store](security-reference/transport-layer-security.html#trust-store)

1. Clear any existing certs from each node:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute ssh $node1name --command 'rm -rf ~/certs'

    gcloud compute ssh $node2name --command 'rm -rf ~/certs'

    gcloud compute ssh $node3name --command 'rm -rf ~/certs'
    ~~~

1. Use SCP to propagate the CA crt and corresponding key pair to each node
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute scp --recurse "${secrets_dir}/node1/certs" $node1name:~
    gcloud compute scp --recurse "${secrets_dir}/node2/certs" $node2name:~
    gcloud compute scp --recurse "${secrets_dir}/node3/certs" $node3name:~
    ~~~

### Create a role and issue credentials for the client

#### Create a PKI role for the root  Issue a root client certificate
Generate a private key/public certificate pair for the root SQL user.

1.  Generate the client role:
    
    ~~~txt
    vault write cockroach_client_ca/roles/client \
    allow_any_name=true \
    client_flag=true \
    enforce_hostnames=false \
    allow_ip_sans=false \
    allow_localhost=false \
    max_ttl=48h
    ~~~

1. Use the client role to create credentials (a private key and public certificate) for a root client. 

    {{site.data.alerts.callout_info}}
    CockroachDB takes the name of the SQL user to be authenticated from the `common_name` field.
    {{site.data.alerts.end}}


    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write "cockroach_client_ca/issue/client" \
    common_name=root \
    --format=json > "${secrets_dir}/clients/certs.json"
    ~~~

1. Parse the client key and certificate pair from the payload.
    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${secrets_dir}/clients/certs.json" | jq .data.private_key | tr -d '"') > "${secrets_dir}/clients/client.root.key"
    echo -e $(cat "${secrets_dir}/clients/certs.json" | jq .data.certificate | tr -d '"') > "${secrets_dir}/clients/client.root.crt"
    ~~~

1. Set key file permissions.

{% include_cached copy-clipboard.html %}
~~~shell
chmod 0600  ${secrets_dir}/*/node.key
chown $USER ${secrets_dir}/*/node.key
~~~

### Provision the Client's credentials and trust store

1. Clear any existing credentials and certs:
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute ssh roach-client --command 'rm -rf ~/certs'
    ~~~

1. Use SCP to propagate the CA crt and corresponding key pair to each node
    {% include_cached copy-clipboard.html %}
    ~~~shell
    gcloud compute scp --recurse "${secrets_dir}/clients/certs" roach-client:"~"
    ~~~

### Clean up the CA admin jumpbox

Be sure to delete the credential pairs for the nodes and client.
You do not need to delete the public certificates for the CAs, as this is not sensitive data.

{% include_cached copy-clipboard.html %}
```shell
rm -r ${secrets_dir}/node1
rm -r ${secrets_dir}/node2
rm -r ${secrets_dir}/node3
rm -r ${secrets_dir}/clients
```
## Cluster operations

### Install CockroachDB on each node and client

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
install_roach_on_node roach-client
```

```txt
roach not installed; installing roach
roach not installed; installing roach
roach not installed; installing roach
roach not installed; installing roach
```

### Start or reset the cluster

#### Generate and provision a start script for each node

Note that each start script is node specific, configuring each node to advertise its own IP address to the cluster, and attempt to `join` a specified list of peers at specific IP addresses.

{% include_cached copy-clipboard.html %}
```shell
# for node 1
cat <<~script~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node1addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~script~

chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node1name:~

# for node 2
cat <<~script~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node2addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~script~

chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node2name:~

# for node 3
cat <<~script~ > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node3addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
~script~

chmod +x start_roach.sh
gcloud compute scp ./start_roach.sh $node3name:~
```

```shell
start_roach.sh                                                                              100%  156     3.0KB/s   00:00
start_roach.sh                                                                              100%  156     3.0KB/s   00:00
start_roach.sh                                                                              100%  156     3.1KB/s   00:00
```
#### Start the nodes

To start the cluster, execute the pre-provisioned start script.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh --command './start_roach.sh' "${node1name}"
gcloud beta compute ssh --command './start_roach.sh' "${node2name}"
gcloud beta compute ssh --command './start_roach.sh' "${node3name}"
````

#### Reset the nodes

To start using the new credentials on a running cluster, send a `SIGHUP` signal to each node.

{% include_cached copy-clipboard.html %}
```shell
gcloud beta compute ssh "$node1name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node2name" --command 'pkill -SIGHUP -x cockroach'
gcloud beta compute ssh "$node3name" --command 'pkill -SIGHUP -x cockroach'
```

## Client operations

SSH onto the client.

{% include_cached copy-clipboard.html %}
~~~shell
gcloud compute ssh roach-client
~~~

### Intialize the cluster

{% include_cached copy-clipboard.html %}
~~~shell
cockroach init --certs-dir=certs $lb_ip
~~~

~~~txt
Cluster successfully initialized
~~~

### Access the cluster

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --certs-dir=certs --host=$node1addr
~~~

~~~txt
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
~~~

Congratulations, you have deployed a cluster and connected using securely provisioned certificates!