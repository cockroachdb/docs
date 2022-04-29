---
title: SASL Authentication with SCRAM-SHA-256
summary: A discussion of the security and performance considerations for using SASL/SCRAM-SHA-256 in CockroachDB.
toc: true
docs_area: reference.security
---

This page provides an overview of the security and implementation considerations for using SCRAM-SHA-256 authentication in CockroachDB.

As of v22.1, CockroachDB supports SCRAM-SHA-256 authentication for clients, across all releases and offerings for both {{ site.data.products.db }} and {{ site.data.products.core }}.

CockroachDB's support for SCRAM-SHA-256 is PostgreSQL-compatible. PostgreSQL client drivers that support SCRAM-SHA-256 remain compatible with CockroachDB when SCRAM authentication is enabled.

**Contents:**

- [Conceptual Overview of SASL and SCRAM](#sasl-scram-and-scram-sha-256)
- [Guidance for implementing SCRAM-SHA-256 authentication in CockroachDB](#implementing-scram-authentication-in-your-cockroachdb-cluster)
- [Guidance for implementing strict isolation of plaintext credentials (separation of concerns)](#implementing-strict-isolation-of-plaintext-credentials )

## SASL, SCRAM and SCRAM-SHA-256

The Simple Authentication and Security Layer [(SASL)](https://www.rfc-editor.org/info/rfc4422) is a framework for authentication and data security in Internet protocols. SASL formalizes the requirements for challenge-and-response authentication protocols designed by the [Internet Engineering Task Force (IETF)](https://www.ietf.org/), chiefly on the principle of **Separation of Concerns**: authentication mechanisms must be independent from applications and interact via a structured interface.

[Salted Challenge Response Authentication Mechanism (SCRAM)](https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism) is a modern, SASL-compliant, general solution to the security problems posed by the use of plain-text (unencrypted) passwords for authentication.

[SCRAM-SHA-256](https://datatracker.ietf.org/doc/html/rfc7677) is a cryptographically strong implementation of SCRAM. It includes a configurable parameter, **iteration count**, which is the number of times the hashing function is performed; this allows operators to tune the cryptographic strength of the hashing to their needs by increasing the iteration count.

CockroachDB clusters can achieve a SASL-compliant security architecture using the SCRAM-SHA-256 implementation of SCRAM, a challenge–response password-based authentication mechanism. Together with transport layer security (TLS) and as part of properly managed trust architecture, SCRAM-SHA-256 authentication is a powerful security tool in any context where password-based authentication is required, and this is true for authenticating SQL clients to your CockroachDB cluster as well.

### The core idea of SCRAM: the problem with passwords

The crux of the problem with plaintext passwords is that they are potentially vulnerable to theft when they are transmitted over a network or stored in a database, and if stolen, they can be used to impersonate the owner to devastating effect. This vulnerability lies in the fact that the password itself is used as proof of the identity of the client: it seems the server as well as the client must store the password, and the client must transmit the password over the network to the server, so the latter can compare the stored password with that presented by the would-be-client.

SCRAM offers an alternative with the idea of a challenge-and-response proof and the cryptographic technique of hashing (which simply means transforming data in a way which can be repeated but not reversed).

In SCRAM, when a user/client establishes an identity with a application/server, the user decides on a password as normal, but rather than asking for the password as plain-text, the server provides a salt (a randomly generated number) and a hashing function, and the client produces a hash from their password + the salt, and sends this back to the server, where it is stored, together with the salt that was used to produce it.

To authenticate, the client and server perform a challenge-and-response exchange, which begins when the client provide's their username and requests authentication. The server provides the user's salt and a **nonce**, which is a randomly generated number that the server guarantees to be unique.

The client calculates a cryptographic **proof**, which:

- can only be generated using the original plain-text password
- cannot be re-used in response to a challenge with a different **nonce**

Even if an attacker gains access to authentication database, this does not allow them to impersonate the user, because the (salt, salted-password-hash) combination stored by the server does not allow them to create the proof (which requires the plain-text password).

Even if an attacker can intercept an authentication exchange in its entirety, this does not allow them to impersonate the user (as longs as the server does not re-use nonces), because a user's response to the challenge is specific to that exchange (as it contains the nonce).

### Advantages and tradeoffs

#### Defense from replay attacks

Without SCRAM, plaintext passwords can be TLS-encrypted when sent to the server, which offers some protection. However, if clients skip validation of the server's certificate (i.e., fail to use `sslmode=verify-full`), attackers may be able to intercept authentication messages (containing the password), and later reuse them to impersonate the user.

SCRAM offers strong protection against such so-called [replay attacks](https://en.wikipedia.org/wiki/Replay_attack), wherein an attacker records and re-uses authentication messages.

#### Separation of concerns

Because a server that authenticates users with SCRAM does not need to store or handle plaintext passwords, a system that employs SASL-compliant SCRAM authentication can consolidate responsibility for handling plaintext credentials to a dedicated secrets-management service and isolate those credentials to the minimum exposure to possible egress both at rest and in flight. In keeping with the principle of "separation of concerns", wherein each high-level functionality or "concern" should be handled by a dedicated component, enterprise IT infrastructures often enforce such a consolidation.

Isolation of credential-handling offers many advantages to a delegated service (whether self-hosted or used as a cloud-based external service), but most salient here is that it completely removes the possibility of a credential spill from your CockroachDB cluster's authentication database (i.e. the cluster's `system.users` table), since the latter now contains no credentials. This not only reduces the impact of any compromise of that database that does it occur, but as a corollary makes it far less attractive as a target, since an attacker gains nothing by stealing what it contains.

Full separation of concerns requires more than just enabling SCRAM-SHA-256 authentication. The additional requirements are detailed [here](#implementing-strict-isolation-of-plaintext-credentials). 

#### Offload computation cost for password hashing encryption to client

During password-based authentication, a hash of the password must be computed. This computationally expensive operation is necessary to prevent brute-force attacks on the user's credentials by malicious actors. 

In SCRAM authentication, the encryption work is done by the client in order to produce the proof of identity, whereas as with plain password authentication, is computed by the server for storage. SCRAM authentication therefore offloads the computation cost to its clients, which in most cases are application servers.

Adopting SCRAM, in contract to plain password authentication, therefore offers additional protection against distributed denial-of-service (DDoS) attacks against CockroachDB, by preventing a CPU overload of the server to compute password hashes. However it does impose an additional computational load on your application servers, which need to compute the client proof for each authentication.

It is therefore recommended when migrating to SCRAM authentication, to migrate your user population, not all at once but in batches, in order to evaluate the impact on performance and resource consumption. You may need to allocate additional CPU and/or RAM.

## Implementing SCRAM authentication in your CockroachDB Cluster

This section details how to use SCRAM authentication rather than than plaintext password authentication.

**Requirements for implementing SCRAM-SHA-256**:

- [Enable SCRAM-SHA-256 password encryption](#enabling-scram-sha-256-authentication-for-new-users-roles)
- [Migrate Pre-existing Users](#migrating-existing-users-roles-to-scram-sha-256-authentication)
- [Set your Authentication Configuration (HBA)](#configuring-the-authentication-cluster-setting-hba)

{{site.data.alerts.callout_info}}
SCRAM authentication can only be used after the upgrade to v22.1 has been finalized.
{{site.data.alerts.end}}

### Enabling SCRAM-SHA-256 authentication for new users/roles

To enable SCRAM-SHA-256 encoding of newly defined passwords, set the `server.user_login.password_encryption` cluster setting to `scram-sha-256`. When this setting is set to `scram-sha-256`, passwords created with the following SQL statements will be managed and authenticated according to SCRAM-SHA-256.

{% include_cached copy-clipboard.html %}
```shell
SET CLUSTER SETTING server.user_login.password_encryption = 'scram-sha-256';
```

Once a SQL user has a SCRAM password hash defined, CockroachDB will automatically select the SCRAM protocol to authenticate that user.

For example:

{% include_cached copy-clipboard.html %}
```shell
CREATE USER hypothetical_user WITH PASSWORD "hypothetical-plain-text-password-123";
SELECT username, "hashedPassword" FROM system.users WHERE username='hypothetical_user'; 
```
```
  username |                     hashedPassword
-----------+---------------------------------------------------------
  hypothetical_user   | SCRAM-SHA-256$119680:e0tDGk...
(1 row)
```

{{site.data.alerts.callout_info}}
The procedure documented here, creating a SCRAM-SHA-256-authenticated user by passing a *plaintext* password to the CockroachDB client, achieves the benefit of not requiring the plaintext password (or a weak, unsalted hash thereof) to be stored in the database, presenting a reward to potential attackers. But it does not achieve full separation of concerns by isolating the plaintext password to a delegated service. The necessary additional steps to achieve this are documented [here](#implementing-strict-isolation-of-plaintext-credentials).
{{site.data.alerts.end}}

### Migrating existing users/roles to SCRAM-SHA-256 authentication

It is possible to automatically convert the records for previously created users from plaintext passwords to SCRAM-compatible hash encodings. This will cause CockroachDB to use SCRAM authentication when client apps connect to CockroachDB, provided that the cluster's authentication configuration has also been set to accept SCRAM-SHA-256.

To convert existing users to SCRAM-SHA-256, enable the `server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` cluster setting. When this setting is enabled, the conversion occurs the first time a client app connects with the previously-defined password. During that first connection, the previous mechanism will be used to establish the connection, and then CockroachDB will re-encode the password using the SCRAM algorithm. Subsequent connections will then use the SCRAM handshake for authentication.

To enable the cluster setting:

{% include_cached copy-clipboard.html %}
```shell
SET CLUSTER SETTING server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled = true;
```

### Configuring the authentication cluster setting (HBA)

You must set your [authentication configuration](authentication.html#authentication-configuration) to use `scram-sha-256`.
{{ site.data.products.core }} users may also allow certificate authentication, but (plaintext) password authentication should not appear as an allowed method.

{{site.data.alerts.callout_danger}}
After this change, users will not be able to sign in with plaintext passwords. All critical SQL users must be migrated to SCRAM-SHA-256 authentication before making this change.
{{site.data.alerts.end}}

{% include_cached copy-clipboard.html %}
```shell
SET CLUSTER SETTING server.host_based_authentication.configuration TO '
# TYPE    DATABASE  USER          ADDRESS     METHOD
# any other higher-priority rules ...
  host    all       human         all         scram-sha-256
  host    all       app_user      all         cert
  host    all       cyborg        all         cert-scram-sha-256
# any other lower-priority rules ...
';
```

## Implementing strict isolation of plaintext credentials 

Plaintext credentials are a valuable asset to malicious agents of all stripes; known as ["credential stuffing,"](https://en.wikipedia.org/wiki/Credential_stuffing) re-use of stolen passwords is a persistent problem throughout the ecosystem of internet services. Hence, any system that handles plaintext credentials becomes both an intrinsically juicy target to enemies and a potential weak point in your armor.

While the simple measures [described previously](#implementing-scram-authentication-in-your-cockroachdb-cluster) allow CockroachDB to avoid storing plaintext passwords or weak hashes in the database, the  credentials still have a footprint within CockroachDB: they are transmitted in plaintext from the CockroachDB client to the server, and are hence vulnerable in transit. While the secrets are protected in transit by TLS, CA certificate server authentication is not infallible.

Moreover, the plaintext credentials must be handled in memory by CockroachDB in order to generate the hashes on the server, and this offers a potential opportunity for hypothetical attackers who have compromised your node's runtime environment. It is architecturally stronger to perform all handling of plaintext credentials for your system with a dedicated, hardened, specialized environment and process. This entails removing all handling of plaintext credentials from CockroachDB.

It is possible to operate a CockroachDB cluster in such a way that it never handles plaintext passwords in any form. This prevents the malicious use of stolen credentials, even in case the CockroachDB node is compromised. 

**Requirements for strict isolation**:

- Secure handling of plaintext credentials
- Configuring your cluster settings
- Managing users with pre-hashed passwords

### Migrating from password to SCRAM

If a cluster had previously allowed plaintext password authentication (i.e., any cluster that began on a version prior to v22.1), you must carefully migrate to SCRAM-SHA-256 authentication in the following phases:

1. Instead of creating and rotating user passwords by passing plaintext passwords into SQL statements, as described [previously](#enabling-scram-sha-256-authentication-for-new-users-roles), you must instead generate CockroachDB/PostgreSQL-formatted SCRAM-SHA-256 hashes and enter those directly into the client, as described in the [following section](#managing-users-with-pre-hashed-passwords).
2. You must block clients from sending plaintext passwords to CockroachDB during authentication by [customizing your cluster's authentication](#configuring-the-authentication-cluster-setting-hba) so that only the `scram-sha-256` and `cert-scram-sha-256` methods, and neither `password` nor `cert-password`, are allowed.
3. After steps (1) and (2) are complete, you must update any previously created passwords with externally generated SCRAM-SHA-256 hashes, and continue to generate your own hashes for all user creation and password update operations.

Note the importance of rotating passwords twice, both in steps (1) and again in (3), with different passwords (as should go without saying, as password re-use is always discouraged).  Step (1) ensures that clients at step (2) can continue to connect after non-SCRAM logins are blocked. However, between step (1) and step (2) it is still possible for CockroachDB to receive plaintext passwords from clients, and so the passwords used at step (1) are not fully protected yet. After step (2), CockroachDB will not learn plaintext passwords from clients any more; then after step 3 it will not know plaintext passwords at all.

### Configuring you cluster settings for strict credential isolation

To enable strict credential isolation from CockroachDB, additional cluster settings are required, above those detailed for simply enabling SCRAM authentication, as detailed [above](#enabling-scram-sha-256-authentication-for-new-users-roles).

Required cluster settings:


#### `password_encryption`

Enable SCRAM for new passwords.

{% include_cached copy-clipboard.html %}
```sql
SET CLUSTER SETTING server.user_login.password_encryption = 'scram-sha-256';
```

#### `store_client_pre_hashed_passwords`

Enable the CockroachDB to accept pre-computed SCRAM-SCHA-256 salted password hashes, rather than accepting a plaintext password and computing the hash itself.

{% include_cached copy-clipboard.html %}
```sql
SET CLUSTER SETTING setting server.user_login.store_client_pre_hashed_passwords.enabled = true;
```

#### `host_based_authentication.configuration`

Allow *only* `scram-sha-256` (not the weaker `password`) in your [Authentication Configuration (HBA)](authentication.html#authentication-configuration).

{% include_cached copy-clipboard.html %}
```sql
SET CLUSTER SETTING server.host_based_authentication.configuration TO '
# TYPE    DATABASE  USER          ADDRESS     METHOD
# any other higher-priority rules ...
  host    all       human         all         scram-sha-256
  host    all       app_user      all         cert
  host    all       cyborg        all         cert-scram-sha-256
# any other lower-priority rules ...
```

### Secure handling of plaintext credentials

Using SCRAM authentication, a CockroachdDB cluster need not store or handle the plaintext passwords used by clients to authenticate. When managing SQL users and roles, only salt and hash(salt, password) need be stored.

However, to achieve full separation of concerns, the plaintext credentials must be isolated to the extent possible: they must be exposed as little as possible in transit, storage and during computation.

Generally, this can be best achieved by handling plaintext credentials only in a dedicated credential management environment, such as a secure compute instance or secure physical workstation.

That environment must be a provisioned with:

- A tool for [creating PostgreSQL/CockroachDB-formated SCRAM-SHA-256 hashes](#managing-users-with-pre-hashed-passwords), such as the example script provided in the [appendix](#appendix-python-scram-hashing-script).
- A CRDB client with ['USER CREATE/ALTER privileges'](../create-user.html#create-a-user-that-can-create-other-users-and-manage-authentication-methods-for-the-new-users)
- Access, with write privileges, to a secrets store where the plaintext passwords will be persisted. Recommended solutions include Hashicorp Vault, GCP secrets manager or AWS secrets manager.

On that instance, [generate SCRAM salted password hashes](#managing-users-with-pre-hashed-passwords), manage the CRDB users via CRDB client and persist the secrets in the secrets store, as described in the following section.

## Managing users with pre-hashed passwords

[Many database tools](https://passlib.readthedocs.io/en/stable/lib/passlib.hash.scram.html) support SCRAM-SHA-256 and can be used to calculate the hashes servers will need for authentication.

In this example, we'll use this [Python script](#appendix-python-scram-hashing-script), which, like many good things, comes from the [open-source community](https://stackoverflow.com/questions/68400120/how-to-generate-scram-sha-256-to-create-postgres-13-user).

### Start a python shell

For example, with docker.

{% include_cached copy-clipboard.html %}
```bash
docker run -it python:latest python
```

### Compute salted password hashes

In the Python shell, use another tool or the [script in the Appendix](#appendix-python-scram-hashing-script) to create a SCRAM-SCHA-256 salted password hash in the format accepted by CockroachDB (which follows PostgreSQL's format).

{% include_cached copy-clipboard.html %}
```python
# Either copy-paste the hashing script directly into the shell, or into a file named roach_scram_hasher.py and import by un-commenting the following line
# from roach_scram_hasher import *

pg_scram_sha256("password")
```
```txt
'SCRAM-SHA-256$119680:D1nWfUQfRP2HWbVuK19Ntw==$ulRLI4fp/bvJN/oBC3x6Q8daLnPit2eWLvm2sex9vyc=:XHVeRmT8iboSn0KMbIx3nMRrebR2gIbi+qEMnHfJi+I='
```

### Create a SCRAM-SHA-256-authenticated SQL user

In the CockroachDB SQL shell, use the computed hash as the value of `PASSWORD` when creating a user or rotating the password for an existing user.

{% include_cached copy-clipboard.html %}
```sql
CREATE USER cool_user WITH PASSWORD 'SCRAM-SHA-256$119680:D1nWfUQfRP2HWbVuK19Ntw==$ulRLI4fp/bvJN/oBC3x6Q8daLnPit2eWLvm2sex9vyc=:XHVeRmT8iboSn0KMbIx3nMRrebR2gIbi+qEMnHfJi+I=';

ALTER USER other_user WITH PASSWORD "$scram$100000$vZcyRiil1BojRGhN$sha-1=pRLECKY8rLwZKkmhKu02b8RfIeQ,sha-256=ClkmygvxmE9tOx8swe2lD5kb/4rjE3qa2BF6mAhshHE,sha-512=l3zLEbJLHqRZGi5uCdwDqkNzk4bfoZTcvyKRXyu6YP3mtoh7JFclxKdAKXKQTBAWMQDv.pbNgUt3/KOX4Hgteg";
```
```
CREATE ROLE

Time: 156ms total (execution 156ms / network 0ms)
```

### Inspect the user

In this way, the server stores the information needed for SCRAM authentication, despite the plaintext password never having been conveyed to CockroachDB. The 'concern' with plaintext passwords has been cleanly 'separated' from CockroachDB.

{% include_cached copy-clipboard.html %}
```sql
SELECT username, "hashedPassword" FROM system.users WHERE username='cool_user'; 
SELECT *  FROM system.users WHERE username = "cool_user";
```
```
  username  |                                                             hashedPassword
------------+------------------------------------------------------------------------------------------------------------------------------------------
  cool_user | SCRAM-SHA-256$119680:6XN0y7A83hylmX+3uMRPvQ==$mOI18rsucBjSrNMDDqNJ1/q4cROvRDLIUqjC0BzQHEg=:4zPCVFflWWHD53ZEIrcH4q3X1+le86TBIV0Dce6fIuc=
```

## Appendix: Python SCRAM-hashing script

```python
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
```

## References

- [SCRAM-SHA-256 and SCRAM-SHA-256-PLUS Simple Authentication and Security Layer (SASL) Mechanisms](https://datatracker.ietf.org/doc/html/rfc7677)
- [Salted Challenge Response Authentication Mechanism (SCRAM) SASL and GSS-API Mechanisms](https://datatracker.ietf.org/doc/html/rfc5802)
