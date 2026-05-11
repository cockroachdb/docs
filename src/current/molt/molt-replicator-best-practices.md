---
title: MOLT Replicator Best Practices
summary: Learn best practices for using MOLT Replicator for continuous replication.
toc: true
docs_area: migrate
---

This page describes best practices for using [MOLT Replicator]({% link molt/molt-replicator.md %}) to ensure reliable, secure, and performant data migration to CockroachDB.

## Test and validate

To verify that your connections and configuration work properly, run MOLT Replicator in a staging environment before replicating any data in production. Use a test or development environment that closely resembles production.

## Optimize performance

{% include molt/optimize-replicator-performance.md %}

## Security

Cockroach Labs **strongly** recommends the following:

### Connection security and credentials

{% include molt/molt-secure-connection-strings.md %}

### CockroachDB changefeed security

For failback scenarios, secure the connection from CockroachDB to MOLT Replicator using TLS certificates. Generate TLS certificates using self-signed certificates, certificate authorities like Let's Encrypt, or your organization's certificate management system.

#### TLS from CockroachDB to Replicator

Configure MOLT Replicator with server certificates using the [`--tlsCertificate`]({% link molt/replicator-flags.md %}#tls-certificate) and [`--tlsPrivateKey`]({% link molt/replicator-flags.md %}#tls-private-key) flags to specify the certificate and private key file paths. For example:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator start \
--tlsCertificate ./certs/server.crt \
--tlsPrivateKey ./certs/server.key \
...
~~~

These server certificates must correspond to the client certificates specified in the changefeed webhook URL to ensure proper TLS handshake.

Encode client certificates for changefeed webhook URLs:

- Webhook URLs: Use both URL encoding and base64 encoding: `base64 -i ./client.crt | jq -R -r '@uri'`
- Non-webhook contexts: Use base64 encoding only: `base64 -w 0 ca.cert`

#### JWT authentication

You can use JSON Web Tokens (JWT) to authorize incoming changefeed connections and restrict writes to a subset of SQL databases or user-defined schemas in the target cluster.

Replicator accepts any JWT token that meets the following requirements:

- Tokens must be signed using RSA or EC keys. HMAC and `None` signatures are automatically rejected.
- Tokens must include a `jti` (JWT ID) claim for revocation support.
- Tokens must include a custom claim with the schema authorization list.

{{site.data.alerts.callout_success}}
You can generate tokens using the [`make-jwt` command](#generate-jwt-tokens).
{{site.data.alerts.end}}

To configure JWT authentication:

1. Add PEM-formatted public signing keys to the `_replicator.jwt_public_keys` table in the staging database.

1. To revoke a specific token, add its `jti` value to the `_replicator.jwt_revoked_ids` table in the staging database.

The Replicator process re-reads these tables every minute to pick up changes.

To pass the JWT token from the changefeed to the Replicator webhook sink, use the [`webhook_auth_header` option]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED ... WITH webhook_auth_header='Bearer <encoded_token>';
~~~

##### Generate JWT tokens

The `make-jwt` command generates JWT tokens or claims for authorizing changefeed connections. It requires a signing key ([`-k`]({% link molt/replicator-flags.md %}#key)) and the database or schema to authorize ([`-a`]({% link molt/replicator-flags.md %}#allow)). You can output a signed token to a file ([`-o`]({% link molt/replicator-flags.md %}#out)) or generate an unsigned claim ([`--claim`]({% link molt/replicator-flags.md %}#claim)) for signing with an external JWT provider.

The format of the `-a` argument depends on your target database. For CockroachDB and PostgreSQL, which have a schema concept, use the `database.schema` format:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -k ec.key -a database_name.schema_name -o out.jwt
~~~

For MySQL and Oracle, which do not have a schema concept, use only the database name:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -k ec.key -a database_name -o out.jwt
~~~

{{site.data.alerts.callout_success}}
You can repeat the [`-a`]({% link molt/replicator-flags.md %}#allow) flag to authorize multiple schemas.
{{site.data.alerts.end}}

##### Token quickstart

The following example uses `OpenSSL` to generate keys, but any PEM-encoded RSA or EC keys will work. When using this example, ensure the `-a` argument format matches your target database as specified in [Generate JWT tokens](#generate-jwt-tokens).

{% include_cached copy-clipboard.html %}
~~~ shell
# Generate an EC private key using OpenSSL.
openssl ecparam -out ec.key -genkey -name prime256v1

# Write the public key components to a separate file.
openssl ec -in ec.key -pubout -out ec.pub

# Upload the public key for all instances of Replicator to find it.
cockroach sql -e "INSERT INTO _replicator.jwt_public_keys (public_key) VALUES ('$(cat ec.pub)')"

# Reload configuration, or wait one minute.
killall -HUP replicator

# Generate a token which can write to the ycsb.public schema.
# The key can be decoded using the debugger at https://jwt.io.
# Add the contents of out.jwt to the CREATE CHANGEFEED command:
# WITH webhook_auth_header='Bearer {out.jwt}'
replicator make-jwt -k ec.key -a ycsb.public -o out.jwt
~~~

##### External JWT providers

To use an external JWT provider, generate a claim with the `--claim` flag. The PEM-formatted public key or keys for that provider must be inserted into the `_replicator.jwt_public_keys` table. The `iss` (issuers) and `jti` (token id) fields will likely be specific to your auth provider, but the custom claim must be retained in its entirety:

{% include_cached copy-clipboard.html %}
~~~ shell
replicator make-jwt -a 'database.schema' --claim
~~~

~~~json
{
  "iss": "replicator",
  "jti": "d5ffa211-8d54-424b-819a-bc19af9202a5",
  "https://github.com/cockroachdb/replicator": {
    "schemas": [
      [
        "database",
        "schema"
      ]
    ]
  }
}
~~~

### Production considerations

- Avoid [`--disableAuthentication`]({% link molt/replicator-flags.md %}#disable-authentication) and [`--tlsSelfSigned`]({% link molt/replicator-flags.md %}#tls-self-signed) flags in production environments. These flags should only be used for testing or development purposes.

### Supply chain security

Use the `version` command to verify the integrity of your MOLT Replicator build and identify potential upstream vulnerabilities.

{% include_cached copy-clipboard.html %}
~~~ shell
replicator version
~~~

The output includes:

- Module name
- go.mod checksum
- Version

Use this information to determine if your build may be subject to vulnerabilities from upstream packages. Cockroach Labs uses Dependabot to automatically upgrade Go modules, and the team regularly merges Dependabot updates to address security issues.

## See also

- [MOLT Replicator]({% link molt/molt-replicator.md %})
- [MOLT Replicator Installation]({% link molt/molt-replicator-installation.md %})
- [MOLT Replicator Flags]({% link molt/replicator-flags.md %})
- [Migration Overview]({% link molt/migration-overview.md %})
