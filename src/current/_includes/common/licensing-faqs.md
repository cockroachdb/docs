CockroachDB is made available under the [CockroachDB Software License][csl].

## Types of licenses

The table of licenses below refers to options for {{ site.data.products.core }} deployments. All {{ site.data.products.cloud }} deployments automatically have a valid **Enterprise** license.

Type | Description
-------------|------------
**Enterprise** <a name="enterprise"></a> | This paid license allows usage of all CockroachDB features with no restrictions under the terms specified in the [CockroachDB Software License][csl]. License must be renewed annually or as negotiated. Support levels available include [Enterprise][support] or [Essential][support].
**Enterprise Free** <a name="enterprise-free"></a> | Same functionality as **Enterprise**, but free of charge for businesses with less than $10M in annual revenue, and telemetry is required except for ephemeral clusters (7 days or less). Clusters will be [throttled](#throttling) after 7 days without sending telemetry. License must be renewed annually. Support level available is Community (i.e., [Docs]({% link {{ page.version.version }}/index.md %}), [Forum][forum], [Slack][slack]).
**Enterprise Trial** <a name="enterprise-trial"></a> | A 30 day self-service trial license. Telemetry is required during the trial. Telemetry can be disabled once the cluster is upgraded to a paid **Enterprise** license. Support level available during trials is Community (i.e., [Docs]({% link {{ page.version.version }}/index.md %}), [Forum][forum], [Slack][slack]).

{{site.data.alerts.callout_success}}
Note that:
- Clusters with no license have a 7-day grace period before needing to install a license and start sending telemetry data.
- No license key is required for developers running [single-node clusters](#single-node-clusters).
- Clusters with Enterprise Free or Enterprise Trial licenses cannot disable telemetry; if such a cluster signals a telemetry sending error, it will be due to firewall configuration or a network issue.
{{site.data.alerts.end}}

## Obtain a license

To obtain a paid **Enterprise** license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a>.

To obtain an **Enterprise Free** or **Enterprise Trial** license, take the following steps:

1. Point your web browser to the [CockroachDB {{ site.data.products.cloud }} Console](https://cockroachlabs.cloud) and [log in]({% link cockroachcloud/authentication.md  %}#console-ui-authentication).
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
        1. Toggle the switch called **Find out if my company qualifies for an Enterprise Free license**. *By toggling this switch you are legally attesting to the fact that your company revenue meets the requirements of the license*.
        1. Click the **Continue** button.
        1. Select the checkbox to agree to the Terms & Conditions of the [CockroachDB Software License][csl].
        1. Click the **Generate License Key** button. You will be redirected to the **Enterprise Licenses** page, where you can [start using the key](#set-a-license).

{{site.data.alerts.callout_danger}}
You will not be able to create more than one **Enterprise Trial** license per day. If you try, the UI will prevent you from proceeding, and the following message will be displayed:

> A new Enterprise Trial license cannot be created at this time because one was recently created. Tell us more about your intended use to find out if you qualify for an Enterprise Free license, or create a new one after October 16, 2024 at 10:49 AM EDT.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
For quick local testing of Enterprise features, you can [run a single-node cluster](#single-node-clusters).
{{site.data.alerts.end}}

## Set a license

{% include common/set-enterprise-license.md %}

## Verify a license

To verify a license, open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) and use the [`SHOW CLUSTER SETTING`]({% link {{ page.version.version }}/show-cluster-setting.md %}) command to check the license key:

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

You can monitor the time until your license expires in the following ways:

1. [Prometheus]({% link {{ page.version.version }}/monitor-cockroachdb-with-prometheus.md %}): The `seconds_until_enterprise_license_expiry` metric reports the number of seconds until the license on a cluster expires. It will report `0` if there is no license, and a negative number if the license has already expired. For more information, see [Monitoring and Alerting]({% link {{ page.version.version }}/monitoring-and-alerting.md %}).
1. [DB console]({% link {{ page.version.version }}/ui-overview.md %}): Several [license expiration messages]({% link {{ page.version.version }}/ui-overview.md %}#license-expiration-message) may be displayed, depending on the status of your cluster's license.

## Renew an expired license

To renew an expired **Enterprise** license, <a href="mailto:sales@cockroachlabs.com">contact Sales</a> and then [set](#set-a-license) the new license.

To renew an expired **Enterprise Free** license, follow the steps in [Obtain a license](#obtain-a-license).

## FAQs

### Can I host CockroachDB as a service for internal use at my organization?

Yes, employees and contractors can use your internal CockroachDB instance as a service, but no people outside of your organization will be able to use it without purchasing a license. Use of Enterprise features will always require a license.

### What constitutes hosting CockroachDB as a service?

Hosting CockroachDB as a service means creating an offering that allows third parties (other than your employees and contractors) to operate a database. Specifically, third parties cannot modify table schemas.

<a name="throttling"></a>

### What is throttling and how does it work?

When a cluster is being throttled, the number of concurrent open [SQL transactions]({% link {{ page.version.version }}/transactions.md %}) is limited to 5.

This will only happen in the following cases:

- The cluster is not following telemetry requirements.
    - There is a 7 day grace period for new **Enterprise Free** and **Enterprise Trial** clusters to start sending telemetry.
- The cluster has an expired [license key](#obtain-a-license); depending on the type of expired license, the cluster will be throttled after the following time periods:
    - **Enterprise**: Never throttles
    - **Enterprise Free**: Throttles 30 days after expiration
    - **Enterprise Trial**: Throttles 7 days after expiration
    - No license: Throttles 7 days after cluster initialization

Single node clusters for development use are [not throttled](#single-node-clusters).

### Can I use CockroachDB for academic research?

Cockroach Labs encourages non-commercial academic research involving CockroachDB. For such projects, please [contact us][support] to discuss a possible licensing arrangement.

<a name="single-node-clusters"></a>

### Do I need a license key for running a single node cluster?

No license key is required for developers running [single-node clusters]({% link {{ page.version.version }}/cockroach-start-single-node.md %}) using the following [`cockroach` commands]({% link {{ page.version.version }}/cockroach-commands.md %}):

- [`cockroach start-single-node`]({% link {{ page.version.version }}/cockroach-start-single-node.md %})
- [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %})

Single node clusters are not [throttled](#throttling).

## See also

- [CockroachDB Software License][csl]
- [Enterprise support][support]
- <a href="mailto:sales@cockroachlabs.com">Contact Sales</a>

<!-- Reference Links -->

[csl]: https://www.cockroachlabs.com/cockroachdb-software-license
[support]: https://www.cockroachlabs.com/support
[forum]: https://forum.cockroachlabs.com
[slack]: https://www.cockroachlabs.com/join-community
