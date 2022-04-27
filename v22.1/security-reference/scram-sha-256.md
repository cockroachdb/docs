---
title: Salted Challenge Response Authentication Mechanism (SCRAM-SHA-256)
summary: An discussion of the security and performance considerations for using SCRAM-SHA-256 in CockroachDB.
toc: true
docs_area: reference.security
---

This page provides an overview of security and performance considerations for using SCRAM-SHA-256 authentication in CockroachDB.

As of v22.1, CockroachDB supports SCRAM-SHA-256 authentication for clients, across all releases and offerings.

## SCRAM and SCRAM-SHA-256

[Salted Challenge Response Authentication Mechanism (SCRAM)](https://en.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism) is a general solution to the security problems posed by the use of plain-text (unencrypted) passwords for authentication: plain-text passwords are potentially vulnerable to theft when they are transmitted over a network or stored in a database, and if stolen, they can be used to impersonate the owner to potentially devastating effect.

SCRAM-SHA-256 is a modern, cryptographically strong implementation of SCRAM. It includes a configurable parameter, **iteration count**, which is the number of times the hashing function is performed; this allows operators to tune the cryptographic strength of the hashing to their needs by increasing the iteration count.

Together with [transport layer security (TLS) and as part of properly managed trust architecture,](transport-layer-security.html) SCRAM-SHA-256 authentication is a powerful security tool in any context where password-based authentication is required, and this is true for authenticating SQL clients to your CockroachDB cluster as well.

### SCRAM: the core idea

The weakness of plain-text password authentication lies in the vulnerability of the password itself when it is being used as proof of the identity of the client: it seems the server as well as the client must store the password, and the client must transmit the password over the network in order to prove to the server that they know the pre-agreed password.

SCRAM offers an alternative with the idea of a challenge-and-response proof and the cryptographic technique of hashing (which simply means transforming data in a way which can be repeated but not reversed).

In SCRAM, when a user/client establishes an identity with a application/server, the user decides on a password as normal, but rather than asking for the password as plain-text, the server provides a salt (a randomly generated number) and a hashing function, and the client produces a hash from their password + the salt, and sends this back to the server, where it is stored, together with the salt that was used to produce it.

To authenticate, the client and server perform a challenge-and-response exchange, which begins when the client provide's their username and requests authentication. The server provides the user's salt and a **nonce**, which is a randomly generated number that the server guarantees to be unique.

The client calculates a cryptographic **proof**, which:
- can only be generated using the original plain-text password
- cannot be re-used in response to a challenge with a different **nonce**

Even if an attacker gains access to authentication database, this does not allow them to impersonate the user, because the (salt, salted-password-hash) combination stored by the server does not allow them to create the proof (which requires the plain-text password).

Even if an attacker can intercept an authentication exchange in its entirety, this does not allow them to impersonate the user (as longs as the server does not re-use nonces), because a user's response to the challenge is specific to that exchange (as it contains the nonce).

### Advantages and tradeoffs

#### Protection from replay attacks

SCRAM offers strong protection against [replay attacks](https://en.wikipedia.org/wiki/Replay_attack), wherein an attacker records and re-uses authentication messages.

<img src="{{ 'images/v22.1/perf_tuning_movr_schema.png' | relative_url }}" alt="Perf tuning schema" style="max-width:100%" />

#### Separation of concerns

Because a server that authenticates users with SCRAM does not need to store or handle plaintext passwords, a system that employs SCRAM authentication can consolidate responsibility for handling plaintext credentials to a dedicated secret service. In keeping with the principle of "seperation of concerns", wherein each high-level functionality or "concern" should be handled by a dedicated component, enterprise IT infrastructures often enforce such a consolidation.

Isolation of credential-handling offers many advantages to a delegated service (whether self-hosted or used as a cloud-based external service), but most salient here is that it completely removes the possibility of a credential spill from your CockroachDB cluster's authentication database (i.e. the cluster's `system.users` table), since the latter now contains no credentials. This not only reduces the impact of any compromise of that database that does it occur, but as a correlary makes it far less attractive as a target, since an attacker gains nothing by stealing what it contains.

#### Offload computation cost for password hashing encryption to client

During password-based authentication, a hash of the password must be computed. This computationally expensive operation is necessary to prevent brute-force attacks on the user's credentials by malicious actors. 

In SCRAM authentication, the encryption work is done by the client in order to produce the proof of identity, whereas as with plain password authentication, is computed by the server for storage. SCRAM authencation therefore offloads the computation cost to its clients, which in most cases are application servers.

Adopting SCRAM, in contract to plain password authentication, therefore offers additional protection against distributed denial-of-service (DDoS) attacks against CockroachDB, by preventing a CPU overload of the server to compute password hashes. However it does impose an additional computational load on your application servers, which need to compute the client proof for each authentication.

It is therefore recommended when migrating to SCRAM authentication, to migrate your user population, not all at once but in batches, in order to evaluate the impact on performance and resource consumption. You may need to allocate additional CPU and/or RAM.

## Implementing SCRAM in your CockroachDB Cluster

{{site.data.alerts.callout_info}}
SCRAM authentication can only be used after the upgrade to v22.1 has been finalized.
{{site.data.alerts.end}}

### Enabling SCRAM-SHA-256 authentication for new users/roles

To enable SCRAM-SHA-256 encoding of newly defined passwords, set the `server.user_login.password_encryption` cluster setting to `scram-sha-256`. When this setting is set to `scram-sha-256`, passwords created with the following SQL statements will be managed and authenticated according to SCRAM-SHA-256.

Once a SQL user has a SCRAM password hash defined, CockroachDB will automatically select the SCRAM protocol to authenticate that user.


For example:

{% include_cached copy-clipboard.html %}
```shell
SET CLUSTER SETTING server.user_login.password_encryption = 'scram-sha-256';
CREATE USER myuser WITH PASSWORD 'abc';
SELECT username, "hashedPassword" FROM system.users WHERE username='myuser'; 
  username |                     hashedPassword
-----------+---------------------------------------------------------
  myuser   | SCRAM-SHA-256$119680:e0tDGk...
(1 row)
```

See also: [using pre-hashed passwords with ALTER/CREATE USER/ROLE WITH PASSWORD](FIXME: missing link here).

### Migrating existing users/roles to SCRAM-SHA-256 authentication

It is possible to automatically convert the records for previously created users from plaintext passwords to SCRAM-compatible hash encodings. This will cause CockroachDB to use SCRAM authentication when client apps connect to CockroachDB, provided that the cluster's authentication configuration has also been set to accept SCRAM-SHA-256.

To convert existing users to SCRAM-SHA-256, enable the`server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled` cluster setting. When this setting is enabled, the conversion occurs the first time a client app connects with the previously-defined password. During that first connection, the previous mechanism will be used to establish the connection, and then CockroachDB will reencode the password using the SCRAM algorithm. Subsequent connections will then use the SCRAM handshake for authentication.

To enable the cluster setting:

{% include_cached copy-clipboard.html %}
```shell
SET CLUSTER SETTING server.user_login.upgrade_bcrypt_stored_passwords_to_scram.enabled = true;
```

## Implementing strict separation of concerns for password authentication

It is possible to operate a CockroachDB cluster in such a way that it never needs to handle plaintext passwords in any form. This an enhanced level of protection which blocks password reuse (also called credential stuffing), in case the CockroachDB server itself is maliciously taken over.





### correct cred handling

Well how are you supposed to even do this? There are code tools for generating the hashes and stuff, but are you supposed to hack together your own secure credential service? Why the hell aren't there scram-sha-256-compliant password managers for Vault and GCP secrets manager and stuff? I'm kinda baffled. The same way that python library works below, there should be like: 

```shell

vault write scram-sha-256/cred/<password>

...
# HASH  | SALT
blahblah | blahblahblah
```


Why isn't there??


"This  can be achieved as follows:

1. Define new password credentials for the SQL users using ALTER USER WITH PASSWORD. Ensure the passwords are encoded using the SCRAM-SHA-256 format, either by defining the cluster setting `server.user_login.password_encryption` accordingly (see above), or by using a using a pre-hashed password already encoded in the SCRAM format (FIXME: add a link to the section that explains pre-hashed passwords).
2. Block clients from sending plaintext passwords to CockroachDB during authentication. This can be achieved by using the authentication methods `scram-sha-256` or `cert-scram-sha-256` in the cluster setting `server.host_based_authentication.configuration`.  (FIXME: add a hyperlink here to `authentication.md` where the authn methods are explained)
3. Re-define new password credentials using ALTER USER WITH PASSWORD and a pre-hashed password in the SCRAM format.

Note: it is important to define new passwords two times (in steps 1 and 3) and use different passwords at each of these steps.  Step 1 ensures that clients at step 2 can continue to connect after non-SCRAM logins are blocked. However, between step 1 and step 2 it is still possible for CockroachDB to receive plaintext passwords from clients, and so the passwords used at step 1 are not fully protected yet. After step 2, CockroachDB will not learn plaintext passwords from clients any more; then after step 3 it will not know plaintext passwords at all.
""

## Managing users with pre-hashed passwords

"link to the section in ALTER/CREATE USER/ROLE WITH PASSWORD that talks about pre-hashed passwords "
(unfortunately this doesn't exist)

I guess you have to calculate the flipping hash yourself with like this or something else? https://passlib.readthedocs.io/en/stable/lib/passlib.hash.scram.html

```bash
docker run -it python:latest /bin/bash
root@0ecc79701283:/# pip install passlib
Collecting passlib
  Downloading passlib-1.7.4-py2.py3-none-any.whl (525 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 525.6/525.6 KB 5.6 MB/s eta 0:00:00
Installing collected packages: passlib
Successfully installed passlib-1.7.4
WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager. It is recommended to use a virtual environment instead: https://pip.pypa.io/warnings/venv
root@0ecc79701283:/# python
Python 3.10.4 (main, Apr 20 2022, 18:21:23) [GCC 10.2.1 20210110] on linux
Type "help", "copyright", "credits" or "license" for more information.
```

```python
import passlib
from passlib.hash import scram
hash = scram.hash("password")
scram.extract_digest_info(hash, "scram-sha-256")
(b'\xc7X+e\x8c\x91\xd2\xda;gLi', 100000, b'w\xf8o\x85\xe1&\xf0-\x0b?\xa7\x1er~OX\x85\x1ccFN\xab\xe9\xed\xf1d<2\x10x \x13')
```

## References

[SCRAM-SHA-256 and SCRAM-SHA-256-PLUS Simple Authentication and Security Layer (SASL) Mechanisms](https://datatracker.ietf.org/doc/html/rfc7677)
[Salted Challenge Response Authentication Mechanism (SCRAM) SASL and GSS-API Mechanisms](https://datatracker.ietf.org/doc/html/rfc5802)
