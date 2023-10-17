---
title: Licensing FAQs
summary: Frequently asked questions about CockroachDB Enterprise and core licensing.
toc: true
docs_area: get_started
---

CockroachDB code is primarily licensed in two ways:

-  [Business Source License (BSL)](#bsl)
-  [Cockroach Community License (CCL)](#ccl)

CockroachDB core is free to use.  Most [core features](#feature-licensing) are licensed under the BSL, but some core features are subject to the CCL or third-party licenses.

Non-CCL core features from version 19.1 and earlier are licensed under [Apache 2.0](#apache); however, some features remain under third-party licenses. Beginning in version 19.2, these non-CCL features are licensed under the BSL for three years before [converting](#license-conversion-timeline) to the Apache 2.0 license.

CockroachDB [Enterprise features]({% link {{ page.version.version }}/enterprise-licensing.md %}) require a [paid license](#obtain-a-license) from Cockroach and are licensed under the Cockroach Community License.

{{site.data.alerts.callout_info}}
You can find any feature's license by checking the code's file header in the [CockroachDB repository](https://github.com/cockroachdb/cockroach).
{{site.data.alerts.end}}

## Types of licenses

Type | Description
-------------|------------
<a name="apache"></a>**Apache 2.0 License** | Core features under the Apache License are free to use and fully open-source. BSL features convert to this license three years after their release. For license conversion dates, see the [table below](#license-conversion-timeline).
<a name="bsl"></a>**Business Source License**| BSL features are free to use and the source code is available, but users may not use CockroachDB [as a service](#what-constitutes-hosting-cockroachdb-as-a-service) without an agreement with Cockroach Labs. The BSL is not certified as an open-source license, but most of the [Open Source Initiative](https://wikipedia.org/wiki/Open_Source_Initiative) (OSI) criteria are met.
<a name="ccl"></a>**Cockroach <br/> Community License** | <ul><li> CCL (Free) features are free to use. The source code is available to view and modify, but it cannot be reused without an agreement with Cockroach Labs. </li><li> CCL (Paid) features require an Enterprise license key to access. The source code is available to view and modify, but it cannot be used without an agreement with Cockroach Labs. </li></ul>

For additional custom licensing options, [contact us](https://support.cockroachlabs.com/hc/en-us).

For each BSL release all associated alpha, beta, major, and minor (point) releases will become Apache 2.0 on the same day three years after the major release date. Once a release is published under the BSL, the license cannot be changed to prevent code from becoming open-source at the specified change date. The following table lists the current license for non-CCL features for each published release:

### License conversion timeline

CockroachDB version | License | Converts to Apache 2.0
--------------------|---------|----------------------------
23.1 | Business Source License | May 16, 2026
22.2 | Business Source License | Dec 6, 2025
22.1 | Business Source License | May 24, 2025
21.2 | Business Source License | Nov 16, 2024
21.1 | Business Source License | May 18, 2024
20.2 | Business Source License | Nov 10, 2023
20.1 | Business Source License | May 12, 2023
19.2 | Apache 2.0 | -
19.1 | Apache 2.0 | -
2.1  | Apache 2.0 | -
2.0  | Apache 2.0 | -

## Feature licensing

The table below shows how certain core and Enterprise features are licensed:

Feature          | BSL | CCL (free)      | CCL (paid)
-----------------|:-----:|:-----------------:|:---------------:
**[Import]({% link {{ page.version.version }}/import.md %})** | ✓ | |
**[Export]({% link {{ page.version.version }}/export.md %})** | ✓ | |
**[Restore]({% link {{ page.version.version }}/restore.md %})** | | ✓ |
**[Full backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#full-backups)** | | ✓ |
**[Incremental backups]({% link {{ page.version.version }}/take-full-and-incremental-backups.md %}#incremental-backups)** | | | ✓
**[Other advanced backup features]({% link {{ page.version.version }}/backup.md %})** | | | ✓
**[Core changefeed](create-and-configure-changefeeds.html?filters=core)** | | ✓ |
**[{{ site.data.products.enterprise }} changefeed]({% link {{ page.version.version }}/create-and-configure-changefeeds.md %}#configure-a-changefeed)** | | | ✓
**[Table-level zone configuration]({% link {{ page.version.version }}/configure-replication-zones.md %}#replication-zone-levels)** | ✓ | |
**[Multi-region capabilities]({% link {{ page.version.version }}/multiregion-overview.md %})** | | | ✓
**[Follower reads]({% link {{ page.version.version }}/follower-reads.md %})** | | | ✓
**[Bounded staleness reads]({% link {{ page.version.version }}/follower-reads.md %}#bounded-staleness-reads)** | | | ✓
**[Node map]({% link {{ page.version.version }}/enable-node-map.md %})** | | | ✓
**[Encryption at rest]({% link {{ page.version.version }}/security-reference/encryption.md %}#encryption-at-rest-enterprise)** | | | ✓
**[Role-based access management]({% link {{ page.version.version }}/security-reference/authorization.md %}#roles)** | ✓ | |
**[Password and certificate authentication]({% link {{ page.version.version }}/authentication.md %})** | ✓ | |
**[GSSAPI with Kerberos authentication]({% link {{ page.version.version }}/gssapi_authentication.md %})** | | | ✓
**[All other core features](https://www.cockroachlabs.com/compare/)** | ✓ | |

{{site.data.alerts.callout_info}}
Individual feature licensing may change with each release of CockroachDB. You can use the dropdown menu at the top of the page to view documentation for other versions of CockroachDB.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
See [Enterprise Features]({% link {{ page.version.version }}/enterprise-licensing.md %}) for more information.
{{site.data.alerts.end}}

## Obtain a license

All CockroachDB code is included in the same binary. No license key is required to access BSL and CCL (Free) features. To access CCL (Paid) features, users have two options:

- An **Enterprise license** enables you to use CockroachDB Enterprise features for longer periods (one year or more). To upgrade to an Enterprise license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>.
- A **Trial license** enables you to try out CockroachDB Enterprise features for 30 days for free. To obtain a Trial license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>.

{{site.data.alerts.callout_success}}
For quick local testing of Enterprise features, you can use the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command, which starts a temporary, in-memory cluster with a SQL shell open and a trial license applied automatically.
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
Cockroach Labs encourages non-commercial academic research involving CockroachDB. For such projects, please [contact us](https://support.cockroachlabs.com/hc/en-us) to discuss a possible licensing arrangement.
{{site.data.alerts.end}}

## Set a license

{% include {{ page.version.version }}/misc/set-enterprise-license.md %}

## Verify a license

To verify a license, open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) and use the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) command to check the organization name and license key:

{% include_cached copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING cluster.organization;
~~~
~~~
  cluster.organization
+----------------------+
  Acme Company
(1 row)
~~~

{% include_cached copy-clipboard.html %}
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

{% include_cached copy-clipboard.html %}
~~~ sql
$ cat cockroach.log | grep license
~~~
~~~
I171116 18:11:48.279604 1514 sql/event_log.go:102  [client=[::1]:56357,user=root,n1] Event: "set_cluster_setting", target: 0, info: {SettingName:enterprise.license Value:xxxxxxxxxxxx User:root}
~~~

## Monitor for license expiry

You can monitor the time until your license expires with [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}). The `seconds_until_enterprise_license_expiry` metric reports the number of seconds until the Enterprise license on a cluster expires. It will report 0 if there is no license or a negative number if the license has already expired. For more information, see [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %}).

## Renew an expired license

After your license expires, the Enterprise features stop working, but your production setup is unaffected. For example, the backup and restore features would not work until the license is renewed, but you would be able to continue using all other features of CockroachDB without interruption.

To renew an expired license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a> and then [set](#set-a-license) the new license.

## FAQs

### Can I host CockroachDB as a service for internal use at my organization?

Yes, employees and contractors can use your internal CockroachDB instance as a service, but no people outside of your organization will be able to use it without purchasing a license. Use of Enterprise features will always require a license.

### What constitutes hosting CockroachDB as a service?

Hosting CockroachDB as a service means creating an offering that allows third parties (other than your employees and contractors) to operate a database. Specifically, third parties cannot modify table schemas.

### I would like to reuse a single component from the CockroachDB project in my own software, which uses the AGPL or another open-source license. Is this possible?

The CockroachDB team is committed to supporting the open-source community and willing to consider extracting specific internal components that are generally useful as a separate project with its own license, for example APL. For more details, feel free to [contact us](https://support.cockroachlabs.com/hc/en-us).

### Can I fork the CockroachDB project pre-BSL and create my own CockroachDB derivative with a different license?

You can fork any historical version of CockroachDB in your own project, as allowed by the license available for that version, and modify it for your purpose. Note however that only the copyright holder (Cockroach Labs) can relicense the components that you forked from: your derivative will need to keep the original license at the time of the fork. Any component you copy from a BSL-licensed CockroachDB into your project will make the BSL apply to your project as well.

### If Cockroach Labs is making available software to me under the Business Source License (BSL), does Cockroach Labs grant me any patent rights?

The BSL does not explicitly reference patents in the text of the license. However, Cockroach Labs believes that the BSL includes an implied patent license and intends that in this case the BSL include an implied patent license under those patent claims that are licenseable by Cockroach Labs which are necessarily infringed by any permitted use of the BSL licensed software alone.
