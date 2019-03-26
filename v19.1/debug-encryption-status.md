---
title: View the encryption algorithm and store key
summary: Learn the command for viewing the algorithm and store key for an encrypted store.
toc: true
---

The `debug encryption-status` [command](cockroach-commands.html) displays the encryption algorithm and store key for an encrypted store.

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

## See also

- [File an Issue](file-an-issue.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Troubleshooting Overview](troubleshooting-overview.html)
