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

## The unstated, unchangeable `root` access rule

The `root` SQL user can always authenticate using username/password or certificate, as if the first rule of the configuration were:

```
# TYPE    DATABASE      USER           ADDRESS             METHOD
  host    all           root           all                 root
```

This rule is not displayed in the configuration, and cannot be overridden.
This ensures that access to the cluster can always be recovered, but it also means that access with root credentials cannot be restricted by IP range at the authentication configuration level.

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