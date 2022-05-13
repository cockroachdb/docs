---
title: Using Hashicorp Vault's Dynamic Secrets for Enhanced Database Credential Security
summary: Learn how to achieve enhanced credential security using Hashicorp Vault's Dynamic Secrets functionality.
toc: true
docs_area: manage
---

This tutorial discusses and demonstrates best security practices for managing CockroachDB database credentials with Hashicorp Vault.

**Goals**:

**Prerequisites**:

To follow along with this tutorial you will need the following:

- Access as `root` SQL user to a CockroachDB cluster. You may either [spin up a {{ site.data.products.serverless }} cluster](create-a-serverless-cluster.md) or [Start a Development Cluster locally](../{{site.versions["stable"]}}/start-a-local-cluster.md). In either case you must have the public CA certificate for your cluster, and a username/password combination for the root SQL user (or another SQL user with the admin role).
- Access to a Vault cluster with an admin token. You may either spin up a [free cluster in Hashicorp cloud](https://learn.hashicorp.com/collections/vault/cloud) or [start a development cluster locally](https://learn.hashicorp.com/tutorials/vault/getting-started-dev-server).

## Introduction

Sound strategy and proper tooling for managing database credentials are essential to the overall strength of your security posture. Managing your CockroachDB database credentials with Hashicorp Vault affords several security advantages:

- General advantages of delegated, consolidated secrets management, as opposed to the industry standard of the past, which involves storing credentials in a variety of shared and individually owned file-systems, repositories and data stores, and sharing them via email, messaging, and other means of network communication:
	- Access is managed by a single coherent set of policies.
	- Access events leave an audit trail.
	- Secrets are properly encrypted in flight and in transit.

- Advantages of Vault's Database Dynamic Secrets Engine:
	- Database credentials are generated and issued only on demand, from pre-configured templates, for specific clients and short validity durations, further minimizing both probability of credential compromise and possible impact of any compromise that does occur.
	- Diligent rotation and revocation practices are automated by implication, requiring no additional effort or oversight.

## Administrating Vault and CRDB

In this phase of the tutorial we will act as an administrator for our organization, provisioning access for a class of database clients.

You'll need admin credentials for both a Vault cluster and a CockroachDB cluster, allowing you to create and manage access for roles in both domains.

In the first phase of the tutorial, we will act as administrators, provisioning access to a Vault dynamic secret endpoint for a CockroachDB client operator to use to provision credentials for an app that needs to access the CockroachDB database.

In the second phase, acting as client operator, we will pull credentials from Vault and use them to access the database via the CockroachDB client CLI.


### Initize your shell for Vault

Set your Vault target and authenticate with an admin token.

{% include_cached copy-clipboard.html %}
```shell
export VAULT_ADDR= # your Vault cluster URL
vault login
```

### Enable the database secrets engine

This only needs to be done once for an individual Vault cluster.

{% include_cached copy-clipboard.html %}
```shell
vault secrets enable database
```

```txt
Success! Enabled the database secrets engine at: database/
```

### Initialize your shell for CRDB

Set your CRDB cluster credentials and other configuration information as environment variables
{% include_cached copy-clipboard.html %}
```shell
USER_NAME=bloop # CRDB admin username
PASSWORD=UL1IdEv-HzYSeUzJw_o_Gw # CRDB admin password
DB_NAME=defaultdb
CLUSTER_NAME=lilac-grizzly-684
HOST=free-tier21.aws-us-west-2.crdb.io

```
#### Obtain your cluster's CA public certificate

1. Visit the [CockroachDB Cloud Console's cluster page.](https://cockroachlabs.cloud/cluster/). 
1. Select your cluster.
1. Click the **Connect** button.
1. Select **"Download CA Cert (Required only once)"** and use the generated `curl` command to download the certificate.
```shell
curl --create-dirs -o root.crt -O https://management-staging.crdb.io/clusters/505a138c-37ff-46b7-9c50-4119cf0881f6/cert
```
1. Place the certificate on the path specified by `sslrootcert` in the following command, the run it. A successful display of the output of "show tables;" proves that our connection works.

{% include_cached copy-clipboard.html %}
```shell
TLS_OPTS="sslrootcert=root.crt&sslmode=verify-full&options=--cluster=${CLUSTER_NAME}"
CONNECTION_URL="postgresql://$USER_NAME:$PASSWORD@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"
cockroach sql --url $CONNECTION_URL --execute "show tables;"
```

```txt
SHOW TABLES 0

Time: 107ms
```

### Binding your Vault cluster to your CRDB cluster

The connection lies in a Vault configuration, which will store your CRDB admin credentials, allowing Vault to administrate CRDB credentials.


Create the `crdb-config` database configuration in Vault, specifying admin credentials that will be used by Vault to 
{% include_cached copy-clipboard.html %}
```shell




```



{% include_cached copy-clipboard.html %}
```shell

```


{% include_cached copy-clipboard.html %}
```shell
TLS_OPTS="sslmode=require&options=--cluster=${CLUSTER_NAME}"
CONNECTION_URL="postgresql://{{username}}:{{password}}@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"

vault write database/config/crdb-config \
plugin_name=postgresql-database-plugin \
allowed_roles="crdb-role" \
username=${USER_NAME} \
password=${PASSWORD} \
connection_url=$CONNECTION_URL

```

```txt
Success! Data written to: database/config/crdb-config
```

### Create a Vault policy for use by the CRDB client operator

This policy will be used to access CRDB client credentials. In keeping with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), let's give it only the required ability to read the required credential. 

Vault policies are specified using HashiCorp Configuration Language (HCL). The following configuration specifies a policy of read access for the `crdb-role` credential.

{% include_cached copy-clipboard.html %}
```shell
vault policy write roach-client - <<hcl
path "database/creds/crdb-role" {
  capabilities = [ "read" ]
}
hcl
```

### Provision a Dynamic Secret for SQL client access credentials

A 'dynamic secret' is really a secret template, which will be used to generate particular short lived secrets on demand, according to the template.

The template is defined by its `creation_statements`, SQL statements that create the role.

For, example, let's create a 'default role'

NOTE: `db_name` is actually not the database name but the vault secrets engine thingy (i.e. `crdb-config` in the example)


{% include_cached copy-clipboard.html %}
```shell
 vault write database/roles/crdb-role \
    db_name=crdb-config \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT ALL ON DATABASE defaultdb TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"
```

```txt

```

## Client

### Login to vault as the client

### Pull the credentials

{% include_cached copy-clipboard.html %}
```shell
vault list database/roles/
```

```txt

```
  
### Hey look at that you can do whatever


## Admin

### Look at the list of credential pairs

{% include_cached copy-clipboard.html %}
```sql
bloop@free-tier21.aws-us-west-2.crdb.io:26257/defaultdb> show users;
                       username                       |                options                | member_of
------------------------------------------------------+---------------------------------------+------------
  admin                                               |                                       | {}
  bloop                                               |                                       | {admin}
  root                                                |                                       | {admin}
  v-token-hc-crdb-rol-faxnxdvj4ftbprhzdscy-1652201047 | VALID UNTIL=2022-05-10 17:44:12+00:00 | {}
  v-token-hc-crdb-rol-kilx5y52lmb8bsbopjzt-1652201135 | VALID UNTIL=2022-05-10 17:45:40+00:00 | {}
  v-token-hc-crdb-rol-naz7oa5ttrw0cjqjr19h-1652201138 | VALID UNTIL=2022-05-10 17:45:43+00:00 | {}
  v-token-hc-crdb-rol-oqfy7u6s10rqvduduf5c-1652201055 | VALID UNTIL=2022-05-10 17:44:20+00:00 | {}
  v-token-hc-crdb-rol-pswf90wx3tqqjdpw91gi-1652201136 | VALID UNTIL=2022-05-10 17:45:41+00:00 | {}
(9 rows)
```

```
:) vault list sys/leases/lookup/database/creds
Keys
----
crdb-role/
~/roachspace/deploys/vault :) vault list sys/leases/lookup/database/creds/crdb-role
Keys
----
6qaPBNBl0Qdr3uPUoogF0gnk.iMXtW
GOnn6AiJsFweviaG86egTpJd.iMXtW
XIpIBRM8FkQxD5B0ndB1lszY.iMXtW
f0517hY8diWwzstrgMAW3M0I.iMXtW
fXFg27X3BhOp8wy8u8lb18yI.iMXtW
hJ1BCqE0UfiZVOXxxBvTcc0g.iMXtW
pP9yFeh8ZzmoeOEXjPkWobmT.iMXtW
```

### Revoke some creds

{% include_cached copy-clipboard.html %}
```shell
~/roachspace/deploys/vault :) vault lease revoke database/creds/readonly/XIpIBRM8FkQxD5B0ndB1lszY.iMXtW
All revocation operations queued successfully!
~/roachspace/deploys/vault :) vault list sys/leases/lookup/database/creds/crdb-role
Keys
----
6qaPBNBl0Qdr3uPUoogF0gnk.iMXtW
GOnn6AiJsFweviaG86egTpJd.iMXtW
XIpIBRM8FkQxD5B0ndB1lszY.iMXtW
f0517hY8diWwzstrgMAW3M0I.iMXtW
fXFg27X3BhOp8wy8u8lb18yI.iMXtW
hJ1BCqE0UfiZVOXxxBvTcc0g.iMXtW
pP9yFeh8ZzmoeOEXjPkWobmT.iMXtW
```

## Client



### oh no I can't do whatever anymore













