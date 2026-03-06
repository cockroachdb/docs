---
title: SQL Authentication
summary: An overview of Cluster Authentication Configuration capabilities and interface syntax
toc: true
docs_area: reference.security
---

This page give an overview of CockroachDB's security features for authenticating the identity of SQL users attempting to connect to the cluster.

Instead, you might be looking for:

- [Logging in to the CockroachDB {{ site.data.products.cloud }} web console]({% link cockroachcloud/authentication.md %}).
- [Accessing the DB console on CockroachDB {{ site.data.products.core }} clusters]({% link {{ page.version.version }}/ui-overview.md %}).

## Authentication configuration

CockroachDB allows fine-grained configuration of which database connection attempts it allows to proceed to the authentication stage, and which authentication methods it accepts, based on:

- **Who** is making the attempt (SQL user).
- **Where** on the internet (IP Address) the attempt is coming from.

CockroachDB's authentication behavior is configured using a domain-specific language (DSL) called host-based authentication (HBA). HBA syntax is shared with PostgreSQL.

A specific CockroachDB cluster's authentication behavior is configured by setting its `server.host_based_authentication.configuration` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}), using the [`SET CLUSTER SETTING` statement]({% link {{ page.version.version }}/set-cluster-setting.md %}), which accepts a single text field that must be a correctly formatted HBA manifest. Inspect the current setting with [`SHOW CLUSTER SETTING`.]({% link {{ page.version.version }}/show-cluster-setting.md %})

## Supported authentication methods

Authentication Method          | CockroachDB {{ site.data.products.cloud }} | CockroachDB {{ site.data.products.core }} | CockroachDB {{ site.data.products.enterprise }}
-------------------------------|--------------------------------------------|-------------------------------------------|------------------------------------------------
password                       | ✓ | ✓ | ✓
username/password combination  | ✓ | ✓ | ✓
[SCRAM-SHA-256][SCRAM-SHA-256] | ✓ | ✓ | ✓
[certificate][certificate]     | ✓ | ✓ | ✓
GSS                            |   |   | ✓

All options also support the following no-op 'authentication methods', which do not perform authentication:

- `reject`: unconditionally rejects the connection attempt.
- `trust`: unconditionally accepts the connection attempt.

[SCRAM-SHA-256]: {% link {{ page.version.version }}/security-reference/scram-authentication.md %}
[certificate]: {% link {{ page.version.version }}/security-reference/transport-layer-security.md %}

## HBA configuration syntax

Each line of a Host-based Authentication (HBA) configuration manifest defines a rule. Lines commented with `#` are ignored.

For example, the following naive configuration has three rules:

- User `ceo` can connect to the database from a known IP address without a password.
- User `sabateur` cannot connect from anywhere.
- All users (including `ceo` but not `sabateur`) can connect from anywhere using a password.

```
 # TYPE    DATABASE      USER           ADDRESS             METHOD
   host    all           ceo            555.123.456.789/32  trust
   host    all           saboteur       all                 reject
   host    all           all            all                 password
```

Each rule definition contains up to 6 values.

1. Each line must begin with a connection **TYPE**. CockroachDB currently supports two connection types:
  1. `local`
  1. `host` (any remote host)
1. **`DATABASE`**, which defines the name of the database(s) to which the rule will apply. Currently, CockroachDB only supports **cluster-wide rules**, so the value in this column must be `all`.
1. **`USER`**, which defines the username to which the rule applies. CockroachDB requires all connection requests to include a username. If the presented username exists in the `system.users` table and has the `LOGIN` option enabled, CockroachDB will check the authentication configuration to find an allowed method by which the user may authenticate. This parameter can also take the value `all`, in which case it will match all users.
1. **`ADDRESS`** specifies the IP range which the rule will allow or block, either with the keyword "all", or with a valid IP address. The IP address can include an IP mask (the value of the field can be of the format XXX.XXX.XXX.XXX/X), or not, in which case the *next* value must be the mask (the value of this field will be of the form XXX.XXX.XXX.XXX, in which case the next field must be a valid IP mask).
1. **`IP MASK`** (unless the Address in the prior field included or did not require an IP mask).
1. Authentication **METHOD** by which specified user(s) may authenticate from specified addresses.
  - `password`: user may authenticate with a plaintext password.
  - `scram-sha-256`: user may authenticate via [Salted Challenge-Response]({% link {{ page.version.version }}/security-reference/scram-authentication.md %})
  - `cert`: user may authenticate with a PKI certificate signed by a trusted certificate authority CA.
  - `cert-password`: user may authenticate with either a certificate or a password. Additionally, the server may use a [SCRAM]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}) exchange, if the cluster setting `server.user_login.cert_password_method.auto_scram_promotion.enabled` is set to `true`.
  - `cert-scram-sha-25`: user may authenticate with either a certificate or a [SCRAM]({% link {{ page.version.version }}/security-reference/scram-authentication.md %}) exchange.
  - `gss`: user may authenticate with a GSSAPI token.
  - `ldap`: user may authenticate using [LDAP]({% link {{ page.version.version }}/ldap-authentication.md %})-compatible directory services, such as Microsoft Entra ID and Active Directory.
  - `reject`: server unconditionally rejects connection without performing authentication.
  - `trust`: server unconditionally allows connection without performing authentication.

