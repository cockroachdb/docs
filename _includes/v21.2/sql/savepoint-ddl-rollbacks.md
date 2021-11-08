{{site.data.alerts.callout_danger}}
Rollbacks to savepoints over [DDL](https://en.wikipedia.org/wiki/Data_definition_language) statements are only supported if you're rolling back to a savepoint created at the beginning of the transaction.
{{site.data.alerts.end}}
