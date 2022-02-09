---
title: Cluster Authentication Configuration (HBA)
summary: An overview of Cluster Auth Config capabilities and interface syntax
toc: true
docs_area:
---

CockroachDB supports fine-grained configuration of its authentication behavior, in terms of combinations of: 

- WHO is allowed to connect (SQL users)
- from WHERE on the internet (IP address ranges)
- HOW they prove their identity (using which authentication methods)

Future releases will also allow the above to be configured for specific databases within clusters.

Authentication behavior is configured using a domain specific language (DSL), shared with PostgreSQL, called host-based authentication (HBA).

A CockroachDB cluster's authentication behavior is configured by setting it's `server.host_based_authentication.configuration` cluster setting, which accepts a single text field that must be a correctly formatted HBA manifest.

See the `show cluster setting` and `set cluster setting` cockroach commands.


## Authentication Configuration (HBA) Syntax

Each line of an Authentication Configuration (HBA) manifest defines a rule.
Lines commented with '#' are ignored.

For example, the following silly but easy to understand configuration has three rules:

- the first allows the CEO to connect to the database from their house without even using a password (they fired everyone who told them this was a bad idea),
- the second rule makes sure that a known sabateur cannot connect the database from anywhere,
- the third rule allows all other users to connect using a password.


```
 # TYPE  DATABASE        USER           ADDRESS             METHOD       OPTIONS
  host    all            ceo            555.123.456.789/32  trust
  host    all            sabateur       all                 reject
  host    all            all            all                 password
```

Each rule definition contains <i>up to</i> 6 values.

1. Each line must begin with a <b>Connection Type</b>. CockroachDB currently supports two connection types:
	1. `local`, and
	1. `host`, which means any remote host
1. <b>DB</b>, which defines the name of the database(s) to which the rule will apply. Currently, CockroachDB only supports <b>cluster-wide rules</b>, so the value in this column must be `all`.
1. <b>User</b>, which defines the username to which the rule applies. CockroachDB's conenction protocol requires all connection requests to include a username. If username exists in the `system.users` table and has the LOGIN option enabled, CockroachDB will check the authentication configuration to find an allowed method by which the user may authenticate. Can also take the value `all`.
1. <b>Address</b> specifies the IP range which the rule will allow or block, either with the keyword "all", or with a valid IP address. The IP address can include an IP mask (i.e. the value can be of the format XXX.XXX.XXX.XXX/X), or not, in which case the <i>next</i> value must be the mask (i.e. the value of this field will be of the form XXX.XXX.XXX.XXX, in which case the next field must be a valid IP mask).
1. <b>IP Mask</b> (unless the Address in the prior field included or did not require an IP mask).
1. <b>Authentication Method</b> by which specified user(s) may authenticate from specified addresses. 
	- password
	- cert
	- cert-password
	- gss
	- reject
	- trust



## Currently supported authentication methods by product

- Cloud and Self-Hosted
	- password
	- reject
	- trust
- Self-Hosted Only
	- cert / cert-password
- Self-Hosted with Enterprise Only
	- gss


## Default Behavior

### Cockroach Cloud Serverless

The default authentication configuration for Cockroach Cloud Serverless clusters is equivalent to the following configuration

```
 # TYPE  DATABASE        USER           ADDRESS             METHOD       OPTIONS
  host    all            all            all                 password

```

This is convenient for quick usage and experimentation, but is not suitable for clusters containing valuable data.

See [Securing access to your cockroach cloud cluster using CockroachDB Authentication Configuration (HBA)](hba-simple-cloud-tutorial)



### Ded (different?)

### DYI

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             root            all                     cert-password
host    all             all             all                     cert-password
local   all             all                                     password
```


not great, password access is insecure, so should be either jump-box secured if you gotta have password only for some reason, or use cert only from jumpbox.

ideally, cert only for external traffic, keep certs on your jumpbox and app sever.



## Further Reading


- [Tutorial: Secure access to your cockroach cloud cluster using CockroachDB Authentication Configuration (HBA)](hba-simple-cloud-tutorial)
- [Tutorial: Secure access to your Self-Deployed CockroachDB cluster using CockroachDB Authentication Configuration (HBA)](hba-simple-cloud-tutorial)

