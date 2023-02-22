---
title: cockroach debug encryption-active-key
summary: Learn the command for viewing the algorithm and store key for an encrypted store.
toc: true
key: debug-encryption-active-key.html
docs_area: reference.cli
---

The `cockroach debug encryption-active-key` [command](cockroach-commands.html) displays the encryption algorithm and store key for an encrypted store.

## Synopsis

~~~ shell
$ cockroach debug encryption-active-key [path specified by the store flag]
~~~

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Example

Start a node with {{ site.data.products.enterprise }} Encryption At Rest enabled:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start --store=cockroach-data --enterprise-encryption=path=cockroach-data,key=aes-128.key,old-key=plain --insecure --certs-dir=certs
~~~

View the encryption algorithm and store key:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug encryption-active-key cockroach-data
~~~

~~~
AES128_CTR:be235c29239aa84a48e5e1874d76aebf7fb3c1bdc438cec2eb98de82f06a57a0
~~~

## See also

- [File an Issue](file-an-issue.html)
- [`cockroach` Commands Overview](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
