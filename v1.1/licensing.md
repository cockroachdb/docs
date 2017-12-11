---
title: Licensing
summary: Request and set trial and enterprise license for CockroachDB
toc: false
---

This page shows you how to obtain and set trial and enterprise licenses for CockroachDB.

<div id="toc"></div>

CockroachDB distributes a single binary that contains both core and [enterprise features](https://www.cockroachlabs.com/pricing/). However, to use the enterprise features, you need either a trial or an enterprise license key.

## Types of Licenses

You can request a trial license or an enterprise license:

- Trial license: A trial license enables you to try out CockroachDB enterprise features for 30 days. After 30 days, you can upgrade to the enterprise license by [requesting](licensing.html#request-a-trial-or-an-enterprise-license-key) and [setting](licensing.html#set-the-trial-or-enterprise-license-key) an enterprise license.
- Enterprise license: An enterprise license enables you to use CockroachDB enterprise features for longer periods (one year or more).

## Request a Trial or an Enterprise License Key

[Contact us](https://www.cockroachlabs.com/pricing/sales/) to request a trial or enterprise license.

## Set the Trial or Enterprise License Key

Log in as the CockroachDB root user, open a SQL shell, and run the following cluster setting command to set the license key:

~~~ sql
>  SET CLUSTER SETTING cluster.organization = 'Acme Company'; 

>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx’;
~~~

## Verify the License Key is Set

To verify the license key is set, open a SQL shell and run the `SHOW CLUSTER SETTING` command:

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

The license setting is also logged in the cockroach.log of the node where the command is run:

~~~ sql
$ cat cockroach.log | grep license
~~~
~~~
I171116 18:11:48.279604 1514 sql/event_log.go:102  [client=[::1]:56357,user=root,n1] Event: "set_cluster_setting", target: 0, info: {SettingName:enterprise.license Value:xxxxxxxxxxxx User:root}
~~~

## Renew Expired License
As of now, CockroachDB has no method of informing you that your license is about to expire. When you request and set your license, you need to note down and remember when it expires and request for the new license in advance before the license expires. After your license expires, the enterprise features stop working, but your production setup is unaffected. To renew your license, [contact us](https://www.cockroachlabs.com/pricing/) again to request a new license and [set](licensing.html#set-the-trial-or-enterprise-license-key) the new license. 

## See Also

- [Set Cluster Setting](set-cluster-setting.html)
- [Show Cluster Setting](show-cluster-setting.html)
