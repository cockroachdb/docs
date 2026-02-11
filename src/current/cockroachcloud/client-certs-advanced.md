---
title: SQL Client Certificate Authentication for CockroachDB Advanced
summary: Learn how to manage client certificates for CockroachDB Advanced clusters.
toc: true
docs_area: manage.security
cloud: true
---

SQL clients may authenticate to CockroachDB {{ site.data.products.advanced }} clusters using public key infrastructure (PKI) security certificates as an alternative to authenticating using a username and password or using [Cluster Single Sign-on (SSO) using CockroachDB Cloud Console]({% link cockroachcloud/cloud-sso-sql.md %}) or [Cluster Single Sign-on (SSO) using JSON web tokens (JWTs)]({% link {{site.current_cloud_version}}/sso-sql.md %}).

{% include cockroachcloud/prefer-sso.md %}

This page describes how to administer [public key infrastructure (PKI)]({% link {{site.current_cloud_version}}/security-reference/transport-layer-security.md %}) for a CockroachDB {{ site.data.products.advanced }} cluster, using [HashiCorp Vault PKI Secrets Engine]({% link {{site.current_cloud_version}}/hashicorp-integration.md %}).

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)]({% link {{site.current_cloud_version}}/security-reference/transport-layer-security.md %}) for an overview of PKI certificate authentication in general and its use in CockroachDB.

Refer to [Authenticating to CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/authentication.md %}) for an overview of authentication in CockroachDB {{ site.data.products.cloud }}, both at the level of the organization and at the cluster.

## Provision a PKI hierarchy for SQL authentication in your cluster

