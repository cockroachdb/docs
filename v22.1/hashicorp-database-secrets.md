---
title: Using Hashicorp Vault's Dynamic Secrets for Enhanced Database Credential Security
summary: Learn how to achieve enhanced credential security using Hashicorp Vault's Dynamic Secrets functionality.
toc: true
docs_area: manage
---

This tutorial discusses and demonstrates best security practices for managing CockroachDB database credentials with Hashicorp Vault.


**Goals**:

**Prerequisites**:

- Access as `root` SQL user to a CockroachDB cluster. You could either [spin up a {{ site.data.products.serverless }} cluster]() or [Start a Development Cluster locally](). In either case you must have the public CA certificate for your cluster, and a username/password combination for the root SQL user (or another SQL user with the admin role).

- Access to a Vault cluster. You can spin up a free cluster in Hashicorp cloud (!!!) or start a development cluster locally... !!! hashicorp docs links

## Introduction

Sound strategy and proper tooling for managing database credentials are essential to the overall strength of your security posture. Managing your CockroachDB database credentials with Hashicorp Vault affords several distinct advantages:

- General advantages of delegated, consolidated secrets management, as opposed to the industry standard of the past, which involves storing credentials in a variety of shared and individually owned file-systems, repositories and data stores, and sharing them via email, messaging, and other means of network communication:
	- Access is managed by a single coherent set of policies.
	- Access events leave an audit trail.
	- Secrets are properly encrypted in flight and in transit.

- Advantages of Vault's Database Dynamic Secrets Engine:
	- Database credentials are generated and issued only on demand, from pre-configured templates, for specific clients and short validity durations, further minimizing both probability of credential compromise and possible impact of any compromise that does occur.
	- Diligent rotation and revocation practices are automated by implication, requiring no additional effort or oversight.





## Administrating Vault and CRDB


In this phase of the tutorial we will act as an administrator for our organization, provisioning access for a class of database clients.

Initialize your shell for Vault by setting your target and authenticating with an admin 

{% include_cached copy-clipboard.html %}
```shell
$ export VAULT_ADDR= # your Vault cluster URL
$ vault login
```


### Binding your Vault to your CRDB cluster

The connection lies in a Vault configuration, which will store your CRDB admin credentials, allowing Vault to administrate CRDB credentials.

{% include_cached copy-clipboard.html %}
```shell
vault write database/config/crdb-config \
  plugin_name=postgresql-database-plugin \
  allowed_roles="crdb-role" \
  username="vault" \
  password="password" \
  connection_url="postgresql://{{username}}:{{password}}@patrick-vault-gdk.gcp-europe-west1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=${path_to_ca_crt}"
```

```txt

```


### Create a Vault Policy for clients to access their CRDB 


Tokens issues for this policy will grant access to read credentials...

{% include_cached copy-clipboard.html %}
```shell
$ vault policy write my-policy - << EOF
path "database/creds/roach-app1-client-policy" {
  capabilities = [ "read" ]
}
EOF
```

```txt

```

### Provision a Dynamic Secret for SQL client access credentials

{% include_cached copy-clipboard.html %}
```shell
 vault write database/roles/crdb-role \
    db_name=defaultdb \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT ALL ON DATABASE defaultdb TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

```

```txt

```

## Client Access












