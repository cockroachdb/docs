1. Find the cluster backup containing the database you want to restore, and click the number in the corresponding **Databases** column.
1. In the **Databases** view, click **Restore** for the database you want to restore.

    The **Restore database** module displays with backup details.

1. In the **Restore to** field, enter the name of the destination database. You can only restore to the same database name as the backed-up database. Therefore, you need to [`DROP`](../{{site.versions["stable"]}}/drop-database.html) or [`RENAME`](../{{site.versions["stable"]}}/rename-database.html) your existing database before restoring. 

    To restore a [multi-region database](../{{site.versions["stable"]}}/multiregion-overview.html) you have backed up to a **different** database name, you can use the following procedure. (In this example, the original, backed-up database is `movr` and the new database is `new_movr`.)

    In the SQL shell, create a new database named `new_movr`: 

    ~~~ sql 
    CREATE DATABASE new_movr;
    ~~~
            
    Add the regions that are in the backup of `movr` to your new database. The [database regions](../{{site.versions["stable"]}}/multiregion-overview.html#database-regions) in your new database **must** match the regions of the backed-up database (`movr` in this example). You must:
    - Ensure the databases have the same primary region.
    - Add the regions to the new database in the same region order as the backed-up database.

    To verify the regions in your backed-up database, use [`SHOW REGIONS`](../{{site.versions["stable"]}}/show-regions.html):

    ~~~sql
    SHOW REGIONS FROM DATABASE movr;
    ~~~

    If the backed-up database has a primary region of `us-east1`, and then you had added `us-west1` followed by `us-west2` to the database, you must add regions to the new database in the same order:  

    ~~~sql 
    ALTER DATABASE new_movr SET PRIMARY REGION "us-east1";
    ~~~
    ~~~sql
    ALTER DATABASE new_movr ADD region "us-west1";
    ~~~
    ~~~sql
    ALTER DATABASE new_movr ADD region "us-west2";
    ~~~

1. From the Console, go to the **Backups** page:
    1. Choose the backup you want to restore.
    1. Click on the number of tables in the database. You will find a list of all the tables contained in the database's backup.
    1. Click **Restore** for each table you want to restore into the new database.
    1. Provide the new database's name (e.g., `new_movr`) in **Restore to** for the **Destination database** name.

    For more detail on "matching" regions, see [Restoring to multi-region databases](../{{site.versions["stable"]}}/restore.html#restoring-to-multi-region-databases).

1. Select any of the **Dependency options** to skip. You can:
    - **Skip missing foreign keys**, which will remove missing [foreign key](../{{site.versions["stable"]}}/foreign-key.html) constraints (i.e., when the referenced table is not in the backup or is not being restored) before restoring.
    - **Skip missing sequences**, which will ignore [sequence](../{{site.versions["stable"]}}/show-sequences.html) dependencies (i.e., the `DEFAULT` expression that uses the sequence).
    - **Skip missing views**, which will skip restoring [views](../{{site.versions["stable"]}}/views.html) that cannot be restored because their dependencies are not being restored at the same time.

1. Click **Continue**
1. Once you have reviewed the restore details, click **Restore**.

   When the restore job has been created successfully, you will be taken to the **Restore Jobs** tab, which will show you the status of your restore.

When the restore is complete, be sure to set any database-specific [zone configurations](../{{site.versions["stable"]}}/configure-replication-zones.html) and, if applicable, [grant privileges](../{{site.versions["stable"]}}/grant.html).