Managing database credentials centrally is a recommended security practice. This tutorial shows how to manage CockroachDB database credentials using Hashicorp Vault's [PostgreSQL database secrets engine](https://www.vaultproject.io/docs/secrets/databases/postgresql), which provides centralized, secure, and auditable management of database credentials.

See also:

- [CockroachDB Integration with HashiCorp Vault]({% link {{ page.version.version }}/hashicorp-integration.md %})
- [Vault's Dynamic Secrets model](https://www.vaultproject.io/use-cases/dynamic-secrets)
- [Vault's tutorial for Database Secrets Engine](https://learn.hashicorp.com/tutorials/vault/database-secrets).

## Before you begin

Before you start this tutorial:

- Either [Create a CockroachDB {{ site.data.products.standard }} cluster]({% link cockroachcloud/create-your-cluster.md %}) or [Start a Local Cluster]({% link {{ site.current_cloud_version }}/start-a-local-cluster.md %}). Make a note of the cluster's name.

    For a cluster in CockroachDB {{ site.data.products.cloud }}, download the cluster's CA certificate locally. Refer to [Connect to your cluster]({% link cockroachcloud/connect-to-your-cluster.md %}).
- Create a SQL user and make a note of the username and password. Refer [Create a SQL user in CockroachDB Cloud]({% link cockroachcloud/managing-access.md %}#create-a-sql-user) or [Create a SQL user in CockroachDB {{ site.data.products.core }}]({% link {{ site.current_cloud_version }}/create-user.md %}).
- [Create a Vault cluster in HashiCorp Cloud](https://learn.hashicorp.com/collections/vault/cloud) or [start a development Vault cluster locally](https://learn.hashicorp.com/tutorials/vault/getting-started-dev-server).
- [Install the `cockroach` CLI]({% link {{ page.version.version }}/install-cockroachdb.md %}).
- [Install the Vault CLI](https://www.vaultproject.io/downloads).

## Step 1: Configure your local environment

In this phase, an administrator of your organization provisions access to a class of database clients by creating a set of credentials and propagating them to Vault.

1. Set your CockroachDB cluster credentials and other configuration information as environment variables using the information you gathered previously.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export CA_CRT_PATH=/path/to/root.crt # Path to the CA certificate you downloaded
    export USER_NAME=tutorialadmin # SQL username
    export PASSWORD=1234asdf # SQL user password
    export DB_NAME=defaultdb # Database name
    export CLUSTER_NAME=lilac-grizzly-684 # Cluster name
    export HOST=my-cluster.aws-us-west-2.crdb.io # Cluster host
    ~~~

1. Construct a database connection URL for your CockroachDB CLI to connect to the cluster

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export TLS_OPTS="&sslrootcert=${CA_CRT_PATH}&sslmode=verify-full
    export CLI_DB_CONNECTION_URL="postgresql://${USER_NAME}:${PASSWORD}@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"
    ~~~

1. Execute a SQL statement to test your connection.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show tables;"
    ~~~
    ~~~txt
    SHOW TABLES 0

    Time: 107ms
    ~~~

1. Set your Vault target and the `admin` Vault namespace.

    You can fetch your target URL and generate a token from the [HashiCorp Vault console](https://portal.cloud.HashiCorp.com/services/vault), under the **Access Vault** tab.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export VAULT_ADDR=https://roach-test-vault.vault.bfb2290a-670b-4a10-bedf-5aab18e84d69.aws.HashiCorp.cloud:8200 # your Vault cluster URL
    export VAULT_NAMESPACE=admin
    ~~~

1. Authenticate to your Vault, providing the admin token when prompted:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault login
    ~~~
    ~~~
    Success! You are now authenticated...
    ~~~

1. Enable the Vault database secrets engine
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault secrets enable database
    ~~~

For more information on using the Vault Secrets CLI, refer to [Vault's documentation](https://www.vaultproject.io/docs/commands/secrets).

## Step 2: Connect Vault to your cluster

In this step, you save your CockroachDB credentials in Vault so that it can perform administrative tasks on the cluster.

1. Modify the `$VAULT_TLS_OPTS` environment variable you created earlier to skip TLS server authentication. The Vault server cannot use the CockroachDB cluster's CA certificate. In this connection string, the username and password fields are Vault variables.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export VAULT_TLS_OPTS="sslmode=require"
    export VAULT_DB_CONNECTION_URL="postgresql://{% raw %}{{username}}:{{password}}{% endraw %}@${HOST}:26257
    ~~~

1. Write the `crdb-config` database configuration to Vault, specifying admin credentials that will be used by Vault to create credentials for your defined role:

    {% include_cached copy-clipboard.html %}
    ~~~shell
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

## Step 3: Provision Dynamic Secrets

In Vault, a *dynamic secret* is a secret template that can be used to generate particular short-lived secrets on demand. The secret type we'll be using is `/database/role`. A Vault database role does not correspond to a single role or user in SQL, but a template for creating short-lived roles or users.

For a SQL role, the template is defined by its `creation_statements`, which are SQL statements that create the role, define its options and grant its permissions.

1. Create a Vault database role.

    For example, create a role that has all privileges on the `defaultdb` database. In this command, `db_name` is the name of the the Vault database secrets engine namespace ( `crdb-config` in the example).

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault write database/roles/crdb-role \
        db_name=crdb-config \
        {% raw %}creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
            GRANT ALL ON DATABASE defaultdb TO \"{{name}}\";" \
        default_ttl="1h" \
        max_ttl="24h"{% endraw %}
    ~~~

1. Query Vault for a list of database roles, revealing the newly created role:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault list database/roles/
    ~~~
    ~~~txt
    Keys
    ----
    crdb-role
    ~~~

1. Inspect the role:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault read database/roles/crdb-role
    ~~~
    ~~~txt
    Key                      Value
    ---                      -----
    creation_statements      [CREATE ROLE "{% raw %}{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT ALL ON DATABASE defaultdb TO "{{name}}{% endraw %}";]
    db_name                  crdb-config
    default_ttl              1h
    max_ttl                  24h
    renew_statements         []
    revocation_statements    []
    rollback_statements      []
    ~~~

1. Show the list of Vault users:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url $CLI_DB_CONNECTION_URL --execute "show users;"
    ~~~
    ~~~txt
    username | options | member_of
    ---------+---------+------------
    admin    |         | {}
    docsrule |         | {admin}
    root     |         | {admin}
    ~~~

1. A Vault role is a defined *template* for credential pairs (SQL user/role name and password), which will be generated on demand and quickly expired. Reading a Vault role does not fetch credentials for a pre-existing SQL user, but requests that Vault create a user on demand, according to the template. Run the following command several times to generate several credential pairs:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault read database/creds/crdb-role
    ~~~
    Notice that the validity duration is the default value of 1 hour.

    ~~~txt
    Key                Value
    ---                -----
    lease_id           database/creds/crdb-role/5rPhNN6aG0dNRs97UmRYMmJH.iMXtW
    lease_duration     1h
    lease_renewable    true
    password           a1qKnD-ZjFG-oUMcSFtx
    username           v-token-hc-crdb-rol-1pcS5YcSaSS4Fgy4BiXp-1653512968
    ~~~

1. List the active credentials (or *leases*, in Vault terms) for the Vault role:

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

1. Fetch the list of currently active SQL roles from the CockroachDB client:

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

1. Revoke credentials by revoking a lease. A *lease* on a *role* in Vault terms corresponds to an actual credential pair for a SQL user on the CockroachDB cluster.

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault lease revoke database/creds/crdb-role/XIpIBRM8FkQxD5B0ndB1lszY.iMXtW
    ~~~
    ~~~txt
    All revocation operations queued successfully!
    ~~~

1. Next, provision a Vault _policy_ for CockroachDB client operators so that they can access the client credentials without having the admin role on the CockroachDB cluster.

    This policy will be used to access CockroachDB client credentials. This example grants it only the required ability to read the required credential.

    Vault policies are specified using [HashiCorp Configuration Language (HCL)]( https://github.com/hashicorp/hcl/blob/main/hclsyntax/spec.md). The following configuration specifies a policy of read access for the `crdb-role` credential:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault policy write roach-client - <<hcl
    path "database/creds/crdb-role" {
      capabilities = [ "read" ]
    }
    hcl
    ~~~
    ~~~
    Success! Uploaded policy: roach-client
    ~~~

1. Generate an authentication token for the `crdb-role` Vault user.

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

    You can either copy the `token` from the output of the previous command, or capture a token with the following command (which requires the shell utility [jq](https://stedolan.github.io/jq/)).

    ~~~shell
     VAULT_CLIENT_TOKEN=`vault token create -policy=roach-client -format=json | jq .auth.client_token | tr -d '"'`
    ~~~

## Step 4: Authenticate with Vault-provisioned credentials

This step shows how to use credentials provisioned by Vault to access a CockroachDB cluster, emulating the flow that an application engineer or application service account might use to access the database. This step does not use Vault admin credentials or CockroachDB credentials acquired outside of Vault.

1. Authenticate to Vault using the client token:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    vault login $VAULT_CLIENT_TOKEN
    ~~~

1. Confirm the limited permissions of the role:

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

1. Read the CockroachDB credentials:

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

1. Using the previous output, add the `crdb-role` credentials to your environment:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    export USER_NAME=v-token-crdb-rol-thfLPlFwex0k9Op0P8qA-1653528652 # generated CockroachDB client username
    export PASSWORD=FlOo0p7jMTXjT27hlZZ-H # generated CockroachDB client password
    export DB_NAME=defaultdb
    export CLUSTER_NAME=lilac-grizzly-684 # generated CockroachDB client password
    export HOST=free-tier21.aws-us-west-2.crdb.io
    export TLS_OPTS="sslrootcert=root.crt&sslmode=verify-full"
    export CLI_DB_CONNECTION_URL="postgresql://$USER_NAME:$PASSWORD@${HOST}:26257/${DB_NAME}?${TLS_OPTS}"
    ~~~

1. List all the tables in database `defaultdb` to confirm you can connect to your CockroachDB cluster:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show tables;"
    ~~~
    ~~~txt
    SHOW TABLES 0


    Time: 120ms
    ~~~

1. To confirm that the credentials have been properly limited, attempt a forbidden operation. `crdb-role`  does not have permission to list users, so try that in order to generate a permissions error:

    {% include_cached copy-clipboard.html %}
    ~~~shell
    cockroach sql --url "${CLI_DB_CONNECTION_URL}" --execute "show users;"
    ~~~
    ~~~txt
    ERROR: user v-token-crdb-rol-thflplfwex0k9op0p8qa-1653528652 does not have SELECT privilege on relation users
    SQLSTATE: 42501
    Failed running "sql"
    ~~~

{% unless page.version.version contains "v22" or page.version.version contains "v23" %}
## Speed up role management operations

User/role management operations (such as [`GRANT`]({% link {{ page.version.version }}/grant.md %}) and [`REVOKE`]({% link {{ page.version.version }}/revoke.md %})) are [schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}). As such, they inherit the [limitations of schema changes]({% link {{ page.version.version }}/online-schema-changes.md %}#known-limitations).

For example, schema changes wait for concurrent [transactions]({% link {{ page.version.version }}/transactions.md %}) using the same resources as the schema changes to complete. In the case of [role memberships]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles) being modified inside a transaction, most transactions need access to the set of role memberships. Using the default settings, role modifications require schema leases to expire, which can take up to 5 minutes.

If you want user/role management operations to finish more quickly, and do not care whether concurrent transactions will immediately see the side effects of those operations, set the [session variable]({% link {{ page.version.version }}/set-vars.md %}) `allow_role_memberships_to_change_during_transaction` to `true`. To learn more, refer to [How to speed up user / role assignment]({% link {{ page.version.version }}/hashicorp-integration.md %}#how-to-speed-up-user-role-management) and [`GRANT`]({% link {{ page.version.version }}/grant.md %}).
{% endunless %}
