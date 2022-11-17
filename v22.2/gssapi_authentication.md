---
title: GSSAPI Authentication (Enterprise)
summary: Learn about the GSSAPI authentication features for secure CockroachDB clusters.
toc: true
docs_area: manage
keywords: authentication, ldap, kerberos, gssapi
---

CockroachDB supports the Generic Security Services API (GSSAPI) with Kerberos authentication. Although CockroachDB does not support communicating directly with an LDAP service, GSSAPI with Kerberos can be configured to communicate with your LDAP service to authenticate users.

{% include enterprise-feature.md %}

## Requirements

- A working Active Directory or Kerberos environment
- A Service Principal
- A GSSAPI-compatible PostgreSQL Client (psql, etc.)
- A client machine with a Kerberos client installed and configured

## Configure KDC for CockroachDB

To use Kerberos authentication with CockroachDB, configure a Kerberos service principal name (SPN) for CockroachDB and generate a valid keytab file with the following specifications:

- Set the SPN to the name specified by your client driver. For example, if you use the psql client, set SPN to `postgres`.
- Create SPNs for all DNS addresses that a user would use to connect to your CockroachDB cluster (including any TCP load balancers between the user and the CockroachDB node) and ensure that the keytab contains the keys for every SPN you create.

### Active Directory

For Active Directory, the client syntax for generating a keytab that maps a service principal to the SPN is as follows:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ktpass -out {keytab_filename} -princ {Client_SPN}/{NODE/LB_FQDN}@{DOMAIN} -mapUser {Service_Principal}@{DOMAIN} -mapOp set -pType KRB5_NT_PRINCIPAL +rndPass -crypto AES256-SHA1
~~~

Example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ktpass -out postgres.keytab -princ postgres/loadbalancer1.cockroach.industries@COCKROACH.INDUSTRIES -mapUser pguser@COCKROACH.INDUSTRIES -mapOp set -pType KRB5_NT_PRINCIPAL +rndPass -crypto AES256-SHA1
~~~

Copy the resulting keytab to the database nodes. If clients are connecting to multiple addresses (more than one load balancer, or clients connecting directly to nodes), you will need to generate a keytab for each client endpoint.  You may want to merge your keytabs together for easier management.  You can do this using the `ktpass` command, using the following syntax:

{% include_cached copy-clipboard.html %}
~~~ shell
$ ktpass -out {new_keytab_filename} -in {old_keytab_filename} -princ {Client_SPN}/{NODE/LB_FQDN}@{DOMAIN} -mapUser {Service_Principal}@{DOMAIN} -mapOp add -pType KRB5_NT_PRINCIPAL +rndPass -crypto AES256-SHA1
~~~

Example (adds `loadbalancer2` to the above example):

{% include_cached copy-clipboard.html %}
~~~ shell
$ ktpass -out postgres_2lb.keytab -in postgres.keytab -princ postgres/loadbalancer2.cockroach.industries@COCKROACH.INDUSTRIES -mapUser pguser@COCKROACH.INDUSTRIES -mapOp add  -pType KRB5_NT_PRINCIPAL +rndPass -crypto AES256-SHA1
~~~

### MIT KDC

In MIT KDC, you cannot map a service principal to an SPN with a different username, so you will need to create a service principal that includes the SPN for your client.

{% include_cached copy-clipboard.html %}
~~~ shell
$ create-user: kadmin.local -q "addprinc {SPN}/{CLIENT_FQDN}@{DOMAIN}" -pw "{initial_password}"
~~~

{% include_cached copy-clipboard.html %}
~~~ shell
$ create-keytab: kadmin.local -q "ktadd -k keytab {SPN}/{CLIENT_FQDN}@{DOMAIN}"
~~~

Example:

{% include_cached copy-clipboard.html %}
~~~ shell
$ kadmin.local -q "addprinc postgres/client2.cockroach.industries@COCKROACH.INDUSTRIES" -pw "testing12345!"
$ kadmin.local -q "ktadd -k keytab postgres/client2.cockroach.industries@COCKROACH.INDUSTRIES"
~~~

