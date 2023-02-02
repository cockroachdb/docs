---
title: SASL/SCRAM-SHA-256 Secure Password-based Authentication
summary: A discussion of the security and performance considerations for using SASL/SCRAM-SHA-256 in CockroachDB.
toc: true
docs_area: reference.security
---

This page provides an overview of the security and implementation considerations for using SCRAM-SHA-256 [authentication](authentication.html) in CockroachDB.

CockroachDB supports SCRAM-SHA-256 authentication for clients in both {{ site.data.products.db }} and {{ site.data.products.core }}.

CockroachDB's support for SCRAM-SHA-256 is PostgreSQL-compatible. PostgreSQL client drivers that support SCRAM-SHA-256 remain compatible with CockroachDB when SCRAM authentication is enabled.

**Contents:**

- [Conceptual Overview of SASL and SCRAM](#sasl-scram-and-scram-sha-256)
- [Guidance for implementing SCRAM-SHA-256 authentication in CockroachDB](#implement-scram-authentication-in-your-cockroachdb-cluster)
- [Guidance for implementing strict isolation of cleartext credentials (separation of concerns)](#implement-strict-isolation-of-cleartext-credentials )

## SASL, SCRAM and SCRAM-SHA-256

The Simple Authentication and Security Layer [(SASL)](https://www.rfc-editor.org/info/rfc4422) is a framework for authentication and data security in Internet protocols. SASL formalizes the requirements for challenge-and-response authentication protocols designed by the [Internet Engineering Task Force (IETF)](https://www.ietf.org/). It is designed chiefly on the principle of *separation of concerns*: authentication mechanisms must be independent from applications and interact via a structured interface.

[Salted Challenge Response Authentication Mechanism (SCRAM)](https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism) is a modern, SASL-compliant, general solution to the security problems posed by the use of plain-text (unencrypted) passwords for authentication.

[SCRAM-SHA-256](https://datatracker.ietf.org/doc/html/rfc7677) is a cryptographically strong implementation of SCRAM. It includes a configurable parameter, *iteration count*, which is the number of times the hashing function is performed; this allows operators to tune the cryptographic strength of the hashing to their needs by increasing the iteration count.

CockroachDB clusters can achieve a SASL-compliant security architecture using the SCRAM-SHA-256 implementation of SCRAM, a challenge–response password-based authentication mechanism. Together with transport layer security (TLS) and as part of properly managed trust architecture, SCRAM-SHA-256 authentication is a powerful security tool in any context where password-based authentication is required, and this is true for authenticating SQL clients to your CockroachDB cluster as well.

{{site.data.alerts.callout_danger}}
As of January 2023, [Looker](https://cloud.google.com/looker) and [Google Data Studio](https://datastudio.google.com) do not yet support SCRAM authentication. For more information, see https://issuetracker.google.com/issues/203573707

If you use Looker or Google Data Studio with CockroachDB v22.2 or later, you will need to fall back to hashing user passwords with bcrypt following the steps in [Downgrade from SCRAM authentication](../error-handling-and-troubleshooting.html#downgrade-from-scram-authentication).
{{site.data.alerts.end}}

### Advantages and tradeoffs

#### Offload computation cost for password hashing encryption to client

During password-based authentication, a hash of the password must be computed. This computationally expensive operation is necessary to prevent brute-force attacks on the user's credentials by malicious actors.

In SCRAM authentication, the client does the encryption work in order to produce the proof of identity. In other methods the hash is computed server-side after the password is transmitted across the network. SCRAM authentication therefore offloads the computation cost to its clients, which in most cases are application servers.

Adopting SCRAM, in contrast to cleartext password authentication, therefore offers additional protection against distributed denial-of-service (DDoS) attacks against CockroachDB, by preventing a CPU overload of the server to compute password hashes.

{{site.data.alerts.callout_info}}
SCRAM authentication imposes additional computational load on your application servers, which need to compute the client proof for each authentication. Additional changes may be required to your application, such as limiting the number of connections in your application's connection pool or limiting the number of concurrent transactions that your client allows. Cockroach Labs recommends that you:

{% include_cached {{page.version.version}}/scram-authentication-recommendations.md %}

For more details, refer to [Troubleshoot SQL client application problems](../error-handling-and-troubleshooting.html#troubleshoot-sql-client-application-problems)
{{site.data.alerts.end}}

#### Defense from replay attacks

Without SCRAM, cleartext passwords can be TLS-encrypted when sent to the server, which offers some protection. However, if clients skip validation of the server's certificate (i.e., fail to use `sslmode=verify-full`), attackers may be able to intercept authentication messages (containing the password), and later reuse them to impersonate the user.

SCRAM offers strong protection against such [replay attacks](https://en.wikipedia.org/wiki/Replay_attack), wherein an attacker records and re-uses authentication messages.

#### Separation of concerns

A server that authenticates users with SCRAM does not need to store or handle cleartext passwords. Therefore, a system that employs SASL-compliant SCRAM authentication can consolidate responsibility for handling cleartext credentials to a dedicated secrets-management service. This helps to minimize exposure of the credentials to possible egress both at rest and in flight. In keeping with the principle of "separation of concerns", wherein each high-level functionality or "concern" should be handled by a dedicated component, enterprise IT infrastructures often enforce such a consolidation.

Isolation of credential-handling offers many advantages to a delegated service (whether self-hosted or used as a cloud-based external service).
Most importantly, it removes the possibility of any credential spill from your CockroachDB cluster's authentication database (i.e., the cluster's `system.users` table), since it no longer contains credentials.

This not only reduces the impact of any compromises to the database, but also makes it a far less attractive target.

Full separation of concerns requires more than just enabling SCRAM-SHA-256 authentication. The additional requirements are detailed [here](#implement-strict-isolation-of-cleartext-credentials).

## Implement SCRAM authentication in your CockroachDB Cluster

This section details how to use SCRAM authentication rather than cleartext password authentication.

**Requirements for implementing SCRAM-SHA-256**:

1. [Enable SCRAM-SHA-256 password encryption](#enable-scram-sha-256-authentication-for-new-users-roles)
1. [Migrate pre-existing users](#migrate-existing-users-roles-from-cleartext-passwords-to-scram-sha-256-authentication)

### Enable SCRAM-SHA-256 authentication for new users/roles

In CockroachDB v22.2.x and above, passwords are encrypted using SCRAM-SHA-256 by default, and the `server.user_login.password_encryption` [cluster setting](/docs/{{ page.version.version }}/cluster-settings.html) defaults to `scram-sha-256`. In CockroachDB v22.1.x and below, the setting defaults to `bcrypt`. When this setting is set to `scram-sha-256`, passwords created with the following SQL statements will be managed and authenticated according to SCRAM-SHA-256.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.user_login.password_encryption = 'scram-sha-256';
~~~

{{site.data.alerts.callout_info}}
In CockroachDB v22.2x and above, `user_login.password_encryption` defaults to `scram-sha-256`. In CockroachDB v22.1.x and below, the default is `bcrypt`. Automatic eventual migration of existing users and roles from cleartext passwords to SCRAM-SHA-256 authentication is also enabled by default in CockroachDB v22.x and above. Refer to [Migrate existing users/roles from cleartext passwords to SCRAM SHA-256 authentication](#migrate-existing-users-roles-from-cleartext-passwords-to-scram-sha-256-authentication).
{{site.data.alerts.end}}

Once a SQL user has a SCRAM password hash defined, CockroachDB will automatically select the SCRAM protocol to authenticate that user.

For example:

{% include_cached copy-clipboard.html %}
~~~sql
CREATE USER hypothetical_user WITH PASSWORD 'hypothetical-plain-text-password-123';
SELECT username, "hashedPassword" FROM system.users WHERE username='hypothetical_user';
~~~
~~~
  username            |                     hashedPassword
----------------------+---------------------------------------------------------
  hypothetical_user   | SCRAM-SHA-256$119680:e0tDGk...
(1 row)
~~~

{{site.data.alerts.callout_info}}
The procedure documented here, creating a SCRAM-SHA-256-authenticated user by passing a *cleartext* password to the CockroachDB client, achieves the benefit of not requiring the cleartext password to be transmitted over the network; this offers good protection from replay attacks in case attackers bypass TLS. But it does not achieve full separation of concerns by isolating the cleartext password to a delegated service. The necessary additional steps to achieve this are documented in [Implement strict isolation of cleartext credentials](#implement-strict-isolation-of-cleartext-credentials).
{{site.data.alerts.end}}

### Migrate existing users/roles from cleartext passwords to SCRAM-SHA-256 authentication

#### Eventual migration

It is possible to automatically convert the records for previously created users from cleartext passwords to SCRAM-compatible hash encodings. This will cause CockroachDB to use SCRAM authentication when client apps connect to CockroachDB, provided that the cluster's authentication configuration has also been set to accept SCRAM-SHA-256.

To convert existing users to SCRAM-SHA-256, enable the `server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` cluster setting. When this setting is enabled, the conversion occurs the first time a client app connects with the previously defined password. During that first connection, the previous mechanism will be used to establish the connection, and then CockroachDB will re-encode the password using the SCRAM algorithm. Subsequent connections will then use the SCRAM handshake for authentication.

{{site.data.alerts.callout_info}}
In CockroachDB v22.2.x and above, the `server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` [cluster setting](/docs/{{ page.version.version }}/cluster-settings.html) is enabled by default. Because `user_login.password_encryption` also defaults to `scram-sha-256`, this means that by default, any user who still uses cleartext passwords will be migrated to SCRAM-SHA-256 authentication. To prevent this automatic migration, set `server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` to `false` before upgrading to CockroachDB v22.2.x.
{{site.data.alerts.end}}

To enable the cluster setting:

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled = true;
~~~

#### Immediate migration

It is not possible to automatically convert credentials to SCRAM in bulk, without client participation. To implement SCRAM for all SQL user accounts, take the following steps:

1. Turn on the `server.user_login.cert_password_method.auto_scram_promotion.enabled` [cluster setting](../cluster-settings.html#setting-server-user-login-cert-password-method-auto-scram-promotion-enabled):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SET CLUSTER SETTING server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled = true;
    ~~~

1. For each [SQL user](../create-user.html) in the system, run [`ALTER USER {user} .. WITH PASSWORD`](../alter-user.html#change-a-users-password) as shown below. This will cause each user's password to be encoded using SCRAM:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER USER {user} WITH PASSWORD {password};
    ~~~

{{site.data.alerts.callout_info}}
Enabling SCRAM authentication can cause [high CPU load or connection pool exhaustion](../error-handling-and-troubleshooting.html#scram-client-troubleshooting) for some applications. If you have this issue, you can [follow the mitigation steps required to keep SCRAM enabled](../error-handling-and-troubleshooting.html#mitigation-steps-while-keeping-scram-enabled), or [downgrade from SCRAM authentication](../error-handling-and-troubleshooting.html#downgrade-from-scram-authentication).
{{site.data.alerts.end}}

## Implement strict isolation of cleartext credentials

Cleartext credentials are a valuable asset to malicious agents; known as ["credential stuffing,"](https://en.wikipedia.org/wiki/Credential_stuffing) re-use of stolen passwords is a persistent problem throughout the ecosystem of internet services. Hence, any system that handles cleartext credentials becomes a favorable target for malicious attackers with potentially weak points in the system.

While the measures [described previously](#implement-scram-authentication-in-your-cockroachdb-cluster) allow CockroachDB to avoid transmitting cleartext passwords across the network, the  credentials still have a footprint within CockroachDB: they are transmitted in cleartext from the CockroachDB client to the server, and are hence vulnerable in transit. While the secrets are protected in transit by TLS, CA certificate server authentication is not infallible.

Moreover, the cleartext credentials must be handled in memory by CockroachDB in order to generate the hashes on the server, and this offers a potential opportunity for hypothetical attackers who have compromised your node's runtime environment. It is architecturally stronger to perform all handling of cleartext credentials for your system with a dedicated, hardened, specialized environment and process. This entails removing all handling of cleartext credentials from CockroachDB.

It is possible to operate a CockroachDB cluster in such a way that it never handles cleartext passwords. This prevents the malicious use of stolen credentials, even in case the CockroachDB node is compromised.

**Requirements for strict isolation**:

- Handle cleartext credentials securely
- Configure your cluster settings
- Manage users with pre-hashed passwords

### Migrate existing users/roles from cleartext passwords to SCRAM-SHA-256 authentication

If a cluster had previously allowed cleartext password authentication (i.e., any cluster that began on a version prior to v22.1), you must carefully migrate to SCRAM-SHA-256 authentication in the following phases:

1. Instead of creating and rotating user passwords by passing cleartext passwords into SQL statements, as described [previously](#enable-scram-sha-256-authentication-for-new-users-roles), you must instead generate CockroachDB/PostgreSQL-formatted SCRAM-SHA-256 hashes and enter those directly into the client, as described in the [following section](#manage-users-with-pre-hashed-passwords).
1. You must block clients from sending cleartext passwords to CockroachDB during authentication by [customizing your cluster's authentication configuration](#configure-your-cluster-settings-for-strict-credential-isolation) so that only the `scram-sha-256` and `cert-scram-sha-256` methods, and neither `password` nor `cert-password`, are allowed.
1. After steps 1 and 2 are complete, you must update any previously-created passwords with externally-generated SCRAM-SHA-256 hashes, and you must continue to generate your own hashes for all user creation and password update operations.

{{site.data.alerts.callout_info}}
In CockroachDB v22.2.x and above, the `server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` cluster setting is enabled by default. Because `user_login.password_encryption` also defaults to `scram-sha-256`, this means that by default, any user who still uses cleartext passwords will be migrated to SCRAM-SHA-256 authentication. Refer to [Eventual migration](#eventual-migration).
{{site.data.alerts.end}}

Note the importance of rotating passwords twice, in both steps 1 and 3, with different passwords. Step 1 ensures that clients at step 2 can continue to connect after non-SCRAM logins are blocked. However, between step 1 and step 2 it is still possible for CockroachDB to receive cleartext passwords from clients, and so the passwords used at step 1 are not fully protected yet. After step 2, CockroachDB will no longer learn cleartext passwords from clients, and after step 3 it will not know cleartext passwords at all.

### Configure your cluster settings for strict credential isolation

To enable strict credential isolation from CockroachDB, additional cluster settings are required beyond simply enabling SCRAM authentication, as detailed in [Enabling SCRAM-SHA-256 authentication for new users/roles
](#enable-scram-sha-256-authentication-for-new-users-roles).

Required cluster settings:


#### `server.user_login.password_encryption`

Enable SCRAM for new passwords. In CockroachDB v22.2.x and above, this cluster setting defaults to `scram-sha-256`. In CockroachDB v22.1.x and below, it defaults to `bcrypt`.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.user_login.password_encryption = 'scram-sha-256';
~~~

#### `server.user_login.store_client_pre_hashed_passwords.enabled`

Enable the CockroachDB cluster to accept pre-computed SCRAM-SHA-256 salted password hashes, rather than accepting a cleartext password and computing the hash itself. In CockroachDB v22.2.x and above, this cluster setting is enabled by default.

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING setting server.user_login.store_client_pre_hashed_passwords.enabled = true;
~~~

#### `server.host_based_authentication.configuration`

Allow *only* `scram-sha-256` (not the weaker `password`) in your [Authentication Configuration (HBA)](authentication.html#authentication-configuration).

{{site.data.alerts.callout_danger}}
After this change, users will not be able to sign in with cleartext passwords. All critical SQL users must be migrated to SCRAM-SHA-256 authentication before making this change:
1. All client drivers must be updated to a version that supports SCRAM handshakes.
1. All stored credentials for client apps must be updated to use SCRAM encoded passwords. This procedure is detailed in [Migrating existing users/roles to SCRAM-SHA-256 authentication](#migrate-existing-users-roles-from-cleartext-passwords-to-scram-sha-256-authentication).
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
~~~sql
SET CLUSTER SETTING server.host_based_authentication.configuration TO '
# TYPE    DATABASE  USER          ADDRESS     METHOD
# any other higher-priority rules ...
  host    all       human         all         scram-sha-256
  host    all       app_user      all         cert
  host    all       cyborg        all         cert-scram-sha-256
# any other lower-priority rules ...
~~~

### Handle cleartext credentials securely

Using SCRAM authentication, a CockroachDB cluster need not store or handle the cleartext passwords used by clients to authenticate. However, to achieve full separation of concerns, the cleartext credentials must be isolated so that they are exposed as little as possible in transit, storage, and during computation.

Generally, this can be best achieved by handling cleartext credentials only in a dedicated credential management environment, such as a secure compute instance or secure physical workstation.

That environment must be provisioned with:

- A tool for [creating PostgreSQL/CockroachDB-formatted SCRAM-SHA-256 hashes](#manage-users-with-pre-hashed-passwords), such as the example script provided in the [appendix](#appendix-python-scram-hashing-script).
- A CockroachDB client with ['USER CREATE/ALTER privileges'](../create-user.html#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users).
- Access, with write privileges, to a secrets store where the cleartext passwords will be persisted.

On that instance, [generate SCRAM salted password hashes](#manage-users-with-pre-hashed-passwords), manage the users via CockroachDB client, as described in the following section, and persist the secrets in the secrets store.

## Manage users with pre-hashed passwords

[Many database tools](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.scram.html) support SCRAM-SHA-256 and can be used to calculate the hashes servers will need for authentication.

In this example, we'll use this [open-source](https://stackoverflow.com/questions/68400120/how-to-generate-scram-sha-256-to-create-postgres-13-user) [Python script](#appendix-python-scram-hashing-script).

### Start a python shell

For example, with docker.

{% include_cached copy-clipboard.html %}
~~~shell
docker run -it python:latest python
~~~

### Compute salted password hashes

In the Python shell, use another tool or the [script in the Appendix](#appendix-python-scram-hashing-script) to create a SCRAM-SCHA-256 salted password hash in the format accepted by CockroachDB (which follows PostgreSQL's format).

{% include_cached copy-clipboard.html %}
~~~python
# Either copy-paste the hashing script directly into the shell, or into a file named roach_scram_hasher.py and import by un-commenting the following line
# from roach_scram_hasher import *

pg_scram_sha256("password")
~~~
~~~txt
'SCRAM-SHA-256$119680:D1nWfUQfRP2HWbVuK19Ntw==$ulRLI4fp/bvJN/oBC3x6Q8daLnPit2eWLvm2sex9vyc=:XHVeRmT8iboSn0KMbIx3nMRrebR2gIbi+qEMnHfJi+I='
~~~

### Create a SCRAM-SHA-256-authenticated SQL user

In the CockroachDB SQL shell, use the computed hash as the value of `PASSWORD` when [creating a user](../create-user.html) or [rotating the password for an existing user](../alter-user.html).

{% include_cached copy-clipboard.html %}
~~~sql
CREATE USER cool_user WITH PASSWORD 'SCRAM-SHA-256$119680:D1nWfUQfRP2HWbVuK19Ntw==$ulRLI4fp/bvJN/oBC3x6Q8daLnPit2eWLvm2sex9vyc=:XHVeRmT8iboSn0KMbIx3nMRrebR2gIbi+qEMnHfJi+I=';
~~~
~~~
CREATE ROLE

Time: 156ms total (execution 156ms / network 0ms)
~~~

### Inspect the user

In this way, the server stores the information needed for SCRAM authentication, despite the cleartext password never having been conveyed to CockroachDB. The 'concern' with cleartext passwords has been cleanly 'separated' from CockroachDB.

{% include_cached copy-clipboard.html %}
~~~sql
SELECT username, "hashedPassword" FROM system.users WHERE username='cool_user';
SELECT *  FROM system.users WHERE username = "cool_user";
~~~
~~~
  username  |                                                             hashedPassword
------------+------------------------------------------------------------------------------------------------------------------------------------------
  cool_user | SCRAM-SHA-256$119680:6XN0y7A83hylmX+3uMRPvQ==$mOI18rsucBjSrNMDDqNJ1/q4cROvRDLIUqjC0BzQHEg=:4zPCVFflWWHD53ZEIrcH4q3X1+le86TBIV0Dce6fIuc=
~~~

## Appendix: Python SCRAM-hashing script

~~~python
# cockroach-scram-hasher.py

from base64 import standard_b64encode
from hashlib import pbkdf2_hmac, sha256
from os import urandom
import hmac
import sys

salt_size = 16
digest_len = 32
iterations = 4096

def b64enc(b: bytes) -> str:
    return standard_b64encode(b).decode('utf8')

def pg_scram_sha256(passwd: str) -> str:
    salt = urandom(salt_size)
    digest_key = pbkdf2_hmac('sha256', passwd.encode('utf8'), salt, iterations,
                             digest_len)
    client_key = hmac.digest(digest_key, 'Client Key'.encode('utf8'), 'sha256')
    stored_key = sha256(client_key).digest()
    server_key = hmac.digest(digest_key, 'Server Key'.encode('utf8'), 'sha256')
    return (
        f'SCRAM-SHA-256${iterations}:{b64enc(salt)}'
        f'${b64enc(stored_key)}:{b64enc(server_key)}'
    )

def print_usage():
    print("Usage: provide single password argument to encrypt")
    sys.exit(1)

def main():
    args = sys.argv[1:]

    if args and len(args) > 1:
        print_usage()

    if args:
        passwd = args[0]
    else:
        passwd = sys.stdin.read().strip()

    if not passwd:
        print_usage()

    print(pg_scram_sha256(passwd))

if __name__ == "__main__":
    main()
~~~

## References

- [SCRAM-SHA-256 and SCRAM-SHA-256-PLUS Simple Authentication and Security Layer (SASL) Mechanisms](https://datatracker.ietf.org/doc/html/rfc7677)
- [Salted Challenge Response Authentication Mechanism (SCRAM) SASL and GSS-API Mechanisms](https://datatracker.ietf.org/doc/html/rfc5802)
