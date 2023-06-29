{{site.data.alerts.callout_info}}
CockroachDB clusters can talk TLS 1.2 or TLS 1.3 to SQL clients for encryption-in-flight and to prove each other's identities. However, certain less-secure TLS 1.2 cipher suites are rejected, in accordance with the IETF's recommended cipher list defined in [RFC 8447](https://datatracker.ietf.org/doc/html/rfc8447).

SQL clients or intermediate proxies or load balancers that do not support any cipher suites that CockroachDB considers to be secure and supports, may fail to connect to a cluster.

To allow SQL connections using the deprecated cipher suites, you can set the `COCKROACH_TLS_ENABLE_OLD_CIPHER_SUITES` environment variable to `true` for your `cockroach start` command. We provide the above environment variable only for cases when you can't use a client or intermediate proxy or load balancer that support any of the secure cipher suites.

Refer to the code for the current list of supported cipher suites: [CockroachDB on GitHub: tls_ciphersuites.go](https://github.com/cockroachdb/cockroach/blob/master/pkg/security/tls_ciphersuites.go)
{{site.data.alerts.end}}