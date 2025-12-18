To perform major version upgrades, you must have [a valid license key]({% link "{{ page.version.version }}/licensing-faqs.md" %}#obtain-a-license).

Patch version upgrades can be performed without a valid license key, with the following limitations:

- The cluster will run without limitations for a specified grace period. During that time, alerts are displayed that the cluster needs a valid license key. For more information, refer to the [Licensing FAQs]({% link "{{ page.version.version }}/licensing-faqs.md" %}).
- The cluster is [throttled]({% link "{{ page.version.version }}/licensing-faqs.md" %}#throttling) at the end of the grace period if no [valid license key is added to the cluster]({% link "{{ page.version.version }}/licensing-faqs.md" %}#set-a-license) before then.

If you have an **Enterprise Free** or **Enterprise Trial** license, you must enable telemetry using the [`diagnostics.reporting.enabled`]({% link "{{ page.version.version }}/cluster-settings.md" %}#setting-diagnostics-reporting-enabled) cluster setting, as shown below in order to finalize a major version upgrade:

~~~ sql
SET CLUSTER SETTING diagnostics.reporting.enabled = true;
~~~

If a cluster with an **Enterprise Free** or **Enterprise Trial** license is upgraded across patch versions and does not meet telemetry requirements:

- The cluster will run without limitations for a 7-day grace period. During that time, alerts are displayed that the cluster needs to send telemetry.
- The cluster is [throttled]({% link "{{ page.version.version }}/licensing-faqs.md" %}#throttling) if telemetry is not received before the end of the grace period.

For more information, refer to the [Licensing FAQs]({% link "{{ page.version.version }}/licensing-faqs.md" %}).

If you want to stay on the previous version, you can roll back the upgrade before finalization.
