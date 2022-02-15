---
title: Authentication
summary: An overview of Cluster Auth Config capabilities and interface syntax
toc: true
docs_area:
---

CockroachDB allows fine grained configuration of which attempts to connect with the database it will allow to proceed to the authentication stage, and which authentication methods it will accept, based on:

- WHO is making the attempt (SQL user), and 
- WHERE on the internet (IP Address) the attempt is coming from.

Future releases will also allow authentication to be configured for specific databases within clusters. Note that CockroachDB already supports fine-grained authorization at the database and table level via permissions grants.


## Currently supported authentication methods by product



Authentication Method | CockroachDB Cloud | Supported in CockroachDB Core | CockroachDB Enterprise Support  
-------------|------------|-----|----
password              |      ✓              |           ✓                    |    ✓
TLS cert              |      &nbsp;         |           ✓                    |    ✓
GSS                   |      &nbsp;         |           &nbsp;               |    ✓


All products also support the following no-op 'authentication methods' (authentication is not actually performed):

- `reject`: unconditionally rejects the connection attempt
- `trust`: unconditionally rejects the connection attempt


## Authentication Configuration

CockroachDB's authentication behavior is configured using a domain specific language (DSL), shared with PostgreSQL, called host-based authentication (HBA).

A specific CockroachDB cluster's authentication behavior is configured by setting it's `server.host_based_authentication.configuration` cluster setting, which accepts a single text field that must be a correctly formatted HBA manifest.

See the `show cluster setting` and `set cluster setting` cockroach commands.

### HBA Configuration Syntax

Each line of an Authentication Configuration (HBA) manifest defines a rule.
Lines commented with '#' are ignored.

For example, the following silly but easy to understand configuration has three rules:

- the first allows the CEO to connect to the database from their house without even using a password (they fired everyone who told them this was a bad idea),
- the second rule ensures that a known saboteur cannot even attempt to authenticate with the database from anywhere,
- the third rule allows all other users to authenticate using a password.


```
 # TYPE  DATABASE        USER           ADDRESS             METHOD       OPTIONS
  host    all            ceo            555.123.456.789/32  trust
  host    all            saboteur       all                 reject
  host    all            all            all                 password
```

Each rule definition contains <i>up to</i> 6 values.

1. Each line must begin with a <b>Connection Type</b>. CockroachDB currently supports two connection types:
	1. `local`, and
	1. `host`, which means any remote host
1. <b>DB</b>, which defines the name of the database(s) to which the rule will apply. Currently, CockroachDB only supports <b>cluster-wide rules</b>, so the value in this column must be `all`.
1. <b>User</b>, which defines the username to which the rule applies. CockroachDB requires all connection requests to include a username. If the presented username exists in the `system.users` table and has the LOGIN option enabled, CockroachDB will check the authentication configuration to find an allowed method by which the user may authenticate. This parameter can also take the value `all`, in which case it will match all users. (therefore all rules afterward are moot, if they are on the same TYPE confirm this!!!)
1. <b>Address</b> specifies the IP range which the rule will allow or block, either with the keyword "all", or with a valid IP address. The IP address can include an IP mask (i.e. the value can be of the format XXX.XXX.XXX.XXX/X), or not, in which case the <i>next</i> value must be the mask (i.e. the value of this field will be of the form XXX.XXX.XXX.XXX, in which case the next field must be a valid IP mask).
1. <b>IP Mask</b> (unless the Address in the prior field included or did not require an IP mask).
1. <b>Authentication Method</b> by which specified user(s) may authenticate from specified addresses. 
	- password
	- cert
	- cert-password
	- gss
	- reject
	- trust



## Default Behavior

### CockroachDB Serverless Cloud

The default authentication configuration for CockroachDB Serverless Cloud clusters is equivalent to the following configuration

```
 # TYPE  DATABASE        USER           ADDRESS             METHOD       OPTIONS
  host    all            all            all                 password

```

This is convenient for quick usage and experimentation, but is not suitable for clusters containing valuable data. It is best practice to [configure SQL authentication for hardened CockroachDB Serverless cluster security](config-secure-hba.html).

### CockroachDB Dedicated Cloud

CockroachDB Dedicated Cloud clusters enforce IP allow-listing, which can be configured through the Web Console.

See [Managing Network Authorization for CockroachDB Dedicated](../cockroachcloud/network-authorization.html).

### Self-Hosted

CockroachDB deploys with the following default HBA configuration.


```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             root            all                     cert-password
host    all             all             all                     cert-password
local   all             all                                     password
```



