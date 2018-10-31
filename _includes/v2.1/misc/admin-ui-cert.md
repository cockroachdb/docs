On [accessing the Admin UI](admin-ui-access-and-navigate.html#access-the-admin-ui), your browser will consider the CockroachDB-created certificate invalid, so you’ll need to click through a warning message to get to the UI.

For secure clusters, you can avoid getting the warning message by using a certificate issued by a public CA:

1. Request a certificate from a public CA (for example, [Let's Encrypt](https://letsencrypt.org/)). The certificate must have the IP addresses and DNS names used to reach the Admin UI listed in the `Subject Alternative Names` field.
2. Rename the certificate and key as `ui.crt` and `ui.key`.
3. Add the `ui.crt` and `ui.key` to the [certificate directory](create-security-certificates.html#certificate-directory). `ui.key` must not have group or world permissions (maximum permissions are 0700, or rwx------). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.
