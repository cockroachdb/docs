By default, you may not change the [primary region](alter-database.html#set-primary-region) of a [multi-region database](multiregion-overview.html) when that region is part of a super region. This is a safety setting designed to prevent you from accidentally moving the data for a [regional table](regional-tables.html) that is meant to be stored in the super region out of that super region, which could break your data domiciling setup.

If you are sure about what you are doing, you can allow modifying the primary region by setting the `alter_primary_region_super_region_override` [session setting](set-vars.html) to `'on'`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET alter_primary_region_super_region_override = 'on';
~~~

~~~
SET
~~~

You can also accomplish this by setting the `sql.defaults.alter_primary_region_super_region_override.enable` [cluster setting](cluster-settings.html) to `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SET CLUSTER SETTING  sql.defaults.alter_primary_region_super_region_override.enable = true;
~~~

~~~
SET CLUSTER SETTING
~~~