There are many ways to create, manage, and distribute digital security certificates. Cockroach Labs recommends using a secure secrets server such as [HashiCorp Vault](https://www.vaultproject.io/), which can be used to securely generate certificates without revealing the CA private key.

Refer to: [CockroachDB - HashiCorp Vault Integration]({% link {{site.current_cloud_version}}/hashicorp-integration.md %})

Alternatively, you can generate certificates [using CockroachDB's `cockroach cert`]({% link {{site.current_cloud_version}}/cockroach-cert.md %}#synopsis) command or [with OpenSSL]({% link {{site.current_cloud_version}}/create-security-certificates-openssl.md %}). However, generating certificates this way and manually handling cryptographic material comes with considerable additional risk and room for error. PKI cryptographic material related to your CockroachDB {{ site.data.products.cloud }} organizations, particularly in any production systems, should be handled according to a considered policy appropriate to your security goals.

### Initialize your Vault workstation

1. [Install Vault](https://learn.hashicorp.com/tutorials/vault/getting-started-install) on your workstation. Your workstation must be secure to ensure the security of the PKI hierarchy you are establishing. Consider using a dedicated secure jumpbox, as described in [PKI Strategy]({% link {{site.current_cloud_version}}/manage-certs-vault.md %}#pki-strategy).

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

1. Authenticate with your admin token.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault login
    ~~~

### Create the certificate authority (CA) certificate

This CA certificate will be used to [configure your cluster's Trust Store](#upload-a-certificate-authority-ca-certificate-for-a-cockroachdb-advanced-cluster). Any client certificate signed by the CA identified by this certificate will be trusted and can authenticate to your cluster.

1. Create a PKI secrets engine to serve as your client CA.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable -path=cockroach_client_ca pki
    ~~~

    ~~~txt
    Success! Enabled the pki secrets engine at: cockroach_client_ca/
    ~~~

1. Generate a root credential pair for the CA. Certificates created with this CA/secrets engine will be signed with the private key generated here and held within Vault; this key cannot be exported, safeguarding it from being leaked and used to issue fraudulent certificates. The CA public certificate is downloaded in the resulting JSON payload.

    Refer to: [Vault documentation - PKI Secrets Engine: Setup and Usage](https://developer.hashicorp.com/vault/docs/secrets/pki/setup)

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write \
    cockroach_client_ca/root/generate/internal \
    ttl=1000h \
    --format=json > "${SECRETS_DIR}/certs/cockroach_client_ca_cert.json"
    ~~~

    The public certificate can be found in the JSON file created by Vault at `.data.certificate`. You can extract it, for example, using the `jq` utility:

    {{site.data.alerts.callout_info}}
    On macOS, you can install `jq` from Homebrew: `brew install jq`
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cat "${SECRETS_DIR}/certs/cockroach_client_ca_cert.json" | jq .data.certificate
    ~~~

    ~~~txt
    "-----BEGIN CERTIFICATE-----\nMIIC8TCCAdmgA123IUBMV/L6InS7DmJCWv4eyDwazEihkwDQYJKoZIhvcNAQEL\nBQAwADAeFw0yMzA0MTgxNzI5MzhaFw0yM
    ...
    wGcWyVh822aQtH7+zucWQkvNXkdAwxjo8qD8XcxWLB5/Pj9XVM\n/5Na4xRIi+sgdMOgPpSm5a+gbUrjwa18LXxX9kc2aOEHTqpssQ==\n-----END CERTIFICATE-----"
    ~~~

1. Format a public certificate JSON for upload.

    Create a JSON file that includes your certificate as the value for the `x509_pem_cert` key. You will use this JSON file to upload the certificate to CockroachDB {{ site.data.products.cloud }}. In this example, replace the certificate with the contents of your certificate.

    ~~~json
    {
      "x509_pem_cert": "-----BEGIN CERTIFICATE-----\nMIIDfzCCAmagAwIBAgIBADANBgkqhkiG9w0BAQ0FADBZMQswCQYDVQQGEwJ1czEL\nMzE1MjMyNTMxWjBZMQswCQYDVQQGEwJ1czELMAkGA1UECAwCV0ExDTALBgNVBAoM\nBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNVBAcMB1NlYXR0bGUxDTALBgNVBAsM...\n-----END CERTIFICATE-----"
    }
    ~~~

### Create a PKI role and issue credentials for the client

You can authenticate to a cluster using the private key and public certificate previously signed by the CA as long as the cluster's trust store includes the corresponding CA.

1. Define a client PKI role in Vault:

    ~~~txt
    vault write cockroach_client_ca/roles/client \
    allow_any_name=true \
    client_flag=true \
    enforce_hostnames=false \
    allow_ip_sans=false \
    allow_localhost=false \
    max_ttl=48h
    ~~~

1. Create a PKI private key and public certificate for the `root` user.

    {{site.data.alerts.callout_info}}
    CockroachDB takes the name of the SQL user to be authenticated from the `common_name` field.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write "cockroach_client_ca/issue/client" \
    common_name=root \
    --format=json > "${SECRETS_DIR}/clients/certs.json"
    ~~~

1. Extract the client key and certificate pair from the payload.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${SECRETS_DIR}/clients/certs.json" | jq .data.private_key | tr -d '"') > "${SECRETS_DIR}/clients/client.root.key"
    echo -e $(cat "${SECRETS_DIR}/clients/certs.json" | jq .data.certificate | tr -d '"') > "${SECRETS_DIR}/clients/client.root.crt"
    ~~~

1. Ensure that the key file is owned by and readable only by the current user. CockroachDB will reject requests to authenticate using keys with overly-permissive permissions.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    chmod 0600  ${SECRETS_DIR}/clients/client.root.key
    chown $USER ${SECRETS_DIR}/clients/client.root.key
    ~~~

## Upload a certificate authority (CA) certificate for a CockroachDB {{ site.data.products.advanced }} cluster

Add a CA certificate to your cluster's trust store for client authentication. Client certificates signed using the private key corresponding to this certificate will be accepted by your cluster for certificate-based client authentication.

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI): The CockroachDB certificate Trust Store]({% link {{site.current_cloud_version}}/security-reference/transport-layer-security.md %}#the-cockroachdb-certificate-trust-store)

{{site.data.alerts.callout_success}}
The [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) Organization role is required to manage the CA certificate for a CockroachDB {{ site.data.products.advanced }} cluster.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

1. Submit the asynchronous request, supplying your cluster ID, API key, and the path to the certificate JSON with your CA certificate, as described in [Create the certificate authority (CA) certificate](#create-the-certificate-authority-ca-certificate).

    A `200` successful response code indicates that the asynchronous request was successfully submitted, but does not guarantee that the operation (configuring the CA certificate) successfully completed. You must confirm success with a follow-up `GET` request, as described in the next step.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request POST \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "content-type: application/json" \
      --data "@cockroach_client_ca_cert.json"
    ~~~

    ~~~txt
    200 OK
    ~~~

1. Confirm success of the operation with the following `GET` request.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

    `PENDING` indicates that the operation is still in process.

    ~~~txt
    {
      "status": "PENDING",
      "x509_pem_cert": ""
    }
    ~~~

    `IS_SET` indicates that the operation completed successfully, confirming the configured public CA cert.

    ~~~txt
    {
      "status": "IS_SET",
      "x509_pem_cert": "-----BEGIN CERTIFICATE-----\nMIIDfzCCAmagAwIBAgIBADANBgkqhkiG9w0BAQ0FADBZMQswCQYDVQQGEwJ1czEL\nMAkGA1UECAwCV0ExDTALBgNVBAoMBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNV\nBAcMB1NlYXR0bGUxDTALBgNVBAsMBHRlc3QwHhcNMjMwMzE2MjMyNTMxWhcNMjQw\n
    ...\n-----END CERTIFICATE-----",
    }
    ~~~

</section>
<section class="filter-content" markdown="1" data-scope="tf">


Add the [`cockroach_client_ca_cert` resource block](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/client_ca_cert) to your Terraform template and apply the change:

{% include_cached copy-clipboard.html %}
~~~shell
resource "cockroach_client_ca_cert" "yourclustername" {
  id = cockroach_cluster.example.id
  x509_pem_cert = file("cockroach_client_ca_cert.json")
}
~~~
</section>

## Update the CA certificate for a cluster

{{site.data.alerts.callout_danger}}
Clients must be provisioned with client certificates signed by the cluster's CA prior to the update, or their new connections will be blocked.
{{site.data.alerts.end}}

This section shows how to replace the CA certificate used by your cluster for certificate-based client authentication. To roll out a new CA certificate gradually instead of following this procedure directly, CockroachDB supports the ability to include multiple CA certificates for a cluster by concatenating them in PEM format. This allows clients to connect as long as the client certificate is signed by either the old CA certificate or the new one. PEM format requires a blank line in between certificates.

{{site.data.alerts.callout_success}}
The [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) Organization role is required to manage the CA certificate for a CockroachDB {{ site.data.products.advanced }} cluster.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

1. Submit the asynchronous request, supplying your cluster ID, API key, and the path to the certificate JSON with your CA certificate, as described in [Create the certificate authority (CA) certificate](#create-the-certificate-authority-ca-certificate).

    A `200` successful response code indicates that the asynchronous request was successfully submitted, but does not guarantee that the operation (configuring the CA certificate) successfully completed. You must confirm success with a follow-up `GET` request, as described in the next step.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request PATCH \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "content-type: application/json" \
      --data "@cockroach_client_ca_cert.json"
    ~~~

    ~~~txt
    200 OK
    ~~~

1. Confirm success of the operation with the following `GET` request.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

    `PENDING` indicates that the operation is still in process.

    ~~~txt
    {
      "status": "PENDING",
      "x509_pem_cert": ""
    }
    ~~~

    `IS_SET` indicates that the operation completed successfully, confirming the configured public CA cert.

    ~~~txt
    {
      "status": "IS_SET",
      "x509_pem_cert": "-----BEGIN CERTIFICATE-----\nMIIDfzCCAmagAwIBAgIBADANBgkqhkiG9w0BAQ0FADBZMQswCQYDVQQGEwJ1czEL\nMAkGA1UECAwCV0ExDTALBgNVBAoMBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNV\nBAcMB1NlYXR0bGUxDTALBgNVBAsMBHRlc3QwHhcNMjMwMzE2MjMyNTMxWhcNMjQw\n
    ...\n-----END CERTIFICATE-----",
    }
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="tf">

Update the [`cockroach_client_ca_cert` resource block](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/client_ca_cert) in your Terraform template, then run `terraform apply`.

{% include_cached copy-clipboard.html %}
~~~shell
resource "cockroach_client_ca_cert" "yourclustername" {
  id = cockroach_cluster.example.id
  x509_pem_cert = file("cockroach_client_ca_cert.json")
}
~~~
</section>

## Delete the certificate authority (CA) certificate for a cluster

This section shows how to remove the configured CA certificate from the cluster.

{{site.data.alerts.callout_danger}}
After this operation is performed, clients can no longer authenticate with certificates signed by this CA certificate.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
The [Cluster Admin]({% link cockroachcloud/authorization.md %}#cluster-admin) or [Organization Admin]({% link cockroachcloud/authorization.md %}#organization-admin) Organization role is required to manage the CA certificate for a CockroachDB {{ site.data.products.advanced }} cluster.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

1. Submit the asynchronous `DELETE` request, supplying your cluster ID, API key, and the path to the certificate JSON with your CA certificate, as described in [Create the certificate authority (CA) certificate](#create-the-certificate-authority-ca-certificate).

    A `200` successful response code indicates that the asynchronous request was successfully submitted, but does not guarantee that the operation (configuring the CA certificate) successfully completed. You must confirm success with a follow-up `GET` request, as described in the next step.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request DELETE \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

    ~~~txt
    200 OK
    ~~~

1. Confirm success of the operation with the following `GET` request.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    curl --request GET \
      --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
      --header "Authorization: Bearer ${API_KEY}"
    ~~~

    `PENDING` indicates that the operation is still in process.

    ~~~txt
    {
      "status": "PENDING",
      "x509_pem_cert": ""
    }
    ~~~

    `NOT_SET` indicates that the operation completed successfully, confirming that no CA cert is currently set.

    ~~~txt
    {
      "status": "NOT_SET",
      "x509_pem_cert": ""
    }
    ~~~
</section>
<section class="filter-content" markdown="1" data-scope="tf">

To delete the client CA cert on a cluster, remove the [`cockroach_client_ca_cert` resource block](https://registry.terraform.io/providers/cockroachdb/cockroach/latest/docs/resources/client_ca_cert) from your Terraform template, then run `terraform apply`.
</section>

## Authenticate a SQL client using certificate authentication

To use certificate authentication for a SQL client, you must include the filepaths to the client's private key and public certificate. The public certificate must be signed by a CA that the cluster has been configured to trust. Refer to [Upload a certificate authority (CA) certificate for a CockroachDB {{ site.data.products.advanced }} cluster](#upload-a-certificate-authority-ca-certificate-for-a-cockroachdb-advanced-cluster).

1. From your cluster's overview page, `https://cockroachlabs.cloud/cluster/{ your cluster ID }`, click the **Connect** button.

1. Copy the command listed under **Download CA Cert** and run it locally to download the required public certificate, which your client will use to verify the identity of the cluster.

1. Obtain your choice of connection string or CLI connection command for your cluster from the UI. This connection string is designed for password authentication and must be modified.

    1. Remove the placeholder password from the connection string.

    1. Construct the full connection string by providing the paths to `sslrootcert` (the cluster's public CA certificate), `sslcert` (the client's public certificate, which must be signed by the CA specified in `sslrootcert`), and `sslkey` (the client's private key).

        Refer to: [Provision a PKI hierarchy for SQL authentication in your cluster ](#provision-a-pki-hierarchy-for-sql-authentication-in-your-cluster).

1. Connect using the `cockroach sql` command or the SQL client of your choice:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "postgresql://root@flooping-frogs-123.gcp-us-east1.crdb.io:26257/defaultdb?sslmode=verify-full&sslrootcert=${HOME}/Library/CockroachCloud/certs/2186fbdb-598c-4797-a463-aaaee865903e/flooping-frogs-ca.crt&sslcert=${SECRETS_DIR}/clients/client.root.crt&sslkey=${SECRETS_DIR}/clients/client.root.key"
    ~~~
