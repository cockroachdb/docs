---
title: Managing Certificate Authentication for SQL Clients in CockroachDB Dedicated Clusters
summary: procedures for managing client certificates for dedicated clusters
toc: true
docs_area: manage.security
---

SQL clients may authenticate to {{ site.data.products.dedicated }} clusters using public key infrastructure (PKI) security certificates, as an alternative to username/password authentication, [Cluster Single Sign-on (SSO) using CockroachDB Cloud Console](cloud-sso-sql.html), or [Cluster Single Sign-on (SSO) using JSON web tokens (JWT)](../{{site.versions["stable"]}}/sso-sql.html). This page describes the procedures for administering the cluster's certificate authority (CA) certificate, and for authenticating to a cluster using client certificates.

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI)](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html) for an overview of PKI certificate authentication in general and its use in CockroachDB.

Refer to [Authenticating to {{ site.data.products.db }}](authentication.html) for an overview of authentication in {{ site.data.products.db }}, both at the level of the organization and at the callout

{{site.data.alerts.callout_info}}
This feature is in [**limited access**](../{{site.versions["stable"]}}/cockroachdb-feature-availability.html), and is only available to organizations that choose to opt-in. To enroll your organization, contact your Cockroach Labs account team. These features are subject to change.
{{site.data.alerts.end}}



## Provision your cluster's PKI hierarchy

