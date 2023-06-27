{{site.data.alerts.callout_info}}
CockroachDB clusters accept TLS 1.2 or TLS 1.3 security certificates for client authentication and encryption-in-flight. However, certain less-secure TLS 1.2 cipher suites are rejected, in accordance with the IETF's recommended cipher list defined in [RFC 8447](https://datatracker.ietf.org/doc/html/rfc8447).

SQL clients that are more than five years old may fail to connect, if they do not support any cipher suites that CockroachDB considers to be secure, and hence supports.

To allow connections using these deprecated cipher suites, and hence support these older clients, you can set the `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` environment variable to `true` for your `cockroach start` command. However, this is not recommended as these cipher suites are considered insecure.

Refer to the code for the current list of supported cipher suites: [CockroachDB on GitHub: tls_ciphersuites.go](https://github.com/cockroachdb/cockroach/blob/master/pkg/security/tls_ciphersuites.go)
{{site.data.alerts.end}}