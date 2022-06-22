---
title: GSSAPI Authentication (Enterprise)
summary: Learn about the GSSAPI authentication features for secure CockroachDB clusters.
toc: true
---

CockroachDB supports the Generic Security Services API (GSSAPI) with Kerberos authentication.

{{site.data.alerts.callout_info}}
GSSAPI authentication is an [enterprise-only](enterprise-licensing.html) feature.
{{site.data.alerts.end}}

## Configuring KDC

To use Kerberos authentication with CockroachDB, configure a Kerberos service principal name (SPN) for CockroachDB and generate a valid keytab file with the following specifications:

- Set the SPN to the name specified by your client driver. For example, if you use the psql client, set SPN to `postgres`.
- Create SPNs for all DNS addresses that a user would use to connect to your CockroachDB cluster (including any TCP load balancers between the user and the CockroachDB node) and ensure that the keytab contains the keys for every SPN you create.

## Configuring the CockroachDB node
1. Copy the keytab file to a location accessible by the `cockroach` binary.

2. [Create certificates](create-security-certificates.html) for internode and `root` user authentication:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

3. Provide the path to the keytab in the `KRB5_KTNAME` environment variable.

4. Start a CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --listen-addr=0.0.0.0
    ~~~

5. Connect to CockroachDB as `root` using the `root` client certificate generated above:
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs
    ~~~

6. [Enable an enterprise license](enterprise-licensing.html#obtain-a-license).
    {{site.data.alerts.callout_info}} You need the enterprise license if you want to use the GSSAPI feature. However, if you only want to test that the GSSAPI setup is working, you do not need to enable an enterprise license. {{site.data.alerts.end}}

7. Enable GSSAPI authentication:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET cluster setting server.host_based_authentication.configuration = 'host all all all gss include_realm=0';
    ~~~

      Setting the `server.host_based_authentication.configuration` [cluster setting](cluster-settings.html) makes it mandatory for all users (except `root`) to authenticate using GSSAPI. The `root` user is still required to authenticate using its client certificate.

      The `include_realm=0` option is required to tell CockroachDB to remove the `@DOMAIN.COM` realm information from the username. We do not support any advanced mapping of GSSAPI usernames to CockroachDB usernames right now. If you want to limit which realms' users can connect, you can also add one or more `krb_realm` parameters to the end of the line as an allowlist, as follows: `host all all all gss include_realm=0 krb_realm=domain.com krb_realm=corp.domain.com`

8. Create CockroachDB users for every Kerberos user. Ensure the username does not have the `DOMAIN.COM` realm information. For example, if one of your Kerberos user has a username `carl@realm.com`, then you need to create a CockroachDB user with the username `carl`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER carl;
    ~~~

    Grant privileges to the user:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE defaultdb TO carl;
    ~~~

## Configuring the client

{{site.data.alerts.callout_info}}
The `cockroach sql` shell does not yet support GSSAPI authentication. You need to use a GSSAPI-compatible Postgres client, such as Postgres's `psql` client.
{{site.data.alerts.end}}

1. Install and configure your Kerberos client.
2. Install the Postgres client (for example, postgresql-client-10 Debian package from postgresql.org).
3. Get a Kerberos TGT for the Kerberos user from the KDC using `kinit`.
4. Use the `psql` client, which supports GSSAPI authentication, to connect to CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    > psql "postgresql://localhost:26257/defaultdb?sslmode=require" -U carl
    ~~~

5. If you specified an enterprise license earlier, you should now have a Postgres shell in CockroachDB, indicating that the GSSAPI authentication was successful. If you did not specify an enterprise license, you'll see a message like this: `psql: ERROR:  use of GSS authentication requires an enterprise license.` If you see this message, GSSAPI authentication is set up correctly.

## See also

- [Authentication](authentication.html)
- [Create Security Certificates](create-security-certificates.html)
