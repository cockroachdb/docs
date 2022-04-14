---
title: Using Google Cloud Platform to manage PKI certificates
summary: Using Google Cloud Platform to manage PKI certificates
toc: true
docs_area: manage.security
---

This tutorial walks the user through provisioning a [secure certificate authority (CA) infrastructure](security-reference/transport-layer-security.html) for a {{ site.data.products.core }} cluster deployed in Google Cloud Platform (GCP).

The solution demonstrated here has the advantages of making full use of GCP's strong IAM model. By managing CA operations, network and compute resource access, and secrets acces in Google cloud, we can confidently manage access according to the principle of least privelege, ensuring best security.

We will provision 2 root CAs, one for issuing certificates for internode communication, and one for issuing certificates for SQL client connections.

We will issue private key/public certificate pairs for use by the CockroachDB nodes comprising our cluster.

After using these key pairs to get our cluster running, we will use the client CA to issue client credentials, and use these to access the cluster.

## Prerequisites

Before proceeding, you must provision three compute node in a properly configured network, as described here.

Provision either a static IP on one of the nodes,  

Three compute nodes and an external IP for one of the nodes or a load balancer.

Create a manifest with the network names and IP addresses of these resources:

{% include_cached copy-clipboard.html %}
```
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/cockroach-cluster.env %}
```

## Provision node and client certificate authorities

Let's begin by provisioning a Certificate Authority (CA) for managing Cockroachdb. In a realistic scenario, this CA would itself be subordinate to an organizational root CA, but in this case we will make it a self-signed root CA.

We will use [Google CA Service](https://console.cloud.google.com/security/cas) to perform most operations.

### Create a roach test CA Pool

In GCP, CAs are organized into CA pools. Signing requests are issued by default to a CA pool rather than a particular CA. Create a CA pool.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/create-root-ca.sh %}
```

```text
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/create-root-ca.res %}
```

### Create your roach test CA

Either:

- A: Create a root CA *solely for use in development*, as shown here.
- B: Create a subordinate CA by issuing a certificate signing request (CSR) to your organization's CA administrators.

#### Option A: Create a root CA for CRDB (only suitable for development)

to create a root CA to use for your whole cluster, called RoachTestSubCA. Answer `y` to enable the CA

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/create-root-ca.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/create-root-ca.res %}
```
#### Option B: Create a subordinate CA for CRDB

If your organizational CA is managed with Google Certificate Authority Service, you can request a subordinate CA from the [GCP CAS Console](https://console.cloud.google.com/security/cas/certificateAuthorities).

Otherwise, you must create a subordinate certifcate authority by [submitting a certificate signing request (CSR)](https://cloud.google.com/certificate-authority-service/docs/requesting-certificates#use-csr) to your organizational certificate authority.

View the CA in the GCP CAS console and ensure that its status is set to **enabled**.

## Issue and provision node keys and certificates

### Create a private key and public certifiate for each node in the cluster.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/issue-node-certs.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/issue-node-certs.res %}
```

### Propagate key pairs to the nodes.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/prop-keys-to-nodes.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/prop-keys-to-nodes.res %}
```
### Provision the CA's public cert on the nodes

Download the CA's pulic cert into a file called `ca.cert`. If it is a self-signed cert, you can download it from the [GCP console](https://console.cloud.google.com/security/cas/), otherwise you must obtain it from your organization's CA.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/prop-cert-to-nodes.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/prop-cert-to-nodes.res %}
```

### Start the cluster

Load start scripts onto each node.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/load-start-scripts.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/load-start-scripts.res %}
```

Install CRDB on each node and then start it with the start script.

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/install-and-start-roach.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/install-and-start-roach.res %}
```


## Issue a root client certificate

{% include_cached copy-clipboard.html %}
```shell
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/issue-root-client-cert.sh %}
```

```txt
{% include {{page.version.version}}/certs-tutorials/manage-certs-gcloud/issue-root-client-cert.res %}
```

## Connect a client to the cluster

Use this to issue a signing cert for the cluster.
