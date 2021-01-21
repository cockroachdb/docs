---
title: Licensing
summary: Overview of Licensing for CockroachDB.
toc: true
---

Current CockroachDB code is licensed in three ways: 

-  Business Source License (BSL)
-  Cockroach Community License (Free)
-  Cockroach Community License (Paid)

Core features released up to and including version 19.1 are licensed under Apache 2.0. After version 19.1, core features are licensed under the BSL for three years before converting to the Apache 2.0 license. All enterprise features are licensed under the Cockroach Community License (CCL).

## Types of licenses

Type | Description
-------------|------------
**Apache 2.0 License** | Core features under the Apache License are free to use and fully open-source. BSL features convert to this license three years after their release. For license conversion dates, see the [Licensing FAQs](licensing-faqs.html).
**Business Source License** | BSL Features are free to use and the source code is available, but users may not use CockroachDB as a service without an agreement with Cockroach Labs.
**Cockroach Community License (Free)** | CCL (Free) features are free to use, but the source code is not available to users.
**Cockroach Community License (Paid)** | CCL (Paid) features require an enterprise license key to access and the source code is not available to users.

## Core feature licensing

The table below shows how core features are licensed. For a complete list of enterprise features, see [Enterprise Features](enterprise-licensing.html).

Feature          | BSL | CCL (free)      | CCL (paid) 
-----------------|-----|-----------------|---------------
**[Import](import.html)** | | ✓ |
**[Export](export.html)** | ✓ | |
**[Restore](restore.html)** | | ✓ |
**[Full Backups](backup-and-restore.html#perform-core-backup-and-restore)** | | ✓ |
**[Incremental Backups](backup-and-restore.html#full-and-incremental-backups)** | | | ✓
**[Other Advanced Backup Features](backup-and-restore.html#perform-enterprise-backup-and-restore)** | | | ✓
**[Core Changefeed](change-data-capture.html#create-a-changefeed-core)** | | ✓ |
**[Enterprise Changefeed](change-data-capture.html#configure-a-changefeed-enterprise)** | | | ✓

## Obtain a license

All CockroachDB code is included in the same binary. No license key is required to access BSL and CCL (Free) features. To access CCL (Paid) features, users have two options:

- An **Enterprise License** enables you to use CockroachDB enterprise features for longer periods (one year or more). To upgrade to an enterprise license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>.
- A **Trial License** enables you to try out CockroachDB enterprise features for 30 days for free. To obtain a trial license, fill out [the registration form](https://www.cockroachlabs.com/get-cockroachdb/) and receive your trial license via email within a few minutes.

{{site.data.alerts.callout_success}}
For quick local testing of Enterprise features, you can use the [`cockroach demo`](cockroach-demo.html) command, which starts a temporary, in-memory cluster with a SQL shell open and a trial license applied automatically.
{{site.data.alerts.end}}

## Set a license

As the CockroachDB `root` user, open the [built-in SQL shell](cockroach-sql.html) in insecure or secure mode, as per your CockroachDB setup. In the following example, we assume that CockroachDB is running in insecure mode. Then use the [`SET CLUSTER SETTING`](set-cluster-setting.html) command to set the name of your organization and the license key:

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
>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx';
~~~

## Verify a license

To verify a license, open the [built-in SQL shell](cockroach-sql.html) and use the [`SHOW CLUSTER SETTING`](show-cluster-setting.html) command to check the organization name and license key:

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING cluster.organization;
~~~
~~~
  cluster.organization
+----------------------+
  Acme Company
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING enterprise.license;
~~~
~~~
             enterprise.license
+-------------------------------------------+
  crl-0-ChB1x...
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

## Renew an expired license

After your license expires, the enterprise features stop working, but your production setup is unaffected. For example, the backup and restore features would not work until the license is renewed, but you would be able to continue using all other features of CockroachDB without interruption.

To renew an expired license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a> and then [set](licensing.html#set-a-license) the new license.

## See also

- [Licensing FAQs](licensing-faqs.html)