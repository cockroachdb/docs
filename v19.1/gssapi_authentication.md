---
title: GSSAPI Authentication (Enterprise)
summary: Learn about the GSSAPI authentication features for secure CockroachDB clusters.
toc: true
---

CockroachDB supports the Generic Security Services API (GSSAPI) with Kerberos authentication as an [Enterprise feature](enterprise-licensing.html).

## Configuring KDC

This document assumes you have configured a Kerberos service principal name (SPN) for CockroachDB and generated a valid keytab file for CockroachDB as well.

## Configuring the CockroachDB node
1. Copy the keytab file at a location accessible by the cockroach binary.
2. [Create certificates](create-security-certificates.html) for internode and root user authentication:

  {% include copy-clipboard.html %}
  ~~~ shell
  $ mkdir certs my-safe-directory
  ~~~

  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach cert create-ca \
  --certs-dir=certs \
  --ca-key=my-safe-directory/ca.key
  ~~~

  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach cert create-node \
  localhost \
  $(hostname) \
  --certs-dir=certs \
  --ca-key=my-safe-directory/ca.key
  ~~~

  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach cert create-client \
  root \
  --certs-dir=certs \
  --ca-key=my-safe-directory/ca.key
  ~~~

4. Provide the path to the keytab in the `KRB5_KTNAME` environment variable:
  {% include copy-clipboard.html %}
  ~~~ shell
  $ KRB5_KTNAME=<path to keytab file>
  ~~~

5. Start a CockroachDB node:
  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach start \
  --certs-dir=certs \
  --listen-addr=localhost
  ~~~

6. Connect to CockroachDB as root using the root client certificate generated above:
  {% include copy-clipboard.html %}
  ~~~ shell
  $ cockroach sql --certs-dir=certs
  ~~~

7. [Enable an enterprise license](enterprise-licensing.html#obtain-a-trial-or-enterprise-license-key).

8. Enable GSSAPI authentication:
  {% include copy-clipboard.html %}
  ~~~ shell
  > SET cluster setting server.host_based_authentication.configuration = 'host all all all gss include_realm=0';
  ~~~

  Note that the `include_realm=0` option is required to tell CockroachDB to remove the `@DOMAIN.COM` realm information from the username. We don't support any advanced mapping of GSSAPI usernames to CockroachDB usernames right now. If you want to limit which realms' users can connect, you can also add one or more `krb_realm` parameters to the end of the line as a whitelist, as follows: `host all all all gss include_realm=0 krb_realm=domain.com krb_realm=corp.domain.com`

## Configuring the client

Note: You can use only psql clients to authenticate using Kerberos.

1. Install and configure your Kerberos client.
2. Install the Postgres client (for example, postgresql-client-10 Debian package from postgresql.org).
3. Get a Kerberos TGT from Active Directory using `kinit`.
4. Use the `psql` client, which natively supports GSSAPI authentication, to connect to CockroachDB:
  ~~~ shell
  > psql "postgresql://ad-client2.cockroach.industries:26257/defaultdb?sslmode=require"
  ~~~
5. You should now have a Postgres shell in CockroachDB, indicating that the GSSAPI authentication was successful.

## See also

- [Authentication](authentication.html)
- [Create Security Certificates](create-security-certificates.html)
