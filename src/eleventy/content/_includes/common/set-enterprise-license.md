Start the [`cockroach sql` shell]({% link "{{ page.version.version }}/cockroach-sql.md" %}). As the [`root` user]({% link "{{ page.version.version }}/security-reference/authorization.md" %}#root-user), use the [`SET CLUSTER SETTING`]({% link "{{ page.version.version }}/set-cluster-setting.md" %}) statement to set the license key:

~~~ sql
SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx';
~~~

{{site.data.alerts.callout_danger}}
You cannot apply an [**Enterprise Trial** license]({% link "{{ page.version.version }}/licensing-faqs.md" %}#types-of-licenses) more than once to the same cluster.
{{site.data.alerts.end}}
