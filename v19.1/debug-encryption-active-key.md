---
title: View the Encryption Algorithm and Store Key
summary: Learn the command for viewing the algorithm and store key for an encrypted store.
toc: true
---

The `debug encryption-active-key` [command](cockroach-commands.html) displays the encryption algorithm and store key for an encrypted store.

## Subcommands

While the `cockroach debug` command has a few subcommands, users are expected to use only the [`zip`](debug-zip.html), [`encryption-active-key`](debug-encryption-active-key.html),  [`merge-logs`](debug-merge-logs.html), and [`ballast`](debug-ballast.html) subcommands.

The other `debug` subcommands are useful only to CockroachDB's developers and contributors.

## Synopsis

~~~ shell
$ cockroach debug encryption-active-key [path specified by the store flag]
~~~

## Example

Start a node with encryption-at-rest enabled:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=aes-128.key,old-key=plain --insecure --certs-dir=certs
~~~

View the encryption algorithm and store key:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach debug encryption-active-key cockroach-data
~~~

~~~
AES128_CTR:be235c29239aa84a48e5e1874d76aebf7fb3c1bdc438cec2eb98de82f06a57a0
~~~

## See also

- [File an Issue](file-an-issue.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
