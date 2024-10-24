During a major-version upgrade, certain features and performance improvements may not be available until the upgrade is finalized.

- A cluster must have an [Enterprise license]({% link {{ page.version.version }}/licensing-faqs.md %}#set-a-license) or a [trial license]({% link {{ page.version.version }}/licensing-faqs.md %}#obtain-a-license) set before an upgrade to {{ page.version.version }} can be finalized.
- Store liveness: TODO {% comment %}https://cockroachlabs.slack.com/archives/C0KB9Q03D/p1729639021209589{% endcomment %}
- New clusters that are initialized for the first time on {{ page.version.version }}, and clusters that are upgraded to {{ page.version.version }} will now have a [zone config]({% link {{ page.version.version }}/configure-zone.md %}) defined for the `timeseries` range if it does not already exist, which specifies the value for `gc.ttlseconds`, but inherits all other attributes from the zone config for the `default` range.