Copy the resulting keytab to the database nodes. If clients are connecting to multiple addresses (more than one load balancer, or clients connecting directly to nodes), you will need to generate a keytab for each client endpoint.  You may want to merge your keytabs together for easier management.  The `ktutil` command can be used to read multiple keytab files and output them into a single output [here](https://web.mit.edu/kerberos/krb5-devel/doc/admin/admin_commands/ktutil.html).


## Configure the CockroachDB node
1. Copy the keytab file to a location accessible by the `cockroach` binary.

1. [Create certificates](cockroach-cert.html) for inter-node and `root` user authentication:

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

1. Provide the path to the keytab in the `KRB5_KTNAME` environment variable.

    Example: `export KRB5_KTNAME=/home/cockroach/postgres.keytab`

1. Start a CockroachDB node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --listen-addr=0.0.0.0
    ~~~

1. Connect to CockroachDB as `root` using the `root` client certificate generated above:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs
    ~~~

1. [Enable an Enterprise license](licensing-faqs.html#obtain-a-license).
    {{site.data.alerts.callout_info}} You need the Enterprise license if you want to use the GSSAPI feature. However, if you only want to test that the GSSAPI setup is working, you do not need to enable an Enterprise license. {{site.data.alerts.end}}

1. Enable GSSAPI authentication:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > SET cluster setting server.host_based_authentication.configuration = 'host all all all gss include_realm=0';
    ~~~

      Setting the `server.host_based_authentication.configuration` [cluster setting](cluster-settings.html) to this particular value makes it mandatory for all non-`root` users to authenticate using GSSAPI. The `root` user is always an exception and remains able to authenticate using a valid client cert or a user password.

      The `include_realm=0` option is required to tell CockroachDB to remove the `@DOMAIN.COM` realm information from the username. We do not support any advanced mapping of GSSAPI usernames to CockroachDB usernames right now. If you want to limit which realms' users can connect, you can also add one or more `krb_realm` parameters to the end of the line as an allowlist, as follows: `host all all all gss include_realm=0 krb_realm=domain.com krb_realm=corp.domain.com`

      The syntax is based on the `pg_hba.conf` standard for PostgreSQL which is documented [here](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html). It can be used to exclude other users from Kerberos authentication.

1. Create CockroachDB users for every Kerberos user. Ensure the username does not have the `DOMAIN.COM` realm information. For example, if one of your Kerberos users has a username `carl@realm.com`, then you need to create a CockroachDB user with the username `carl`:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE USER carl;
    ~~~

    Grant privileges to the user:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > GRANT ALL ON DATABASE defaultdb TO carl;
    ~~~

## Configure the client

{{site.data.alerts.callout_info}}
The `cockroach sql` shell does not yet support GSSAPI authentication. You need to use a GSSAPI-compatible PostgreSQL client, such as PostgreSQL's `psql` client.
{{site.data.alerts.end}}

1. Install and configure your Kerberos client:

    For CentOS/RHEL systems, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ yum install krb5-user
    ~~~

    For Ubuntu/Debian systems, run:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ apt-get install krb5-user
    ~~~

    Edit the `/etc/krb5.conf` file to include:

    {% include_cached copy-clipboard.html %}
    ~~~
           [libdefaults]
    		 default_realm = {REALM}

    	   [realms]
    		 {REALM} = {
    		  kdc = {fqdn-kdc-server or ad-server}
    		  admin_server = {fqdn-kdc-server or ad-server}
    		  default_domain = {realm-lower-case}
    		}
    ~~~

    Example:

    {% include_cached copy-clipboard.html %}
    ~~~

           [libdefaults]
    		 default_realm = COCKROACH.INDUSTRIES

    	   [realms]
    		 COCKROACH.INDUSTRIES = {
    		  kdc = ad.cockroach.industries
    		  admin_server = ad.cockroach.industries
    		  default_domain = cockroach.industries
    		}
    ~~~

1. Get a ticket for the db user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kinit carl
    ~~~

1. Verify if a valid ticket has been generated:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ klist
    ~~~

1. Install the PostgreSQL client (for example, postgresql-client-10 Debian package from postgresql.org).
1. Use the `psql` client, which supports GSSAPI authentication, to connect to CockroachDB:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ psql "postgresql://localhost:26257/defaultdb?sslmode=verify-full&sslrootcert=/certs/ca.crt" -U carl
    ~~~

1. If you specified an Enterprise license earlier, you should now have a PostgreSQL shell in CockroachDB, indicating that the GSSAPI authentication was successful. If you did not specify an Enterprise license, you'll see a message like this: `psql: ERROR:  use of GSS authentication requires an Enterprise license.` If you see this message, GSSAPI authentication is set up correctly.

## See also

- [Authentication](authentication.html)
- [Create Security Certificates](cockroach-cert.html)