There are many ways to create, manage and distribute digital security certificates. Cockroach Labs recommends using a secure secrets server such as [HashiCorp Vault](https://www.vaultproject.io/), which can be used to securely generate certificates, without the need to reveal the CA private key.

Refer to: [CockroachDB - HashiCorp Vault Integration](../{{site.versions["stable"]}}/hashicorp-integration.html)

Alternatively, you can generate certificates using CockroachDB's `cockroach cert` command or with [OpenSSL](https://www.openssl.org/). However, generating certificates this way and manually handling cryptographic material comes with considerable additional risk and room for error. PKI cryptographic material related to your {{ site.data.products.db }} organizations, particularly in any production systems, should be handled according to a considered policy appropriate to your security goals.

Refer to:

- [Manage PKI certificates for a CockroachDB deployment with HashiCorp Vault: PKI Strategy](../{{site.versions["stable"]}}/manage-certs-vault.html#pki-strategy)
- [Create certificates with `cockroach cert`](../{{site.versions["stable"]}}/cockroach-cert.html#synopsis)
- [Create Security Certificates using OpenSSL](../{{site.versions["stable"]}}/create-security-certificates-openssl.html)

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

### Create the certificate authority (CA) certificate

This CA certificate will be used to [configure your cluster's Trust Store](#upload-a-certificate-authority-ca-certificate-for-a-cockroachdb-dedicated-cluster). Any client certificate signed by the CA identified by this certificate will be trusted, and be able to authenticate to your cluster.

1. Create a PKI secrets engine to serve as your client CA.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable -path=cockroach_client_ca pki
    ~~~

    ~~~txt
    Success! Enabled the pki secrets engine at: cockroach_client_ca/
    ~~~
    
1. Generate a root credential pair for the CA. Certificates created with this CA/secrets engine will be signed with the private key generated here and held within Vault; this key cannot be exported, safeguarding it from being leaked and used to issue fraudulent certificates. The CA public certificate is downloaded in the resulting JSON payload.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write \
    cockroach_client_ca/root/generate/internal \
    ttl=1000h \
    --format=json > "${SECRETS_DIR}/certs/cockroach_client_ca_cert.json"
    ~~~

1. Format the public certificate for upload.

    In order to upload your certificate to {{ site.data.products.db }}, you must create a JSON file with the public certificate itself as the value for a key `x509_pem_cert`, as in the following example.

    ~~~json
    {
      "x509_pem_cert": "-----BEGIN CERTIFICATE-----\nMIIDfzCCAmagAwIBAgIBADANBgkqhkiG9w0BAQ0FADBZMQswCQYDVQQGEwJ1czEL\nMAkGA1UECAwCV0ExDTALBgNVBAoMBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNV\nBAcMB1NlYXR0bGUxDTALBgNVBAsMBHRlc3QwHhcNMjMwMzE2MjMyNTMxWhcNMjQw\nMzE1MjMyNTMxWjBZMQswCQYDVQQGEwJ1czELMAkGA1UECAwCV0ExDTALBgNVBAoM\nBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNVBAcMB1NlYXR0bGUxDTALBgNVBAsM...\n-----END CERTIFICATE-----"
    }
    ~~~

    The public certificate can be found in the JSON file created by Vault at `.data.certificate`, for example, using the `jq` utility:

    {{site.data.alerts.callout_info}}
    On macOS, you can install `jq` from Homebrew: `brew install jq`
    {{site.data.alerts.end}}



    {% include_cached copy-clipboard.html %}
    ~~~shell
    cat "${SECRETS_DIR}/certs/cockroach_client_ca_cert.json" | jq .data.certificate
    ~~~

    ~~~txt
    "-----BEGIN CERTIFICATE-----\nMIIC8TCCAdmgA123IUBMV/L6InS7DmJCWv4eyDwazEihkwDQYJKoZIhvcNAQEL\nBQAwADAeFw0yMzA0MTgxNzI5MzhaFw0yMzA1MzAwOTMwMDhaMAAwggEiMA0GCSqG\nSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDPGJYjOxAUtZ0bfSGd1eoCRyZHmXKdfoPq\nENRyatgzZqJguqv6q6y6IHH3DhGNqMJXzn/wfDWGjd5tao+QSwjiJ/m0VhGDeap3\ngLkGXZ/NDsSLARecZNx/DI349PpeV3LgG9in7JbAAw0qRm+o061xGwB2Z9vH9EMM\naAZ2yRqXNlqCanD9EHruYdFBzvNnmnxkMmtaaMM7S4SiJ7yee4ZZZ6hBvILxRhSg\nUXdTL6I4Wu/JLcyk41haAwie/VXeNydqEo23wJDH2Ishm0jhE/p31f/17v8UILZ4\n6SFr84UUfH6jcZVYQbyg9lSb9QP70TWt2rO2K3knZXjwvOl5FpLhAgMBAAGjYzBh\nMA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRtg99q\nfugnDm+OAF12MWX7vtHVnTAfBgNVHSMEGDAWgBRtg99qfugnDm+OAF12MWX7vtHV\nnTANBgkqhkiG9w0BAQsFAAOCAQEAvRqy/O9Y+l1ikLjmg4Y/+Cj/er28aAYtgkIA\nk8DsrwnvnwwTkfFyjMcv8+ZVZr7hukhvbKP6ElWuw6Zh13DP8FuR8vbFuPmoPGA3\nF9TdmKobZI0qf26F1eUPAUemEbYajBtdFHxzfJIXiG/ZM+JpX+OpCV1+LsZRz3n2\nGbzwuNc5nm1UNYZZ5CaEp0Yckfd3tuhTKyZi+mpAs3zPGuflGdKREBlc6XLfswhL\nqS7Ke0sTUR3YT/wGcWyVh822aQtH7+zucWQkvNXkdAwxjo8qD8XcxWLB5/Pj9XVM\n/5Na4xRIi+sgdMOgPpSm5a+gbUrjwa18LXxX9kc2aOEHTqpssQ==\n-----END CERTIFICATE-----"
    ~~~

### Create a PKI role and issue credentials for client

These credentials (private key and public certificate signed by the CA created earlier) can be used to authenticate to a cluster that has the corresponding CA configured in its trust store.

1.  Define a client PKI role in Vault:
    
    ~~~txt
    vault write cockroach_client_ca/roles/client \
    allow_any_name=true \
    client_flag=true \
    enforce_hostnames=false \
    allow_ip_sans=false \
    allow_localhost=false \
    max_ttl=48h
    ~~~

1. Create PKI authentication credentials (a private key and public certificate) for a root user. 

    {{site.data.alerts.callout_info}}
    CockroachDB takes the name of the SQL user to be authenticated from the `common_name` field.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write "cockroach_client_ca/issue/client" \
    common_name=root \
    --format=json > "${SECRETS_DIR}/clients/certs.json"
    ~~~

1. Parse the client key and certificate pair from the payload.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    echo -e $(cat "${SECRETS_DIR}/clients/certs.json" | jq .data.private_key | tr -d '"') > "${SECRETS_DIR}/clients/client.root.key"
    echo -e $(cat "${SECRETS_DIR}/clients/certs.json" | jq .data.certificate | tr -d '"') > "${SECRETS_DIR}/clients/client.root.crt"
    ~~~

1. Set key file permissions; CockroachDB will reject improperly permissioned private keys for authentication.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    chmod 0600  ${SECRETS_DIR}/clients/client.root.key
    chown $USER ${SECRETS_DIR}/clients/client.root.key
    ~~~

## Upload a certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster

Add a CA certificate to your cluster's trust store for client authentication. Client certificates signed using the private key corresponding to this certificate will be accepted by your cluster for certificate-based client authentication.

Refer to [Transport Layer Security (TLS) and Public Key Infrastructure (PKI): The CockroachDB certificate Trust Store](../{{site.versions["stable"]}}/security-reference/transport-layer-security.html#the-cockroachdb-certificate-trust-store)

{{site.data.alerts.callout_success}}
Managing the certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster requires the [Cluster Administrator](authorization.html#cluster-administrator) or [Org Administrator (legacy)](authorization.html#org-administrator-legacy) Organization role.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

1. Submit the asynchronous request, supplying your cluster ID, API key, and the path to the certificate JSON with your CA certificate, as described in [Create the certificate authority (CA) certificate](#create-the-certificate-authority-ca-certificate).

{% include_cached copy-clipboard.html %}
~~~shell
curl --request POST \
  --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
  --header "Authorization: Bearer ${API_KEY}" \
  --header 'content-type: application/json' \
  --data "@cockroach_client_ca_cert.json"
~~~

~~~txt
200 OK
~~~

1. Confirm success of the operation.

{% include_cached copy-clipboard.html %}
~~~shell
curl --request GET \
  --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
  --header "Authorization: Bearer ${API_KEY}"
~~~

~~~txt
{
  "status": "PENDING",
  "x509_pem_cert": ""
}
~~~

~~~txt
{
  "status": "IS_SET",
  "x509_pem_cert": "-----BEGIN CERTIFICATE-----\nMIIDfzCCAmagAwIBAgIBADANBgkqhkiG9w0BAQ0FADBZMQswCQYDVQQGEwJ1czEL\nMAkGA1UECAwCV0ExDTALBgNVBAoMBHRlc3QxDTALBgNVBAMMBHRlc3QxEDAOBgNV\nBAcMB1NlYXR0bGUxDTALBgNVBAsMBHRlc3QwHhcNMjMwMzE2MjMyNTMxWhcNMjQw\n
...\n-----END CERTIFICATE-----",
}
~~~

</section>
<section class="filter-content" markdown="1" data-scope="tf">


Add the following block to your terraform configuration and apply:

{% include_cached copy-clipboard.html %}
~~~shell
resource "cockroach_client_ca_cert" "yourclustername" {
  id = cockroach_cluster.example.id
  x509_pem_cert = file("cockroach_client_ca_cert.json")
}
~~~
</section>

## Update the certificate authority (CA) certificate for a dedicated cluster

Replace the CA certificate used by your cluster for certificate-based client authentication.

{{site.data.alerts.callout_success}}
Managing the certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster requires the [Cluster Administrator](authorization.html#cluster-administrator) or [Org Administrator (legacy)](authorization.html#org-administrator-legacy) Organization role.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

{% include_cached copy-clipboard.html %}
~~~shell
curl --request PATCH \
  --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
  --header "Authorization: Bearer ${API_KEY}" \
  --header 'content-type: application/json' \
  --data "@cockroach_client_ca_cert.json"
~~~

~~~txt
200 OK
~~~
</section>

<section class="filter-content" markdown="1" data-scope="tf">
Update the `cockroach_client_ca_cert` block in your terraform configuration, pointing to the updated certificate JSON file, and apply:

{% include_cached copy-clipboard.html %}
~~~shell
resource "cockroach_client_ca_cert" "yourclustername" {
  id = cockroach_cluster.example.id
  x509_pem_cert = file("cockroach_client_ca_cert.json")
}
~~~
</section>

## Delete the certificate authority (CA) certificate for a dedicated cluster

Remove the configured CA certificate from the cluster. Clients will no longer be able to authenticate with certificates signed by this CA certificate.

{{site.data.alerts.callout_success}}
Managing the certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster requires the [Cluster Administrator](authorization.html#cluster-administrator) or [Org Administrator (legacy)](authorization.html#org-administrator-legacy) Organization role.
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="api">Using the API</button>
  <button class="filter-button page-level" data-scope="tf">Using Terraform</button>
</div>
<p></p>

<section class="filter-content" markdown="1" data-scope="api">

{% include_cached copy-clipboard.html %}
~~~shell
curl --request DELETE \
  --url ${COCKROACH_SERVER}/api/v1/clusters/${CLUSTER_ID}/client-ca-cert \
  --header "Authorization: Bearer ${API_KEY}"
~~~

~~~txt
200 OK
~~~
</section>
<section class="filter-content" markdown="1" data-scope="tf">


To delete the client CA cert on a cluster, remove the `cockroach_client_ca_cert` resource from your terraform configuration, then run `terraform apply`.
</section>

## Authenticate a SQL client to a {{ site.data.products.dedicated }} cluster

To use certificate authentication for a SQL client, you must include the filepaths to the client's private key and public certificate. The public certificate must be signed by a certificate authority (CA) who's public certificate is configured to be trusted by the cluster. Refer to [Upload a certificate authority (CA) certificate for a {{ site.data.products.dedicated }} cluster](#upload-a-certificate-authority-ca-certificate-for-a-cockroachdb-dedicated-cluster)

1. From your cluster's overview page, `https://cockroachlabs.cloud/cluster/{ your cluster ID }`, click on the **Connect** button.

1. Execute the command listed under **Download CA Cert** to download the required public certificate. This is used by your client to verify the identity of the cluster.

1. Obtain a connection string/command for your cluster. This connection string is designed for password authentication and must be modified.

    1. Remove the placeholder password from the connection string.

    1. Construct the full connection string by providing the paths to `sslrootcert` (the cluster's public CA certificate), `sslcert` (the client's public certificate, which must be signed by the same CA), and `sslkey` (the client's private key).
    
        Refer to: [Provision your cluster's PKI hierarchy ](#provision-your-clusters-pki-hierarchy).

1. Connect using the `cockroach sql` command, or the SQL client of your choice:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "postgresql://root@flooping-frogs-123.gcp-us-east1.crdb.io:26257/defaultdb?sslmode=verify-full&sslrootcert=${HOME}/Library/CockroachCloud/certs/2186fbdb-598c-4797-a463-aaaee865903e/flooping-frogs-ca.crt&sslcert=${SECRETS_DIR}/clients/client.root.crt&sslkey=${SECRETS_DIR}/clients/client.root.key"
    ~~~
