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

Replicator supports JWT claims that allow writes to specific databases, schemas, or all of them. JWT tokens must be signed using RSA or EC keys. HMAC and `None` signatures are automatically rejected.

To configure JWT authentication:

1. Add PEM-formatted public signing keys to the `_replicator.jwt_public_keys` table in the staging database.

1. To revoke a specific token, add its `jti` value to the `_replicator.jwt_revoked_ids` table in the staging database.

The Replicator process re-reads these tables every minute to pick up changes.

To pass the JWT token from the changefeed to the Replicator webhook sink, use the [`webhook_auth_header` option]({% link {{ site.current_cloud_version }}/create-changefeed.md %}#options):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED ... WITH webhook_auth_header='Bearer <encoded_token>';
~~~

##### Token quickstart

The following example uses `OpenSSL` to generate keys, but any PEM-encoded RSA or EC keys will work.

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

The `make-jwt` command also supports a [`--claim`]({% link molt/replicator-flags.md %}#claim) flag, which prints a JWT claim that can be signed by your existing JWT provider. The PEM-formatted public key or keys for that provider must be inserted into the `_replicator.jwt_public_keys` table. The `iss` (issuers) and `jti` (token id) fields will likely be specific to your auth provider, but the custom claim must be retained in its entirety.

{{site.data.alerts.callout_success}}
You can repeat the [`-a`]({% link molt/replicator-flags.md %}#allow) flag to create a claim for multiple schemas.
{{site.data.alerts.end}}

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
