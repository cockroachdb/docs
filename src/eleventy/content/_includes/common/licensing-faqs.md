All versions of CockroachDB starting from the release date of 24.3.0 onward, including patch fixes for versions 23.1-24.2 from that date onward, are made available under the [CockroachDB Software License](https://www.cockroachlabs.com/cockroachdb-software-license/). You can use the dropdown menu at the top of the page to view documentation for other versions.

<a name="types-of-licenses"></a>

## License options

The table of licenses below refers to options for {{ site.data.products.core }} deployments. All {{ site.data.products.cloud }} deployments automatically have a valid **Enterprise** license.

Type | Description
-------------|------------
**Enterprise** <a name="enterprise"></a> | This paid license allows usage of all CockroachDB features in accordance with the terms specified in the [CockroachDB Software License][csl]. License must be renewed annually or as negotiated. Support levels available include [Enterprise][support] or [Essential][support]. The type of enterprise license may be set to **Production**, **Pre-production**, or **Development** depending on the environment in which CockroachDB is deployed.
**Free** <a name="enterprise-free"></a> | Same functionality as **Enterprise**, but free of charge for businesses with less than $10M in annual revenue. Clusters will be [throttled](#throttling) after 7 days without sending [telemetry]({% link "{{ page.version.version }}/telemetry.md" %}). License must be renewed annually. Support level available is Community (i.e., [Docs]({% link "{{ page.version.version }}/index.md" %}), [Forum][forum], [Slack][slack]).
**Trial** <a name="enterprise-trial"></a> | A 30 day self-service trial license. [Telemetry]({% link "{{ page.version.version }}/telemetry.md" %}) is required during the trial. Clusters will be [throttled](#throttling) after 7 days without sending telemetry. Telemetry can be disabled once the cluster is upgraded to a paid **Enterprise** license. Support level available during trial is Community (i.e., [Docs]({% link "{{ page.version.version }}/index.md" %}), [Forum][forum], [Slack][slack]).
**Evaluation** <a name="enterprise-evaluation"></a> | Same functionality as **Enterprise**, but may be provided by your sales team if needed for an extended evaluation period. Support level is equivalent to a enterprise license.

<a href="mailto:sales@cockroachlabs.com">Contact Sales</a> if you want to try CockroachDB without telemetry requirements or if you require an extended trial period.

{{site.data.alerts.callout_success}}
Note that:

- Clusters with no license key have a 7-day grace period before requiring a license key. This is useful for ephemeral development clusters.
- No license key is required for developers running [single-node clusters](#single-node-clusters).
{{site.data.alerts.end}}

## Obtain a license

To obtain a paid **Enterprise** license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>. Once a license is added to your account, it appears in the [CockroachDB {{ site.data.products.cloud }} Console][cloud-console] on the **Organization &raquo; Enterprise Licenses** page. This page is only accessible by users with **Organization Admin** permissions.

[Sign up for a CockroachDB {{ site.data.products.cloud }} Console account](https://cockroachlabs.cloud/signup?experience=enterprise) if you do not already have one.

{{site.data.alerts.callout_info}}
Enterprise licenses generated prior to May 31st 2025 are not visible in the **Enterprise Licenses** page.
{{site.data.alerts.end}}

To obtain an **Enterprise Free** or **Enterprise Trial** license, take the following steps:

1. Point your web browser to the [CockroachDB {{ site.data.products.cloud }} Console][cloud-console] and [log in]({% link "cockroachcloud/authentication.md" %}#console-ui-authentication) as an account with **Organization Admin** permissions.
1. Select **Organization &raquo; Enterprise Licenses** from the nav bar dropdown. This will bring you to the **Enterprise Licenses** page, which shows a (possibly empty) list of licenses and their keys, with information about the status of each.
1. Click the **Create License** button. This will bring you to a page called **Get started with CockroachDB Enterprise**.
1. On this page, you will create an **Enterprise Trial** license or an **Enterprise Free** license.
    1. To create an **Enterprise Trial** license:
        1. Fill in the form with the required information.
        1. Click the **Continue** button.
        1. Select the checkbox to agree to the Terms & Conditions of the [CockroachDB Software License][csl].
        1. Click the **Generate License Key** button. You will be redirected to the **Enterprise Licenses** page, where you can [start using the key](#set-a-license).
    1. To create an **Enterprise Free** license:
        1. Fill in the form with the required information.
        1. Toggle the switch called **Find out if my company qualifies for an Enterprise Free license**.
        1. Fill out the additional information.
        1. Click the **Continue** button.
           - Note that at this stage, you may not qualify for the **Enterprise Free** license. If so, you will be given an **Enterprise Trial** license.
        1. Select the checkbox to agree to the Terms & Conditions of the [CockroachDB Software License][csl].
        1. Click the **Generate License Key** button. You will be redirected to the **Enterprise Licenses** page, where you can [start using the key](#set-a-license).

{{site.data.alerts.callout_danger}}
You will not be able to create more than one **Enterprise Trial** license per day. If you try, the UI will prevent you from proceeding, and the following message will be displayed:

_A new Enterprise Trial license cannot be created at this time because one was recently created. Tell us more about your intended use to find out if you qualify for an Enterprise Free license, or create a new one after ${DATE}._
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For quick local testing of Enterprise features, you can [run a single-node cluster](#single-node-clusters).
{{site.data.alerts.end}}

## Set a license

{% include "common/set-enterprise-license.md" %}

## Verify a license

To verify a license, open the [built-in SQL shell]({% link "{{ page.version.version }}/cockroach-sql.md" %}) and use the [`SHOW CLUSTER SETTING`]({% link "{{ page.version.version }}/show-cluster-setting.md" %}) command to check the license key:

~~~ sql
SHOW CLUSTER SETTING enterprise.license;
~~~
~~~
             enterprise.license
+-------------------------------------------+
  crl-0-ChB1x...
(1 row)
~~~

The license setting is also logged in the `cockroach.log` on the node where the command is run:

~~~ shell
cat cockroach.log | grep license
~~~
~~~
I171116 18:11:48.279604 1514 sql/event_log.go:102  [client=[::1]:56357,user=root,n1] Event: "set_cluster_setting", target: 0, info: {SettingName:enterprise.license Value:xxxxxxxxxxxx User:root}
~~~

## Monitor for license expiry

You can monitor the time until your license expires in the following ways:

1. [Prometheus]({% link "{{ page.version.version }}/monitor-cockroachdb-with-prometheus.md" %}): The `seconds_until_enterprise_license_expiry` metric reports the number of seconds until the license on a cluster expires. It will report `0` if there is no license, and a negative number if the license has already expired. For more information, see [Monitoring and Alerting]({% link "{{ page.version.version }}/monitoring-and-alerting.md" %}).
1. [DB Console]({% link "{{ page.version.version }}/ui-overview.md" %}): Several [license expiration messages]({% link "{{ page.version.version }}/ui-overview.md" %}#license-expiration-message) may be displayed, depending on the status of your cluster's license.
1. [CockroachDB {{ site.data.products.cloud }} Console][cloud-console]: If you have an **Enterprise Free** or **Enterprise Trial** cluster, you will see notifications in the **Enterprise Licenses** section, as well as receive notification emails sent to users with **Organization Admin** permissions.
1. CockroachDB emits [log messages]({% link "{{ page.version.version }}/logging-overview.md" %}) when a cluster is at risk of being [throttled](#throttling) due to license expiration or [telemetry]({% link "{{ page.version.version }}/telemetry.md" %}) requirements. The database will also return notices to [SQL clients]({% link "{{ page.version.version }}/cockroach-sql.md" %}) or [applications]({% link "{{ page.version.version }}/install-client-drivers.md" %}) that try to execute [transactions]({% link "{{ page.version.version }}/transactions.md" %}).

{{site.data.alerts.callout_info}}
During the transition to the [CockroachDB Software License][csl], expiration behavior (including [throttling](#throttling)) will work as follows depending on your version of CockroachDB.

For v23.1.29, v23.2.15, v24.1.7, v24.2.5, and v24.3.0 and later, clusters will behave as described in this documentation.

For versions less than or equal to v23.1.28, v23.2.14, v24.1.6, and v24.2.4, the behavior will be as follows:

- **Enterprise Trial** and **Enterprise Free** licenses will work as expected when you [set a license](#set-a-license).
- However, the expiration behavior will be different. Clusters running these versions won't be [throttled](#throttling); instead, the Enterprise features will immediately stop working at license expiration.
{{site.data.alerts.end}}

## Renew an expired license

To renew an expired **Enterprise** license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a> and then [set](#set-a-license) the new license.

To renew an expired **Enterprise Free** license, follow the steps in [Obtain a license](#obtain-a-license).

## FAQs

### Can I host CockroachDB as a service for internal use at my organization?

Yes, employees and contractors can use your internal CockroachDB instance as a service, but no people outside of your organization will be able to use it without purchasing a license.

### What constitutes hosting CockroachDB as a service?

Hosting CockroachDB as a service means creating an offering that allows third parties (other than your employees and contractors) to operate a database. Specifically, third parties cannot modify table schemas.

<a name="throttling"></a>

### What is throttling and how does it work?

When a cluster is being throttled, the number of concurrent open [SQL transactions]({% link "{{ page.version.version }}/transactions.md" %}) is limited to 5.

This will happen in the following cases:

- The cluster is not following [telemetry]({% link "{{ page.version.version }}/telemetry.md" %}) requirements.
    - There is a 7 day grace period for **Enterprise Free** and **Enterprise Trial** clusters to (re)start sending telemetry. This applies when the license is first [added](#set-a-license), or any time there is an interruption in telemetry.
- The cluster has an expired [license key](#obtain-a-license); depending on the type of expired license, the cluster will be throttled after the following time periods:
    - **Enterprise**: Never throttles
    - **Enterprise Free**: Throttles 30 days after expiration
    - **Enterprise Trial**: Throttles 7 days after expiration
- The cluster was running an earlier version of CockroachDB which supported the license known as "CockroachDB Core" and has just been patch upgraded to a version of CockroachDB which is available under the [CockroachDB Software License][csl]. Such clusters get a 30 day grace period before being throttled to de-risk impact to production environments.

If no valid license key is ever entered, the cluster will be throttled 7 days after cluster initialization.

Single-node clusters for development use are [not throttled](#single-node-clusters).

### Can I use CockroachDB for academic research?

Cockroach Labs encourages non-commercial academic research involving CockroachDB. For such projects, [obtain an **Enterprise Free** license](#obtain-a-license).

### Do government entities qualify for a CockroachDB Enterprise Free license?

No, government entities do not qualify for an **Enterprise Free** license. To obtain an **Enterprise Trial** license or paid **Enterprise** license, see [Obtain a license](#obtain-a-license).

<a name="single-node-clusters"></a>

### Where can I deploy CockroachDB Enterprise Free licenses?  Does it have to be on my own hardware or cloud instance?

When using an **Enterprise Free** license, an **Enterprise Free** license can only be used to run CockroachDB on your own on premises hardware or in your own account in the public clouds. If you plan to run CockroachDB in your customer's environment or public cloud instance, you will need an **Enterprise** License.

### Do I need a license key for running a single node cluster?

No license key is required for developers running [single-node clusters]({% link "{{ page.version.version }}/cockroach-start-single-node.md" %}) using the following [`cockroach` commands]({% link "{{ page.version.version }}/cockroach-commands.md" %}):

- [`cockroach start-single-node`]({% link "{{ page.version.version }}/cockroach-start-single-node.md" %})
- [`cockroach demo`]({% link "{{ page.version.version }}/cockroach-demo.md" %})

Single-node clusters are not [throttled](#throttling).

Generally, single-node clusters used for design, prototyping, testing, or development purposes in non-production, internal development environments do not require a license key.

### Can a company with less than $10 million in annual revenue use the Enterprise Free license if the aggregate revenue of its parent company and affiliates exceeds this threshold?

No, the **Enterprise Free** license is intended solely for organizations whose combined annual revenue, including the parent company and all affiliates, is under $10 million. If total annual revenues exceed this limit, the affiliate does not qualify for the **Enterprise Free** license.

## See also

- [CockroachDB Software License][csl]
- [Enterprise support][support]
- <a href="mailto:sales@cockroachlabs.com">Contact Sales</a>

<!-- Reference Links -->

[csl]: https://www.cockroachlabs.com/cockroachdb-software-license
[support]: https://www.cockroachlabs.com/support
[forum]: https://forum.cockroachlabs.com
[slack]: https://www.cockroachlabs.com/join-community
[cloud-console]: https://cockroachlabs.cloud
