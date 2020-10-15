---
title: cockroach debug encryption-active-key
summary: Learn the command for viewing the algorithm and store key for an encrypted store.
toc: true
redirect_from: debug-encryption-active-key.html
key: debug-encryption-active-key.html
---

The `cockroach debug encryption-active-key` [command](cockroach-commands.html) displays the encryption algorithm and store key for an encrypted store.

## Synopsis

~~~ shell
$ cockroach debug encryption-active-key [path specified by the store flag]
~~~

## Flags

Flag | Description
-----|-----------
`--cluster-name` | The cluster name to connect to. If the cluster has a cluster name, either this flag or `--disable-cluster-name-verification` must be included. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. If the cluster has a cluster name, either this flag or `--cluster-name` must be included. For more information, see [`cockroach start`](cockroach-start.html#general).

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

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
