---
title: cockroach debug encryption-decrypt
summary: Learn the commands for collecting debug information from all nodes in your cluster.
toc: true
docs_area: reference.cli
---

{{site.data.alerts.callout_danger}}
We strongly recommend only using `cockroach debug encryption-decrypt` when working directly with the [Cockroach Labs support team]({% link {{ page.version.version }}/support-resources.md %}).
{{site.data.alerts.end}}

The [`cockroach debug encryption-decrypt`]({% link {{ page.version.version }}/cockroach-commands.md %}) command decrypts store files on a node that are [encrypted at rest]({% link {{ page.version.version }}/encryption.md %}) so that they can be examined to add more context to logs gathered from the [`cockroach debug zip`]({% link {{ page.version.version }}/cockroach-debug-zip.md %}) command. Unless they are decrypted, Cockroach Labs cannot examine store files that are encrypted at rest.

## Synopsis

~~~ shell
cockroach debug encryption-decrypt {store_directory} {input_file} {output_file} --enterprise-encryption={encryption_spec} {flags}
~~~

Replace:

- `{encryption_spec}`: The cluster's [encryption details]({% link {{ page.version.version }}/encryption.md %}#starting-a-node-with-encryption).
- `{store_directory}`: The directory where the node [stores data files]({% link {{ page.version.version }}/cockroach-start.md %}#store).
- `{input_file}`: The name of an encrypted store file.
- `{output_file}`: A name for the decrypted store file. If not specified, the command will output the decrypted contents to `stdout`.

Run the command locally on a node. It does not support the `--url` flag.

After running the command, you can send the requested decrypted file to Cockroach Labs.

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Flags

The `debug encryption-decrypt` subcommand supports the following [general-use](#general) and [client connection](#client-connection) flags.

### General

Flag | Description
-----|-----------
`--timeout` | Return an error if the command does not conclude within a specified nonzero value. The timeout is suffixed with `s` (seconds), `m` (minutes), or `h` (hours). For example:<br /><br />`--timeout=2m`

### Client connection

Flag | Description
-----|------------
`--user`<br><br>`-u` | The [SQL user]({% link {{ page.version.version }}/create-user.md %}) that will own the client session.<br><br>**Env Variable:** `COCKROACH_USER`<br>**Default:** `root`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--cert-principal-map` | A comma-separated list of `<cert-principal>:<db-principal>` mappings. This allows mapping the principal in a certificate to a DB principal such as `node` or `root` or any SQL user. This is intended for use in situations where the certificate management system places restrictions on the `Subject.CommonName` or `SubjectAlternateName` fields in the certificate (e.g., disallowing a `CommonName` like `node` or `root`). If multiple mappings are provided for the same `<cert-principal>`, the last one specified in the list takes precedence. A principal not specified in the map is passed through as-is via the identity function. A certificate is allowed to authenticate a DB principal if the DB principal name is contained in the mapped `CommonName` or DNS-type `SubjectAlternateName` fields.
`--certs-dir` | The path to the [certificate directory]({% link {{ page.version.version }}/cockroach-cert.md %}) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`

## Files

The `cockroach debug encryption-decrypt` command will output the decrypted store file to the specified location. If no location is specified, the decrypted contents are sent to`stdout`.

## See also

- [File an Issue]({% link {{ page.version.version }}/file-an-issue.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
- [Support Resources]({% link {{ page.version.version }}/support-resources.md %})