## The `root` access rule

{{site.data.alerts.callout_info}}
**Preview Feature**: As of v26.1, you can optionally disable root login using the `--disallow-root-login` flag on `cockroach start`. This feature is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}#feature-availability-phases) and requires additional setup.
{{site.data.alerts.end}}

By default, the `root` SQL user can always authenticate using username/password or certificate, as if the first rule of the configuration were:

```
# TYPE    DATABASE      USER           ADDRESS             METHOD
  host    all           root           all                 root
```

This rule is not displayed in the configuration, and cannot be overridden through HBA configuration alone.
This ensures that access to the cluster can always be recovered, but it also means that access with root credentials cannot be restricted by IP range at the authentication configuration level.

### Disabling root login

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

<span class="version-tag">New in v26.1:</span> For compliance requirements, you can disable root user login using the `--disallow-root-login` flag when starting nodes. When this flag is set:

- Root user cannot authenticate via SQL or RPC connections
- Any certificate with "root" in the CommonName or SubjectAlternativeName is rejected
- Error messages indicate root login has been disallowed

{{site.data.alerts.callout_danger}}
**Important Prerequisites**:

- Before disabling root, it is highly recommended to set up the `debug_user` for troubleshooting operations. See [Using debug_user for diagnostics](#using-debug_user-for-diagnostics).
- Ensure no cluster or client certificates contain "root" in their SAN (Subject Alternative Name) fields, as these will be blocked.
- The cluster does not validate that `debug_user` is configured before allowing root to be disabled.

{{site.data.alerts.end}}

For setup instructions, see [Disable root login and use debug_user](#disable-root-login-and-use-debug_user).

### Using debug_user for diagnostics

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

<span class="version-tag">New in v26.1:</span> The `debug_user` is a special privileged user designed for collecting [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) and [`cockroach debug tsdump`]({% link {{ page.version.version }}/cockroach-debug-tsdump.md %}) data when root is disabled. Unlike root, `debug_user`:

- Must be explicitly enabled using the `--allow-debug-user` flag on `cockroach start`
- Is disabled by default for security
- Must be manually created using `CREATE USER debug_user`
- Requires a certificate with "debug_user" in CommonName or SubjectAlternativeName
- Has privileged access to `serverpb` admin and status endpoints required for debug zip and tsdump collection
- Can be audited using `SHOW USERS`

The `debug_user` is not subject to the `--disallow-root-login` flag and provides a secure, auditable alternative for these diagnostic operations.

CockroachDB {{ site.data.products.advanced }} or CockroachDB {{ site.data.products.core }} customers can and should enforce network protections, preventing access attempts from any sources other than a valid ones such as application servers or a secure operations jumpbox.

## Default behavior

### CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }}

The default authentication configuration for CockroachDB {{ site.data.products.standard }} and CockroachDB {{ site.data.products.basic }} clusters is equivalent to the following configuration:

```
 # TYPE    DATABASE      USER        ADDRESS       METHOD
   host    all           all         all           password
```

This is convenient for quick usage and experimentation, but is not suitable for clusters containing production data. It is a best practice to configure SQL authentication for hardened CockroachDB cluster security.

### CockroachDB {{ site.data.products.advanced }}

CockroachDB {{ site.data.products.advanced }} clusters enforce IP allowlisting. Each cluster has an allowlist, which is configured through the CockroachDB Cloud Console.

See [Managing Network Authorization for CockroachDB {{ site.data.products.advanced }}]({% link cockroachcloud/network-authorization.md %}).

### CockroachDB {{ site.data.products.core }}

CockroachDB {{ site.data.products.core }} deploys with the following default HBA configuration:

```
# TYPE    DATABASE      USER        ADDRESS        METHOD
  host    all           root        all            cert-password
  host    all           all         all            cert-password
  local   all           all                        password
```

### Access for SQL health monitoring

CockroachDB {{ site.data.products.cloud }} uses a service user named `managed-sql-prober` that regularly runs `SELECT 1;` queries on the cluster to monitor and report issues with SQL availability. The default host-based authentication configurations allow this service user to run, but more restrictive HBA configurations may prevent SQL availability monitoring. To explicitly enable this service user to authenticate, add the following line to your HBA configuration:

```
# TYPE    DATABASE      USER                 ADDRESS        METHOD
  host    all           managed-sql-prober   all            cert
```

## Disable root login and use debug_user

This procedure shows how to configure a cluster to disable root login for compliance requirements while maintaining the ability to collect debug zip and tsdump data.

{{site.data.alerts.callout_info}}
While it is possible to disable root login without first setting up `debug_user`, enabling `debug_user` later when diagnostic data is needed requires a rolling restart of all cluster nodes and at least one other admin user to create it. This can add significant delay during troubleshooting incidents. We recommend setting up `debug_user` before disabling root login to ensure diagnostic capabilities are immediately available when needed.
{{site.data.alerts.end}}

### Before you begin

- You must have an existing CockroachDB cluster
- You must have root access to create the `debug_user`
- You must have access to the CA key to generate certificates

### Step 1: Create debug_user

1. Connect to the cluster as a user with admin privileges (such as `root`):

   {% include_cached copy-clipboard.html %}
   ~~~ shell
   cockroach sql --certs-dir=certs
   ~~~

1. Create the debug_user:

   {% include_cached copy-clipboard.html %}
   ~~~ sql
   CREATE USER debug_user;
   ~~~

1. Grant SQL privileges for debug zip collection.

   While `cockroach debug tsdump` does not require any SQL privileges, these privileges are required for `cockroach debug zip`. Cockroach Labs recommends granting them during initial setup to ensure debug zip capability is immediately available when needed. Another admin user can grant these privileges later if needed, but pre-configuring them avoids delays during troubleshooting.

   **Option 1**: Grant the `admin` role (simplest approach):

   {% include_cached copy-clipboard.html %}
   ~~~ sql
   GRANT admin TO debug_user;
   ~~~

   **Option 2**: Grant specific system privileges required for debug zip collection:

   {% include_cached copy-clipboard.html %}
   ~~~ sql
   GRANT SYSTEM VIEWACTIVITY TO debug_user;
   GRANT SYSTEM VIEWACTIVITYREDACTED TO debug_user;
   GRANT SYSTEM VIEWCLUSTERMETADATA TO debug_user;
   GRANT SYSTEM VIEWCLUSTERSETTING TO debug_user;
   GRANT SYSTEM VIEWSYSTEMTABLE TO debug_user;
   GRANT SYSTEM REPAIRCLUSTER TO debug_user;
   ~~~

### Step 2: Generate debug_user certificate

Generate a client certificate for debug_user. See [Create a debug_user client certificate]({% link {{ page.version.version }}/cockroach-cert.md %}#create-a-debug_user-client-certificate-preview) for detailed instructions.

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach cert create-client debug_user \
  --certs-dir=certs \
  --ca-key=my-safe-directory/ca.key
~~~

This creates `client.debug_user.crt` and `client.debug_user.key` in the `certs` directory.

### Step 3: Test debug_user access

Before disabling root, verify that debug_user can collect debug information:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach debug zip test-debug.zip \
  --certs-dir=certs \
  --user=debug_user
~~~

If successful, you should see debug information being collected.

### Step 4: Enable debug_user on all nodes

Perform a rolling restart of all nodes with the `--allow-debug-user` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start \
  --certs-dir=certs \
  --allow-debug-user \
  [other existing flags...]
~~~

### Step 5: Disable root login

After all nodes have been restarted with `--allow-debug-user`, perform another rolling restart with the `--disallow-root-login` flag:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach start \
  --certs-dir=certs \
  --disallow-root-login \
  --allow-debug-user \
  [other existing flags...]
~~~

### Step 6: Verify configuration

1. Verify root is blocked:

   {% include_cached copy-clipboard.html %}
   ~~~ shell
   cockroach sql --certs-dir=certs --user=root
   ~~~

   ~~~
   ERROR: certificate authentication failed for user "root"
   ~~~

1. Verify debug_user works:

   {% include_cached copy-clipboard.html %}
   ~~~ shell
   cockroach sql --certs-dir=certs --user=debug_user -e "SELECT current_user();"
   ~~~

   ~~~
     current_user
   ----------------
     debug_user
   ~~~

1. Verify debug zip collection:

   {% include_cached copy-clipboard.html %}
   ~~~ shell
   cockroach debug zip production-debug.zip \
     --certs-dir=certs \
     --user=debug_user
   ~~~

### Security best practices

- Only enable `--allow-debug-user` when debugging is actively needed
- Monitor `debug_user` activity through audit logs
- Consider disabling `debug_user` (removing `--allow-debug-user` flag) when not in use
- Rotate `debug_user` certificates regularly
- Ensure `debug_user` certificate files have appropriate permissions (mode 0700)

### Troubleshooting

**Error: "failed to perform RPC, as root login has been disallowed"**

- Root login is disabled. Use `debug_user` or another administrative user.

**Error: "failed to perform RPC, as debug_user login is not allowed"**

- The `--allow-debug-user` flag is not set on the server. Restart the node with this flag.

**Error: "certificate authentication failed for user 'debug_user'"**

- Either the `debug_user` certificate is invalid or `--allow-debug-user` is not set.
- Verify the certificate has "debug_user" in CommonName or SubjectAlternativeName.

### See also

- [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %})
- [`cockroach cert create-client`]({% link {{ page.version.version }}/cockroach-cert.md %}#subcommands)
- [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %})
- [CREATE USER]({% link {{ page.version.version }}/create-user.md %})