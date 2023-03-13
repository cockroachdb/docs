---
title: SQL Authentication
summary: An overview of Cluster Authentication Configuration capabilities and interface syntax
toc: true
docs_area: reference.security
---

This page give an overview of CockroachDB's security features for authenticating the identity of SQL users attempting to connect to the cluster.

Instead, you might be looking for:

- [Logging in to the {{ site.data.products.db }} web console](../../cockroachcloud/authentication.html).
- [Accessing the DB console on {{ site.data.products.core }} clusters](../ui-overview.html).

## Authentication configuration

CockroachDB allows fine-grained configuration of which database connection attempts it allows to proceed to the authentication stage, and which authentication methods it accepts, based on:

- **Who** is making the attempt (SQL user).
- **Where** on the internet (IP Address) the attempt is coming from.

CockroachDB's authentication behavior is configured using a domain-specific language (DSL) called host-based authentication (HBA). HBA syntax is shared with PostgreSQL.

A specific CockroachDB cluster's authentication behavior is configured by setting its `server.host_based_authentication.configuration` [cluster setting](../cluster-settings.html), using the [`SET CLUSTER SETTING` statement](../set-cluster-setting.html), which accepts a single text field that must be a correctly formatted HBA manifest. Inspect the current setting with [`SHOW CLUSTER SETTING`.](../show-cluster-setting.html)

## Currently supported authentication methods

Authentication Method | CockroachDB Cloud | Supported in CockroachDB Core | CockroachDB Enterprise Support  
-------------|------------|-----|----
password              |      ✓              |           ✓                    |    ✓
[SCRAM-SHA-256](scram-authentication.html)         |      ✓              |           ✓                    |    ✓
certificate              |      &nbsp;         |           ✓                    |    ✓
username/password combination              |      ✓              |           ✓                    |    ✓
[certificate](transport-layer-security.html)              |      &nbsp;         |           ✓                    |    ✓
GSS                   |      &nbsp;         |           &nbsp;               |    ✓

All options also support the following no-op 'authentication methods' (authentication is not actually performed):

- `reject`: unconditionally rejects the connection attempt.
- `trust`: unconditionally rejects the connection attempt.

### HBA configuration syntax

Each line of an Authentication Configuration (HBA) manifest defines a rule. Lines commented with `#` are ignored.

For example, the following silly but easy-to-understand configuration has three rules:

- The first allows the CEO to connect to the database from their house without even using a password (they fired everyone who told them this was a bad idea).
- The second rule ensures that a known saboteur cannot even attempt to authenticate with the database from anywhere.
- The third rule allows all other users to authenticate using a password.

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
  - `scram-sha-256`: user may authenticate via [Salted Challenge-Response](scram-authentication.html)
  - `cert`: user may authenticate with a PKI certificate signed by a trusted certificate authority CA.
  - `cert-password`: user may authenticate with either a certificate or a password. Additionally, the server may use a [SCRAM](scram-authentication.html) exchange, if the cluster setting `server.user_login.cert_password_method.auto_scram_promotion.enabled` is set to `true`.
  - `cert-scram-sha-25`: user may authenticate with either a certificate or a [SCRAM](scram-authentication.html) exchange.
  - `gss`: user may authenticate with a GSSAPI token.
  - `reject`: server rejects connection without performing authentication.
  - `trust`: server allows connection without performing authentication.

## The unstated, unchangeable `root` access rule

The `root` SQL user can always authenticate using username/password or certificate, as if the first rule of the configuration were:

```
# TYPE    DATABASE      USER           ADDRESS             METHOD
  host    all           root           all                 root
```

This rule is not displayed in the configuration, and cannot be overridden.
This ensures that access to the cluster can always be recovered, but it also means that access with root credentials cannot be restricted by IP range at the authentication configuration level.

{{ site.data.products.dedicated }} or {{ site.data.products.core }} customers can and should enforce network protections, preventing access attempts from any sources other than a valid ones such as application servers or a secure operations jumpbox.

## Default behavior

### {{ site.data.products.serverless }}

The default authentication configuration for {{ site.data.products.serverless }} clusters is equivalent to the following configuration:

```
 # TYPE    DATABASE      USER        ADDRESS       METHOD
   host    all           all         all           password
```

This is convenient for quick usage and experimentation, but is not suitable for clusters containing valuable data. It is a best practice to [configure SQL authentication for hardened {{ site.data.products.serverless }} cluster security](config-secure-hba.html).

### {{ site.data.products.dedicated }}

{{ site.data.products.dedicated }} clusters enforce IP allow-listing, which must be configured through the CockroachDB Cloud Console.

See [Managing Network Authorization for {{ site.data.products.dedicated }}](../../cockroachcloud/network-authorization.html).

### CockroachDB Self-Hosted

{{ site.data.products.core }} deploys with the following default HBA configuration:

```
# TYPE    DATABASE      USER        ADDRESS        METHOD
  host    all           root        all            cert-password
  host    all           all         all            cert-password
  local   all           all                        password
```



