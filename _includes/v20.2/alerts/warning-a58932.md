A denial-of-service (DoS) vulnerability is present in CockroachDB v20.2.0 - v20.2.3 due to a bug in [protobuf](https://github.com/gogo/protobuf). This is resolved in CockroachDB [v20.2.4](../releases/v20.2.html#v20-2-4) and [later releases](../releases/index.html). When upgrading is not an option, users should audit their network configuration to verify that the CockroachDB HTTP port is not available to untrusted clients. We recommend blocking the HTTP port behind a firewall.

For more information, including other affected versions, see [Technical Advisory 58932](../advisories/a58932.html).
