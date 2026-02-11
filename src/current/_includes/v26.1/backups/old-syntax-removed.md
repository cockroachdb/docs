{{site.data.alerts.callout_danger}}
The `BACKUP ... TO` and `RESTORE ... FROM {storage_uri}` syntax has been removed from CockroachDB v24.3 and later.

For details on the syntax to run `BACKUP` and `RESTORE`, refer to the {% if page.name == "backup.md" %} [backup](#examples) {% else %} [backup]({% link {{ page.version.version }}/backup.md %}#examples) {% endif %} and {% if page.name == "restore.md" %} [restore](#examples) {% else %} [restore]({% link {{ page.version.version }}/restore.md %}#examples) {% endif %} examples.
{{site.data.alerts.end}}