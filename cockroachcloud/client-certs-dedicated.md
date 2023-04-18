---
title: Managing Certificate Authentication for SQL Clients in CockroachDB Dedicated Clusters
summary: procedures for managing client certificates for dedicated clusters
toc: true
docs_area: manage.security
---

SQL clients may authenticate to {{ site.data.products.dedicated }} clusters using PKI security certificates. This page describes the procedures for administering the cluster's certificate authority (CA) certificate, and for authenticating to a cluster using client certificates.

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html) for an overview of PKI certificate authentication in general and its use in CockroachDB.

Refer to [Authenticating to {{ site.data.products.db }}](authentication.html) for an overview of authentication in {{ site.data.products.db }}, both at the level of the organization and at the callout

{{site.data.alerts.callout_info}}
This feature is in [**limited access**](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html), and is only available to organizations that choose to opt-in. To enroll your organization, contact your Cockroach Labs account team. These features are subject to change.
{{site.data.alerts.end}}


## Appendix: Provision a PKI hierarchy

There are many ways to create, manage and distribute digital security certificates. Cockroach Labs recommends using a secure secrets server such as [HashiCorp Vault](https://www.vaultproject.io/), which can be used to securely generate certificates, without the need to reveal the CA private key.

Alternatively, you can generate certificates using CockroachDB's `cockroach cert` command or with [OpenSSL](https://www.openssl.org/). However, generating certificates this way and manually handling cryptographic material is not considered secure. For more information, refer to [Manage PKI certificates for a CockroachDB deployment with HashiCorp Vault: PKI Strategy](../{{site.versions["stable"]}}/manage-certs-vault.html#pki-strategy).

### Initialize your Vault workstation

1. [Install Vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install) on your workstation. Consider that your workstation must be secure in order for the PKI hierarchy you are establishing to be secure. Consider using a dedicated secure jumpbox, as described in [PKI Strategy](../{{site.versions["stable"]}}/manage-certs-vault.html#pki-strategy).

1. Obtain the required parameters to target and authenticate to Vault.
    
    1. Option 1: If using a development Vault server (*suitable only for tutorial/testing purposes*), start the Vault development server and obtain your admin token locally on your CA admin jumpbox by running `vault server --dev`.

    1. Option 2: If using HashiCorp Cloud Platform (HCP):

        1. Go to the [HCP console](https://portal.cloud.hashicorp.com), choose Vault from the **Services** menu and then select your cluster.

        1. Find the **Public Cluster URL** for your Vault cluster. This will be set as the `VAULT_ADDR` environment variable, in the following step.

        1. Generate an admin token by clicking **Generate token**. This will be set as the `VAULT_TOKEN` environment variable, in the following step.

    1. Option 3: If using a Vault deployment internal to your organization, contact your Vault administrator for a token and the appropriate endpoint.

1. Initialize your shell for Vault.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export VAULT_ADDR= # your Vault cluster's Public URL
    export VAULT_NAMESPACE="admin"
    ~~~

1. Authenticate with your admin token 

  {% include_cached copy-clipboard.html %}
  ~~~shell
  vault login
  ~~~

#### Create the certificate authority

1. Create a PKI secrets engine to serve as your client CA.

  {% include_cached copy-clipboard.html %}
  ~~~shell
  vault secrets enable -path=cockroach_client_ca pki
  ~~~

  ~~~txt
  Success! Enabled the pki secrets engine at: cockroach_client_ca/
  ~~~
    
1. Set a maximum validity duration for certificates signed by your CAs. In this example this maximum duration is 48 hours, appropriate for a scenario where the certificates are provisioned each day, with another 24 hours grace period.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets tune -max-lease-ttl=1000h cockroach_client_ca
    ~~~

    ~~~txt
    Success! Tuned the secrets engine at: cockroach_client_ca/
    ~~~

1. Generate a root credential pair for each CA. Certificates created with this CA/secrets engine will be signed with the private key generated here. 

  {{site.data.alerts.callout_info}}
  The CA private key cannot be exported from Vault. This safeguards it from being leaked and used to issue fraudulent certificates.

  The CA public certificate is downloaded in the resulting JSON payload. 
  {{site.data.alerts.end}}

  {% include_cached copy-clipboard.html %}
  ~~~shell
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


## Uploading a certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster

### Using the API

### Using Terraform

## Updating the certificate authority (CA) certificate for a dedicated cluster
### Using the API

### Using Terraform

## Deleting the certificate authority (CA) certificate for a dedicated cluster
### Using the API

### Using Terraform

## Authenticating a SQL client against a {{ site.data.products.dedicated }} cluster
