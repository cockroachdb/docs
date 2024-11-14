During a major-version upgrade, certain features and performance improvements may not be available until the upgrade is finalized.

- A cluster must have an [Enterprise license]({% link v24.3/licensing-faqs.md %}#set-a-license) or a [trial license]({% link v24.3/licensing-faqs.md %}#obtain-a-license) set before an upgrade to {{ page.version.version }} can be finalized.
- New clusters that are initialized for the first time on v24.3, and clusters that are upgraded to v24.3 will now have a [zone config]({% link v24.3/configure-zone.md %}) defined for the `timeseries` range if it does not already exist, which specifies the value for `gc.ttlseconds`, but inherits all other attributes from the zone config for the `default` range.
