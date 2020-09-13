For this service, the most effective technique for improving read and write latency is to [geo-partition](partitioning.html) the data by city. In essence, this means changing the way data is mapped to ranges. Instead of an entire table and its indexes mapping to a specific range or set of ranges, all rows in the table and its indexes with a given city will map to a range or set of ranges. Once ranges are defined in this way, we can then use the [replication zone](configure-replication-zones.html) feature to pin partitions to specific locations, ensuring that read and write requests from users in a specific city do not have to leave that region.

1. Partitioning is an enterprise feature, so start off by [registering for a 30-day trial license](https://www.cockroachlabs.com/get-cockroachdb/).

2. Once you've received the trial license, SSH to any node in your cluster and [apply the license](enterprise-licensing.html#set-a-license):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING cluster.organization = '<your org name>';"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --host=<address of any node> \
    --execute="SET CLUSTER SETTING enterprise.license = '<your license>';"
    ~~~

3. Define partitions for all tables and their secondary indexes.

    Start with the `users` table:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    Now define partitions for the `vehicles` table and its secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE vehicles \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX vehicles_auto_index_fk_city_ref_users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    Next, define partitions for the `rides` table and its secondary indexes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER TABLE rides \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX rides_auto_index_fk_city_ref_users \
    PARTITION BY LIST (city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="ALTER INDEX rides_auto_index_fk_vehicle_city_ref_vehicles \
    PARTITION BY LIST (vehicle_city) ( \
        PARTITION new_york VALUES IN ('new york'), \
        PARTITION boston VALUES IN ('boston'), \
        PARTITION washington_dc VALUES IN ('washington dc'), \
        PARTITION seattle VALUES IN ('seattle'), \
        PARTITION san_francisco VALUES IN ('san francisco'), \
        PARTITION los_angeles VALUES IN ('los angeles') \
    );"
    ~~~

    Finally, drop an unused index on `rides` rather than partition it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql \
    {{page.certs}} \
    --database=movr \
    --host=<address of any node> \
    --execute="DROP INDEX rides_start_time_idx;"
    ~~~

    {{site.data.alerts.callout_info}}
    The `rides` table contains 1 million rows, so dropping this index will take a few minutes.
    {{site.data.alerts.end}}

7. Now [create replication zones](configure-replication-zones.html#create-a-replication-zone-for-a-partition) to require city data to be stored on specific nodes based on node locality.

    City | Locality
    -----|---------
    New York | `zone=us-east1-b`
    Boston | `zone=us-east1-b`
    Washington DC | `zone=us-east1-b`
    Seattle | `zone=us-west1-a`
    San Francisco | `zone=us-west2-a`
    Los Angeles | `zone=us-west2-a`

    {{site.data.alerts.callout_info}}
    Since our nodes are located in 3 specific GCE zones, we're only going to use the `zone=` portion of node locality. If we were using multiple zones per regions, we would likely use the `region=` portion of the node locality instead.
    {{site.data.alerts.end}}

    Start with the `users` table partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF TABLE movr.users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    Move on to the `vehicles` table and secondary index partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF TABLE movr.vehicles CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF INDEX vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    Finish with the `rides` table and secondary index partitions:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION new_york OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION boston OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION washington_dc OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-east1-b]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION seattle OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-west1-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION san_francisco OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF TABLE movr.rides CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF INDEX rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --execute="ALTER PARTITION los_angeles OF INDEX rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING constraints='[+zone=us-west2-a]';" \
    {{page.certs}} \
    --host=<address of any node>
    ~~~
