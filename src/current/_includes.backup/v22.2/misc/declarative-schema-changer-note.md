{{site.data.alerts.callout_danger}}
`{{ page.title }}` now uses the [declarative schema changer](online-schema-changes.html#declarative-schema-changer) by default. Declarative schema changer statements and legacy schema changer statements operating on the same objects cannot exist within the same transaction. Either split the transaction into multiple transactions, or disable either the `sql.defaults.use_declarative_schema_changer` [cluster setting](cluster-settings.html) or the `use_declarative_schema_changer` [session variable](set-vars.html).
{{site.data.alerts.end}}
