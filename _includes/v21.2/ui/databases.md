## Databases

The **Databases** page shows:

- Whether [automatic statistics collection]({{ link_prefix }}cost-based-optimizer.html#table-statistics) is enabled for the cluster.
- A list of the databases on the cluster.
{% if page.cloud == true %}
- The **Add database** button, which allows you to [create a new database](serverless-cluster-management.html#create-a-database).
{% endif %}

The following information is displayed for each database:

| Column        | Description                                                                                                             |
|---------------|-------------------------------------------------------------------------------------------------------------------------|
| Databases     | The name of the database.                                                                                               |
{% if page.cloud != true  -%}
| Size          | Approximate disk size across all table replicas in the database.                                                        |
{% endif -%}
| Tables        | The number of tables in the database.                                                                                   |
{% if page.cloud != true  -%}
| Range Count   | The number of ranges across all tables in the  database.                                                                |
| Regions/Nodes | The regions and nodes on which the tables in the database are located. This is not displayed on a single-node cluster.  |
{% endif -%}

Click a **database name** to open the **Tables** page.

-  Select **View: Tables** in the pulldown menu to display the [Tables view](#tables-view).
-  Select **View: Grants** in the pulldown menu to display the [Grants view](#grants-view).
