---
title: Using HashiCorp Vault's Dynamic Secrets for Enhanced Database Credential Security in CockroachDB
summary: Learn how to achieve enhanced credential security using HashiCorp Vault's Dynamic Secrets functionality.
toc: true
docs_area: manage
---

This tutorial discusses and demonstrates best security practices for managing CockroachDB database credentials with [HashiCorp Vault's database secrets engine PostgreSQL plugin](https://www.vaultproject.io/docs/secrets/databases/postgresql).

See also: 

- [CockroachDB - HashiCorp Vault integration overview page](hashicorp-integration.html)
- [HashiCorp Vault database secrets engine tutorial](https://learn.hashicorp.com/tutorials/vault/database-secrets).

**Prerequisites**:

To follow along with this tutorial you will need the following:

- The CockroachDB CLI installed locally. [Install CockroachDB](install-cockroachdb-mac.html)
- The Vault CLI installed locally. [Install Vault](https://www.vaultproject.io/docs/install)
- Access as [`admin` SQL user](security-reference/authorization.html#admin-role) to a CockroachDB cluster. You may either [Create a {{ site.data.products.serverless }} cluster](../cockroachcloud/create-a-serverless-cluster.html) or [Start a Local Cluster (secure)](../{{site.versions["stable"]}}/start-a-local-cluster.html). This tutorial will demonstrate the procedure using {{ site.data.products.db }}. In either case you must have the public CA certificate for your cluster, and a username/password combination for the root SQL user (or another SQL user with the admin role).
  You can create a {{ site.data.products.db }} cluster through the [{{ site.data.products.db }} console](https://cockroachlabs.cloud/).
- Access to a Vault cluster with an admin token. You may either spin up a [free cluster in HashiCorp cloud](https://learn.hashicorp.com/collections/vault/cloud) or [start a development cluster locally](https://learn.hashicorp.com/tutorials/vault/getting-started-dev-server).
  You can create a Vault cluster through the [HashiCorp Vault Cloud console](https://portal.cloud.HashiCorp.com/services/vault).


## Introduction

Sound strategy and proper tooling for managing database credentials are essential to the overall strength of your security posture. Managing your CockroachDB database credentials with HashiCorp Vault affords several security advantages:

- General advantages of delegated, consolidated secrets management, as opposed to the industry standard of the past, which involves storing credentials in a variety of shared and individually owned file-systems, repositories and data stores, and sharing them via email, messaging, and other means of network communication:
	- Access is managed by a single coherent set of policies.
	- Access events leave an audit trail.
	- Secrets are properly encrypted in flight and in transit.

- Advantages of Vault's [Dynamic Secrets](https://www.vaultproject.io/use-cases/dynamic-secrets):
	- Database credentials are generated and issued only on demand, from pre-configured templates, for specific clients and short validity durations, further minimizing both probability of credential compromise and possible impact of any compromise that does occur.
	- Diligent rotation and revocation practices are automated by implication, requiring no additional effort or oversight.

## Preparing your shell for CockroachDB and Vault admin tasks

In this phase of the tutorial we will act as an administrator for our organization, provisioning access for a class of database clients.

You'll need admin credentials for both a Vault cluster and a CockroachDB cluster, allowing you to create and manage access for roles in both domains.

In the first phase of the tutorial, we will act as administrators, provisioning access to a Vault dynamic secret endpoint for a CockroachDB client operator to use to provision credentials for an app that needs to access the CockroachDB database.

In the second phase, acting as client operator, we will pull credentials from Vault and use them to access the database via the CockroachDB client CLI.


### Connect to CockroachDB

Set your CockroachDB cluster credentials and other configuration information as environment variables
{% include_cached copy-clipboard.html %}
~~~shell
export USER_NAME= # CockroachDB admin username
export PASSWORD= # CockroachDB admin password
export DB_NAME=defaultdb
export CLUSTER_NAME=lilac-grizzly-684
export HOST=free-tier123.aws-us-west-2.crdb.io

~~~
#### Obtain your CockroachDB cluster's CA public certificate

1. Visit the [CockroachDB Cloud Console's cluster page.](https://cockroachlabs.cloud/cluster/). 
1. Select your cluster.
1. Click the **Connect** button.
1. Select **"Download CA Cert (Required only once)"** and use the generated `curl` command to download the certificate.
~~~shell
curl --create-dirs -o root.crt -O https://management-staging.crdb.io/clusters/505a138c-37ff-46b7-9c50-4119cf0881f6/cert
~~~
#### Prove you can connect

1. Construct a database connection URL for your CockroachDB CLI to connect to the cluster, using your admin credentials. Note that you must place the CockroachDB cluster's CA public certificate on the path specified by `sslrootcert`, in the following example to a file in the current directory.

{% include_cached copy-clipboard.html %}
~~~shell
export TLS_OPTS="sslrootcert=root.crt&sslmode=verify-full&options=--cluster=${CLUSTER_NAME}"
export CLI_DB_CONNECTION_URL="postgresql://${USER_NAME}:${PASSWORD}@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"
~~~

Prove that your connection works by executing a SQL statement.

~~~shell
cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show tables;"
~~~

~~~txt
SHOW TABLES 0

Time: 107ms
~~~


### Connect to Vault

Set your Vault target and authenticate with an admin token.
You can fetch your target URL and generate a token from the [HashiCorp Vault console](https://portal.cloud.HashiCorp.com/services/vault).


{% include_cached copy-clipboard.html %}
~~~shell
export VAULT_ADDR=https://roach-test-vault.vault.bfb2290a-670b-4a10-bedf-5aab18e84d69.aws.HashiCorp.cloud:8200 # your Vault cluster URL
export VAULT_NAMESPACE=admin
vault login
~~~
~~~shell
Success! You are now authenticated. The token information displayed below
is already stored in the token helper. You do NOT need to run "vault login"
again. Future Vault requests will automatically use this token.
~~~

### Enable the Vault database secrets engine

This only needs to be done once for an individual Vault cluster.

{% include_cached copy-clipboard.html %}
~~~shell
vault secrets enable database
~~~

~~~txt
Success! Enabled the database secrets engine at: database/
~~~

## Binding your Vault cluster to your CockroachDB cluster

The connection lies in a Vault configuration, which will store your CockroachDB admin credentials, allowing Vault to administrate CockroachDB credentials.

### Create a Vault database configuration

Create the `crdb-config` database configuration in Vault, specifying admin credentials that will be used by Vault to create credentials for your defined role.

{% include_cached copy-clipboard.html %}
~~~shell
TLS_OPTS="sslmode=require&options=--cluster=${CLUSTER_NAME}"
export VAULT_DB_CONNECTION_URL="postgresql://{{username}}:{{password}}@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"

vault write database/config/crdb-config \
plugin_name=postgresql-database-plugin \
allowed_roles="crdb-role" \
username=${USER_NAME} \
password=${PASSWORD} \
connection_url=${VAULT_DB_CONNECTION_URL}
~~~

~~~txt
Success! Data written to: database/config/crdb-config
~~~

## Using Dynamic Secrets for SQL credentials

A 'dynamic secret' is really a secret template, which will be used to generate particular short lived secrets on demand, according to the template. The secret type we'll be using is `/database/role`. A Vault database role does not correspond to a single role or user in SQL, but a template for creating short-lived roles or users.

For a SQL role, the template is defined by its `creation_statements`, SQL statements that create the role, define its options and grant its permissions.

### Create a Vault database role

For, example, let's create a role that has all privileges on the `defaultdb` database.

NOTE: `db_name` is actually not the database name but the Vault database secrets engine namespace (i.e. `crdb-config` in the example).


{% include_cached copy-clipboard.html %}
~~~shell
 vault write database/roles/crdb-role \
    db_name=crdb-config \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT ALL ON DATABASE defaultdb TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"
~~~

~~~txt
Success! Data written to: database/roles/crdb-role
~~~

### List roles

{% include_cached copy-clipboard.html %}
~~~shell
vault list database/roles/
~~~

~~~txt
Keys
----
crdb-role
~~~

{% include_cached copy-clipboard.html %}
~~~shell
vault read database/roles/crdb-role
~~~

~~~txt
Key                      Value
---                      -----
creation_statements      [CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';         GRANT ALL ON DATABASE defaultdb TO "{{name}}";]
db_name                  crdb-config
default_ttl              1h
max_ttl                  24h
renew_statements         []
revocation_statements    []
rollback_statements      []
~~~

### Generate credential pairs

Recall that a *role* in Vault does not correspond exactly to a *role* in CockroachDB (i.e., a [SQL role or user](security-reference/authorization.html#users-and-roles)).

A Vault role is a defined *template* for credential pairs (SQL user/role name and password), which will be generated on demand and quickly expired.

When we "read" the Vault role called "crdb-role", we are therefore not fetching credentials for a pre-existing SQL user, but requesting that Vault create a user for us, according to the template.

To see this, first execute a SQL statement via the CockroachDB CLI to list existing users.

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url $CLI_DB_CONNECTION_URL --execute "show users;"
~~~

If you using a freshly created database, you may see only the `admin` and `root` roles.

~~~txt
------------------------------------------------------+---------------------------------------+------------
  admin                                               |                                       | {}
  root                                                |                                       | {admin}
~~~

Now, let's read some credentials from Vault, which will cause Vault to create SQL users on our CockroachDB cluster.

Run the following command several times to generate several credential pairs.

Notice that the validity duration is the default value of 1 hour.


{% include_cached copy-clipboard.html %}
~~~shell
vault read database/creds/crdb-role
~~~

~~~txt
Key                Value
---                -----
lease_id           database/creds/crdb-role/5rPhNN6aG0dNRs97UmRYMmJH.iMXtW
lease_duration     1h
lease_renewable    true
password           a1qKnD-ZjFG-oUMcSFtx
username           v-token-hc-crdb-rol-1pcS5YcSaSS4Fgy4BiXp-1653512968
~~~

List the active credentials (or *leases*, in Vault terms) for the Vault role:

{% include_cached copy-clipboard.html %}
~~~shell
vault list sys/leases/lookup/database/creds/crdb-role/
~~~

~~~txt
Keys
----
5rPhNN6aG0dNRs97UmRYMmJH.iMXtW
ATKZIXMXMTcNQBkR4vwzvyd8.iMXtW
WHtZ4JKGLC8KYssMn5mCxKqU.iMXtW
lcAOenZ7s03BpPi8XKS0vsK3.iMXtW
yyufcaLu4eKWcnGzhes30t6M.iMXtW
~~~

Now fetch the list of currently active SQL roles from the CockroachDB client:

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url $CLI_DB_CONNECTION_URL --execute "show users;"
~~~

~~~txt
                       username                       |                options                | member_of
------------------------------------------------------+---------------------------------------+------------
  admin                                               |                                       | {}
  root                                                |                                       | {admin}
  v-token-hc-crdb-rol-uqtqyca6neplilakhv55-1653513157 | VALID UNTIL=2022-05-25 22:12:42+00:00 | {}
  v-token-hc-crdb-rol-0gzk3hwi7k7a9w1ggggq-1653515525 | VALID UNTIL=2022-05-25 22:52:10+00:00 | {}
  v-token-hc-crdb-rol-varnevyjgjg9zgf62kps-1653515522 | VALID UNTIL=2022-05-25 22:52:07+00:00 | {}
  v-token-hc-crdb-rol-wltbv25napuroomvzmok-1653515524 | VALID UNTIL=2022-05-25 22:52:09+00:00 | {}
~~~

### Revoke credentials

Revoke a lease or two just for the feeling of raw power. Recall that a "lease" on a "role" in Vault terms corresponds to an actual credential pair on the CockroachDB cluster, i.e., a username/password combination for a SQL user.

{% include_cached copy-clipboard.html %}
~~~shell
vault lease revoke database/creds/crdb-role/XIpIBRM8FkQxD5B0ndB1lszY.iMXtW
~~~

~~~txt
All revocation operations queued successfully!
~~~

### Provision a CockroachDB-client Vault policy

As admin, provision a Vault policy for CockroachDB client operators to access the client credentials.

The purpose of the previous work is to make a dynamic secret that can be used to access the CockroachDB database by generating credentials on demand. Performing the above work (establishing the connection between the CockroachDB cluster and the Vault cluster, creating the template for database client credentials, etc.) required admin privileges. But for the work to be meaningful, a Vault user with more limited permisions must be able to access the generated credentials.

This policy will be used to access CockroachDB client credentials. In keeping with the [principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege), let's give it only the required ability to read the required credential. 

Vault policies are specified using HashiCorp Configuration Language (HCL). The following configuration specifies a policy of read access for the `crdb-role` credential.

{% include_cached copy-clipboard.html %}
~~~shell
vault policy write roach-client - <<hcl
path "database/creds/crdb-role" {
  capabilities = [ "read" ]
}
hcl
~~~

~~~shell
Success! Uploaded policy: roach-client
~~~

### Generate an authentication token for the `crdb-role` Vault user

Our final act as Vault admin will be to provision an authentication token to assume the `crdb-role`, which represents the Vault role with the sole purpose of providing credentials ot a CockroachDB client.

{% include_cached copy-clipboard.html %}
~~~shell
 vault token create -policy=roach-client
~~~

~~~txt
Key                  Value
---                  -----
token                hvs.CAESIK4TK7JcSJuKxOgwEa3mYhvfN356Uhikij821K4E4XnWGigKImh2cy5MeUJ5dGNxMjRzNk9qNmVDYWtFYjRUd2QuaU1YdFcQ1cAT
token_accessor       36udxC5m0hmA0niBYyCThk0k.iMXtW
token_duration       1h
token_renewable      true
token_policies       ["default" "roach-client"]
identity_policies    []
policies             ["default" "roach-client"]
~~~

You can either copy the `token` from the output of the previous command, or capture a token with the following command.

~~~shell
 VAULT_CLIENT_TOKEN=`vault token create -policy=roach-client -format=json | jq .auth.client_token | tr -d '"'`
~~~

## Connecting to CockroachDB with Vault-provisioned credentials

### Authenticate to Vault as the CockroachDB user

Use the client token to authenticate to Vault with limited permissions.

{% include_cached copy-clipboard.html %}
~~~shell
vault login $VAULT_CLIENT_TOKEN
~~~

~~~txt
Success! You are now authenticated. The token information displayed below
is already stored in the token helper. You do NOT need to run "vault login"
again. Future Vault requests will automatically use this token.
~~~

### Confirm the limited permissions of the role

To confirm that you have assumed a role with limited permissions, try listing the current leases on the `crdb-role`, as we did [previously](#). You should see a permissions error.

{% include_cached copy-clipboard.html %}
~~~shell
vault list sys/leases/lookup/database/creds/crdb-role/
~~~

~~~txt
Error listing sys/leases/lookup/database/creds/crdb-role: Error making API request.

Namespace: admin/
URL: GET https://roach-test-vault.vault.bfb2290a-670b-4a10-bedf-5aab18e84d69.aws.hashicorp.cloud:8200/v1/sys/leases/lookup/database/creds/crdb-role?list=true
Code: 403. Errors:

* 1 error occurred:
  * permission denied
~~~

### Pull the CockroachDB credentials

The only thing this policy *does* have permission to do is pull credentials for the CockroachDB cluster. Let's do that.

{% include_cached copy-clipboard.html %}
~~~shell
vault read database/creds/crdb-role
~~~

~~~txt
Key                Value
---                -----
lease_id           database/creds/crdb-role/V3T4UVxeQ9RYsJAk3jZF1Dhl.iMXtW
lease_duration     1h
lease_renewable    true
password           FlOo0p7jMTXjT27hlZZ-H
username           v-token-crdb-rol-thfLPlFwex0k9Op0P8qA-1653528652
~~~
  
### Connect to the CockroachDB cluster with your Vault-generated dynamic secret credentials

List all the tables in database `defaultdb` to confirm you can connect to your CockroachDB cluster.

{% include_cached copy-clipboard.html %}
~~~shell
USER_NAME=v-token-crdb-rol-thfLPlFwex0k9Op0P8qA-1653528652 # generated CockroachDB client username
PASSWORD=FlOo0p7jMTXjT27hlZZ-H # generated CockroachDB client password
DB_NAME=defaultdb
CLUSTER_NAME=lilac-grizzly-684
HOST=free-tier21.aws-us-west-2.crdb.io
TLS_OPTS="sslrootcert=root.crt&sslmode=verify-full&options=--cluster=${CLUSTER_NAME}"
export CLI_DB_CONNECTION_URL="postgresql://$USER_NAME:$PASSWORD@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"
cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show tables;"
~~~

~~~sql
SHOW TABLES 0


Time: 120ms
~~~

To confirm that the credentials have been properly limited, attempt a forbidden operation. `crdb-role`  does not have permission to list users, so try that in order to generated a permissions error.

{% include_cached copy-clipboard.html %}
~~~shell
cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show users;"
~~~

~~~txt
ERROR: user v-token-crdb-rol-thflplfwex0k9op0p8qa-1653528652 does not have SELECT privilege on relation users
SQLSTATE: 42501
Failed running "sql"
~~~















