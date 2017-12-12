---
title: Licensing
summary: Request and set trial and enterprise license keys for CockroachDB
toc: false
---

This page shows you how to request and set the trial and enterprise license keys for CockroachDB.

<div id="toc"></div>

CockroachDB distributes a single binary that contains both core and [enterprise features](https://www.cockroachlabs.com/pricing/). However, to use the enterprise features, you need either a trial or an enterprise license key.

## Types of Licenses

You can request a trial license or an enterprise license:

- Trial license: A trial license enables you to try out CockroachDB enterprise features for 30 days. After 30 days, you can upgrade to the enterprise license by [requesting](licensing.html#request-a-trial-or-an-enterprise-license-key) and [setting](licensing.html#set-the-trial-or-enterprise-license-key) an enterprise license key.
- Enterprise license: An enterprise license enables you to use CockroachDB enterprise features for longer periods (one year or more).

## Request a Trial or an Enterprise License Key

[Contact us](https://www.cockroachlabs.com/pricing/sales/) to request a trial or an enterprise license key.

## Set the Trial or Enterprise License Key

As the CockroachDB `root` user, open the [built-in SQL shell](use-the-built-in-sql-client.html) and use the `SET CLUSTER SETTING` command to set the name of your organization and the license key:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SET CLUSTER SETTING cluster.organization = 'Acme Company'; 
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx’;
~~~

## Verify the License Key is Set

To verify the license key is set, open the [built-in SQL shell](use-the-built-in-sql-client.html) and use the `SHOW CLUSTER SETTING` command to verify the organization name and license key:

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING cluster.organization;
~~~
~~~
+----------------------+
| cluster.organization |
+----------------------+
| Acme Company         |
+----------------------+
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING enterprise.license;
~~~
~~~
+--------------------------------------------------------------------+
|                         enterprise.license                         |
+--------------------------------------------------------------------+
| xxxxxxxxxxxx                                                       |
+--------------------------------------------------------------------+
(1 row)
~~~

The license setting is also logged in the cockroach.log on the node where the command is run:

{% include copy-clipboard.html %}
~~~ sql
$ cat cockroach.log | grep license
~~~
~~~
I171116 18:11:48.279604 1514 sql/event_log.go:102  [client=[::1]:56357,user=root,n1] Event: "set_cluster_setting", target: 0, info: {SettingName:enterprise.license Value:xxxxxxxxxxxx User:root}
~~~

## Renew Expired License

After your license expires, the enterprise features stop working, but your production setup is unaffected. 

As of now, CockroachDB does not inform you when your license is about to expire. Hence it's important for you to note and remember the license expiration date when you set your license. 

To renew your license, [contact us](https://www.cockroachlabs.com/pricing/) again to request a new license and then [set](licensing.html#set-the-trial-or-enterprise-license-key) the new license. 

## See Also

- [Set Cluster Setting](set-cluster-setting.html)
- [Show Cluster Setting](show-cluster-setting.html)
