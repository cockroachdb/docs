---
title: Performance Tuning
summary: Essential techniques for getting fast reads and writes in a single- and multi-region CockroachDB deployment.
toc: true
certs: --insecure
app: ./tuning.py
---

<div class="filters filters-big clearfix">
  <a href="performance-tuning.html"><button class="filter-button">Secure</button>
  <button class="filter-button current"><strong>Insecure</strong></button></a>
</div>

This tutorial shows you essential techniques for getting fast reads and writes in CockroachDB, starting with a single-region deployment and expanding into multiple regions.

For a comprehensive list of tuning recommendations, only some of which are demonstrated here, see [SQL Performance Best Practices](performance-best-practices-overview.html).

{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}

## Overview

{% include {{ page.version.version }}/performance/overview.md %}

## Single-region deployment

<!-- roachprod instructions for single-region deployment
1. Reserve 12 instances across 3 GCE zone: roachprod create <yourname>-tuning --geo --gce-zones us-east1-b,us-west1-a,us-west2-a --local-ssd -n 12
2. Put cockroach` on all instances:
   - roachprod stage <yourname>-tuning release v2.1.0-beta.20181008
3. Start the cluster in us-east1-b: roachprod start <yourname>-tuning:1-3
4. You'll need the addresses of all instances later, so list and record them somewhere: roachprod list -d <yourname>-tuning
5. Import the Movr dataset:
   - SSH onto instance 4: roachprod run <yourname>-tuning:4
   - Run the SQL commands in Step 4 below.
8. Install the Python client:
   - Still on instance 4, run commands in Step 5 below.
9. Test/tune read performance:
   - Still on instance 4, run commands in Step 6.
10. Test/tune write performance:
   - Still on instance 4, run commands in Step 7.
-->

### Step 1. Configure your network

{% include {{ page.version.version }}/performance/configure-network.md %}

### Step 2. Create instances

You'll start with a 3-node CockroachDB cluster in the `us-east1-b` GCE zone, with an extra instance for running a client application workload.

1. [Create 3 instances](https://cloud.google.com/compute/docs/instances/create-start-instance) for your CockroachDB nodes. While creating each instance:  
    - Select the `us-east1-b` [zone](https://cloud.google.com/compute/docs/regions-zones/).
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - Use the Ubuntu 16.04 OS image.
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create a separate instance for running a client application workload, also in the `us-east1-b` zone. This instance can be smaller, such as `n1-standard-1`.

### Step 3. Start a 3-node cluster

{% include {{ page.version.version }}/performance/start-cluster.md %}

### Step 4. Import the Movr dataset

{% include {{ page.version.version }}/performance/import-movr.md %}

### Step 5. Install the Python client

When measuring SQL performance, it's best to run a given statement multiple times and look at the average and/or cumulative latency. For that purpose, you'll install and use a Python testing client.

1. Still on the fourth instance, make sure all of the system software is up-to-date:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get update && sudo apt-get -y upgrade
    ~~~

2. Install the `psycopg2` driver:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ sudo apt-get install python-psycopg2
    ~~~

3. Download the Python client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ wget https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/{{ page.version.version }}/performance/tuning.py \
    && chmod +x tuning.py
    ~~~

    As you'll see below, this client lets you pass command-line flags:

    Flag | Description
    -----|------------
    `--host` | The IP address of the target node. This is used in the client's connection string.
    `--statement` | The SQL statement to execute.
    `--repeat` | The number of times to repeat the statement. This defaults to 20.

    When run, the client prints the median time in seconds across all repetitions of the statement. Optionally, you can pass two other flags, `--time` to print the execution time in seconds for each repetition of the statement, and `--cumulative` to print the cumulative time in seconds for all repetitions. `--cumulative` is particularly useful when testing writes.

    {{site.data.alerts.callout_success}}
    To get similar help directly in your shell, use `./tuning.py --help`.
    {{site.data.alerts.end}}

### Step 6. Test/tune read performance

- [Filtering by the primary key](#filtering-by-the-primary-key)
- [Filtering by a non-indexed column (full table scan)](#filtering-by-a-non-indexed-column-full-table-scan)
- [Filtering by a secondary index](#filtering-by-a-secondary-index)
- [Filtering by a secondary index storing additional columns](#filtering-by-a-secondary-index-storing-additional-columns)
- [Joining data from different tables](#joining-data-from-different-tables)
- [Using `IN (list)` with a subquery](#using-in-list-with-a-subquery)
- [Using `IN (list)` with explicit values](#using-in-list-with-explicit-values)

#### Filtering by the primary key

Retrieving a single row based on the primary key will usually return in 2ms or less:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM rides WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'vehicle_city', 'rider_id', 'vehicle_id', 'start_address', 'end_address', 'start_time', 'end_time', 'revenue']
['000007ef-fa0f-4a6e-a089-ce74aa8d2276', 'boston', 'boston', 'd66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b', '4081 Conner Courts\nSouth Taylor, VA 86921', '2808 Willis Wells Apt. 931\nMccoyberg, OH 10303-4879', '2018-07-20 01:46:46.003070', '2018-07-20 02:27:46.003070', '44.25']

Times (milliseconds):
[2.1638870239257812, 1.2159347534179688, 1.0809898376464844, 1.0669231414794922, 1.2650489807128906, 1.1401176452636719, 1.1310577392578125, 1.0380744934082031, 1.199960708618164, 1.0530948638916016, 1.1000633239746094, 1.3430118560791016, 1.104116439819336, 1.0750293731689453, 1.0609626770019531, 1.088857650756836, 1.1639595031738281, 1.2559890747070312, 1.1899471282958984, 1.0449886322021484, 1.1057853698730469, 1.127004623413086, 0.9729862213134766, 1.1131763458251953, 1.0879039764404297, 1.119852066040039, 1.065969467163086, 1.0371208190917969, 1.1181831359863281, 1.0409355163574219, 1.0859966278076172, 1.1398792266845703, 1.032114028930664, 1.1000633239746094, 1.1360645294189453, 1.146078109741211, 1.329183578491211, 1.1131763458251953, 1.1548995971679688, 0.9977817535400391, 1.1138916015625, 1.085042953491211, 1.0950565338134766, 1.0869503021240234, 1.0170936584472656, 1.0571479797363281, 1.0640621185302734, 1.1110305786132812, 1.1279582977294922, 1.1119842529296875]

Median time (milliseconds):
1.10495090485
~~~

Retrieving a subset of columns will usually be even faster:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT rider_id, vehicle_id \
FROM rides \
WHERE city = 'boston' AND id = '000007ef-fa0f-4a6e-a089-ce74aa8d2276'" \
--repeat=50 \
--times
~~~

~~~
Result:
['rider_id', 'vehicle_id']
['d66c386d-4b7b-48a7-93e6-f92b5e7916ab', '6628bbbc-00be-4891-bc00-c49f2f16a30b']

Times (milliseconds):
[2.218961715698242, 1.2569427490234375, 1.3570785522460938, 1.1570453643798828, 1.3251304626464844, 1.3320446014404297, 1.0790824890136719, 1.0139942169189453, 1.0251998901367188, 1.1150836944580078, 1.1949539184570312, 1.2140274047851562, 1.2080669403076172, 1.238107681274414, 1.071929931640625, 1.104116439819336, 1.0230541229248047, 1.0571479797363281, 1.0519027709960938, 1.0688304901123047, 1.0118484497070312, 1.0051727294921875, 1.1889934539794922, 1.0571479797363281, 1.177072525024414, 1.0449886322021484, 1.0669231414794922, 1.004934310913086, 0.9818077087402344, 0.9369850158691406, 1.004934310913086, 1.0461807250976562, 1.0628700256347656, 1.1332035064697266, 1.1780261993408203, 1.0361671447753906, 1.1410713195800781, 1.1188983917236328, 1.026153564453125, 0.9629726409912109, 1.0199546813964844, 1.0409355163574219, 1.0440349578857422, 1.1110305786132812, 1.1761188507080078, 1.508951187133789, 1.2068748474121094, 1.3430118560791016, 1.4159679412841797, 1.3141632080078125]

Median time (milliseconds):
1.09159946442
~~~

#### Filtering by a non-indexed column (full table scan)

You'll get generally poor performance when retrieving a single row based on a column that is not in the primary key or any secondary index:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (milliseconds):
[33.271074295043945, 4.4689178466796875, 4.18400764465332, 4.327058792114258, 5.700111389160156, 4.509925842285156, 4.525899887084961, 4.294157028198242, 4.516124725341797, 5.700111389160156, 5.105018615722656, 4.5070648193359375, 4.798173904418945, 5.930900573730469, 4.445075988769531, 4.1790008544921875, 4.065036773681641, 4.296064376831055, 5.722999572753906, 4.827976226806641, 4.640102386474609, 4.374980926513672, 4.269123077392578, 4.422903060913086, 4.110813140869141, 4.091024398803711, 4.189014434814453, 4.345178604125977, 5.600929260253906, 4.827976226806641, 4.416942596435547, 4.424095153808594, 4.736185073852539, 4.462003707885742, 4.307031631469727, 5.10096549987793, 4.56690788269043, 4.641056060791016, 4.701137542724609, 4.538059234619141, 4.474163055419922, 4.561901092529297, 4.431009292602539, 4.756927490234375, 4.54401969909668, 4.415035247802734, 4.396915435791016, 5.9719085693359375, 4.543066024780273, 5.830049514770508]

Median time (milliseconds):
4.51302528381
~~~

To understand why this query performs poorly, use the SQL client built into the `cockroach` binary to [`EXPLAIN`](explain.html) the query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
  tree |    field    |         description
-------+-------------+------------------------------
       | distributed | true
       | vectorized  | false
  scan |             |
       | table       | users@primary
       | spans       | FULL SCAN
       | filter      | name = 'Natalie Cunningham'
(6 rows)
~~~

The row with `spans | FULL SCAN` shows you that, without a secondary index on the `name` column, CockroachDB scans every row of the `users` table, ordered by the primary key (`city`/`id`), until it finds the row with the correct `name` value.

#### Filtering by a secondary index

To speed up this query, add a secondary index on `name`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX on users (name);"
~~~

The query will now return much faster:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT * FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['id', 'city', 'name', 'address', 'credit_card']
['02cc9e5b-1e91-4cdb-87c4-726b4ea7219a', 'boston', 'Natalie Cunningham', '97477 Lee Path\nKimberlyport, CA 65960', '4532613656695680']

Times (milliseconds):
[3.545045852661133, 1.4619827270507812, 1.399993896484375, 2.0101070404052734, 1.672983169555664, 1.4941692352294922, 1.4650821685791016, 1.4579296112060547, 1.567840576171875, 1.5709400177001953, 1.4760494232177734, 1.6181468963623047, 1.6210079193115234, 1.6970634460449219, 1.6469955444335938, 1.7261505126953125, 1.7559528350830078, 1.875162124633789, 1.7170906066894531, 1.870870590209961, 1.641988754272461, 1.7061233520507812, 1.628875732421875, 1.6558170318603516, 1.7809867858886719, 1.6698837280273438, 1.8429756164550781, 1.6090869903564453, 1.7080307006835938, 1.74713134765625, 1.6620159149169922, 1.9519329071044922, 1.6849040985107422, 1.7440319061279297, 1.8851757049560547, 1.8699169158935547, 1.7409324645996094, 1.9140243530273438, 1.7828941345214844, 1.7158985137939453, 1.6720294952392578, 1.7750263214111328, 1.7368793487548828, 1.9288063049316406, 1.8749237060546875, 1.7838478088378906, 1.8091201782226562, 1.8210411071777344, 1.7669200897216797, 1.8210411071777344]

Median time (milliseconds):
1.72162055969
~~~

To understand why performance improved from 4.51ms (without index) to 1.72ms (with index), use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT * FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
     tree    |    field    |                      description
-------------+-------------+--------------------------------------------------------
             | distributed | false
             | vectorized  | false
  index-join |             |
   │         | table       | users@primary
   │         | key columns | city, id
   └── scan  |             |
             | table       | users@users_name_idx
             | spans       | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd
(8 rows)
~~~

This shows you that CockroachDB starts with the secondary index (`table | users@users_name_idx`). Because it is sorted by `name`, the query can jump directly to the relevant value (`spans | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd`). However, the query needs to return values not in the secondary index, so CockroachDB grabs the primary key (`city`/`id`) stored with the `name` value (the primary key is always stored with entries in a secondary index), jumps to that value in the primary index, and then returns the full row.

Thinking back to the [earlier discussion of ranges and leaseholders](#important-concepts), because the `users` table is under 512 MiB, the primary index and all secondary indexes are contained in a single range with a single leaseholder. If the table were bigger, however, the primary index and secondary index could reside in separate ranges, each with its own leaseholder. In this case, if the leaseholders were on different nodes, the query would require more network hops, further increasing latency.

#### Filtering by a secondary index storing additional columns

When you have a query that filters by a specific column but retrieves a subset of the table's total columns, you can improve performance by [storing](indexes.html#storing-columns) those additional columns in the secondary index to prevent the query from needing to scan the primary index as well.

For example, let's say you frequently retrieve a user's name and credit card number:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (milliseconds):
[2.8769969940185547, 1.7559528350830078, 1.8100738525390625, 1.8839836120605469, 1.5971660614013672, 1.5900135040283203, 1.7750263214111328, 2.2847652435302734, 1.641988754272461, 1.4967918395996094, 1.4641284942626953, 1.6689300537109375, 1.9679069519042969, 1.8970966339111328, 1.8780231475830078, 1.7609596252441406, 1.68609619140625, 1.9791126251220703, 1.661062240600586, 1.9869804382324219, 1.5938282012939453, 1.8041133880615234, 1.5909671783447266, 1.5878677368164062, 1.7380714416503906, 1.638174057006836, 1.6970634460449219, 1.9309520721435547, 1.992940902709961, 1.8689632415771484, 1.7511844635009766, 2.007007598876953, 1.9829273223876953, 1.8939971923828125, 1.7490386962890625, 1.6179084777832031, 1.6510486602783203, 1.6078948974609375, 1.6129016876220703, 1.67083740234375, 1.786947250366211, 1.7840862274169922, 1.956939697265625, 1.8689632415771484, 1.9350051879882812, 1.789093017578125, 1.9249916076660156, 1.8649101257324219, 1.9619464874267578, 1.7361640930175781]

Median time (milliseconds):
1.77955627441
~~~

With the current secondary index on `name`, CockroachDB still needs to scan the primary index to get the credit card number:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
     tree    |    field    |                      description
-------------+-------------+--------------------------------------------------------
             | distributed | false
             | vectorized  | false
  index-join |             |
   │         | table       | users@primary
   │         | key columns | city, id
   └── scan  |             |
             | table       | users@users_name_idx
             | spans       | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd
(8 rows)
~~~

Let's drop and recreate the index on `name`, this time storing the `credit_card` value in the index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="DROP INDEX users_name_idx;"
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX ON users (name) STORING (credit_card);"
~~~

Now that `credit_card` values are stored in the index on `name`, CockroachDB only needs to scan that index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham';"
~~~

~~~
  tree |    field    |                      description
-------+-------------+--------------------------------------------------------
       | distributed | false
       | vectorized  | false
  scan |             |
       | table       | users@users_name_idx
       | spans       | /"Natalie Cunningham"-/"Natalie Cunningham"/PrefixEnd
(5 rows)
~~~

This results in even faster performance, reducing latency from 1.77ms (index without storing) to 0.99ms (index with storing):

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT name, credit_card FROM users WHERE name = 'Natalie Cunningham'" \
--repeat=50 \
--times
~~~

~~~
Result:
['name', 'credit_card']
['Natalie Cunningham', '4532613656695680']

Times (milliseconds):
[1.8029212951660156, 0.9858608245849609, 0.9548664093017578, 0.8459091186523438, 0.9710788726806641, 1.1639595031738281, 0.8571147918701172, 0.8800029754638672, 0.8509159088134766, 0.8771419525146484, 1.1739730834960938, 0.9100437164306641, 1.1181831359863281, 0.9679794311523438, 1.0800361633300781, 1.02996826171875, 1.2090206146240234, 1.0440349578857422, 1.210927963256836, 1.0418891906738281, 1.1951923370361328, 0.9548664093017578, 1.0848045349121094, 0.9748935699462891, 1.15203857421875, 1.0280609130859375, 1.0819435119628906, 0.9641647338867188, 1.0979175567626953, 0.9720325469970703, 1.0638236999511719, 0.9410381317138672, 1.0039806365966797, 1.207113265991211, 0.9911060333251953, 1.0039806365966797, 0.9810924530029297, 0.9360313415527344, 0.9589195251464844, 1.0609626770019531, 0.9949207305908203, 1.0139942169189453, 0.9899139404296875, 0.9818077087402344, 0.9679794311523438, 0.8809566497802734, 0.9558200836181641, 0.8878707885742188, 1.0380744934082031, 0.8897781372070312]

Median time (milliseconds):
0.990509986877
~~~

#### Joining data from different tables

Secondary indexes are crucial when [joining](joins.html) data from different tables as well.

For example, let's say you want to count the number of users who started rides on a given day. To do this, you need to use a join to get the relevant rides from the `rides` table and then map the `rider_id` for each of those rides to the corresponding `id` in the `users` table, counting each mapping only once:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=50 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (milliseconds):
[1443.5458183288574, 1546.0000038146973, 1563.858985900879, 1530.3218364715576, 1574.7389793395996, 1572.7760791778564, 1566.4539337158203, 1595.655918121338, 1588.2930755615234, 1567.6488876342773, 1564.5530223846436, 1573.4570026397705, 1581.406831741333, 1587.864875793457, 1575.7901668548584, 1565.0341510772705, 1519.8209285736084, 1599.7698307037354, 1612.4188899993896, 1582.5250148773193, 1604.076862335205, 1596.8739986419678, 1569.6821212768555, 1583.7080478668213, 1549.9720573425293, 1563.5790824890137, 1555.6750297546387, 1577.6000022888184, 1582.3569297790527, 1568.8848495483398, 1580.854892730713, 1566.9701099395752, 1578.8500308990479, 1592.677116394043, 1549.3559837341309, 1561.805009841919, 1561.812162399292, 1543.4870719909668, 1523.3290195465088, 1583.9049816131592, 1565.9120082855225, 1575.1979351043701, 1581.1400413513184, 1616.6048049926758, 1602.9179096221924, 1583.8429927825928, 1570.2300071716309, 1573.2421875, 1558.588981628418, 1548.7489700317383]

Median time (milliseconds):
1573.00913334
~~~

To understand what's happening, use [`EXPLAIN`](explain.html) to see the query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00';"
~~~

~~~
         tree         |    field    |                                         description
----------------------+-------------+----------------------------------------------------------------------------------------------
                      | distributed | true
                      | vectorized  | false
  group               |             |
   │                  | aggregate 0 | count(DISTINCT id)
   │                  | scalar      |
   └── render         |             |
        └── hash-join |             |
             │        | type        | inner
             │        | equality    | (rider_id) = (id)
             ├── scan |             |
             │        | table       | rides@primary
             │        | spans       | FULL SCAN
             │        | filter      | (start_time >= '2018-07-20 00:00:00+00:00') AND (start_time <= '2018-07-21 00:00:00+00:00')
             └── scan |             |
                      | table       | users@users_name_idx
                      | spans       | FULL SCAN
(16 rows)
~~~

Reading from bottom up, you can see that CockroachDB does a full table scan (`spans | FULL SCAN`) first on `rides` to get all rows with a `start_time` in the specified range and then does another full table scan on `users` to find matching rows and calculate the count.

Given that the `rides` table is large, its data is split across several ranges. Each range is replicated and has a leaseholder. At least some of these leaseholders are likely located on different nodes. This means that the full table scan of `rides` involves several network hops to various leaseholders before finally going to the leaseholder for `users` to do a full table scan there.

To track this specifically, let's use the [`SHOW RANGES`](show-ranges.html) statement to find out where the relevant leaseholders reside for `rides` and `users`:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW RANGES FROM TABLE rides;"
~~~

~~~
                           start_key                           |                           end_key                            | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+--------------------------------------------------------------+--------------------------------------------------------------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL                                                         | /"boston"/"\x00\x00\a\xef\xfa\x0fJn\xa0\x89\xcet\xaa\x8d\"v" |       33 |             0 |            2 | region=us-central1    | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /"boston"/"\x00\x00\a\xef\xfa\x0fJn\xa0\x89\xcet\xaa\x8d\"v" | /"boston"/"\x99\xf4ff\xbb1K\xf9\xab\x92\x83\x003(o\x8a"      |       41 |     21.520739 |            2 | region=us-central1    | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /"boston"/"\x99\xf4ff\xbb1K\xf9\xab\x92\x83\x003(o\x8a"      | /"los angeles"/"3\ncK{?Oħ\x9e\xf0k\x96\xba\xad\xf2"          |       37 |     21.850083 |            3 | region=us-west1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /"los angeles"/"3\ncK{?Oħ\x9e\xf0k\x96\xba\xad\xf2"          | /"new york"/"\xb3\xb4:#\x1f\x8aDݘ\xc9SC\a5*\xd4"             |       39 |     55.677376 |            3 | region=us-west1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /"new york"/"\xb3\xb4:#\x1f\x8aDݘ\xc9SC\a5*\xd4"             | /"seattle"/"x\x15\xaa\x84\xc73Im\xa2\xbf\n\x81$\xcf\xf6\xda" |       55 |     66.072353 |            3 | region=us-west1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /"seattle"/"x\x15\xaa\x84\xc73Im\xa2\xbf\n\x81$\xcf\xf6\xda" | NULL                                                         |       38 |     57.403476 |            2 | region=us-central1    | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
(6 rows)
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW RANGES FROM TABLE users;"
~~~

~~~
  start_key | end_key | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-----------+---------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL      | NULL    |       26 |      0.267026 |            3 | region=us-west1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
(1 row)
~~~

The results above tell us:

- The `rides` table is split across 6 ranges, with leaseholders on nodes 2 and 3.
- The `users` table is stored in just a single range with its leaseholder on node 3.

Now, given the `WHERE` condition of the join, the full table scan of `rides`, across all of its 6 ranges, is particularly wasteful. To speed up the query, you can create a secondary index on the `WHERE` condition (`rides.start_time`) storing the join key (`rides.rider_id`):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="CREATE INDEX ON rides (start_time) STORING (rider_id);"
~~~

Adding the secondary index reduced the query time from 1573ms to 61.56ms:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00'" \
--repeat=50 \
--times
~~~

~~~
Result:
['count']
['1998']

Times (milliseconds):
[66.78199768066406, 63.83800506591797, 65.57297706604004, 63.04502487182617, 61.54489517211914, 61.51890754699707, 60.935020446777344, 61.8891716003418, 60.71019172668457, 64.44311141967773, 64.82601165771484, 61.5849494934082, 62.136173248291016, 62.78491020202637, 62.70194053649902, 61.837196350097656, 64.13102149963379, 62.66903877258301, 71.14315032958984, 61.08808517456055, 58.36200714111328, 60.003042221069336, 58.743953704833984, 59.05413627624512, 60.63103675842285, 60.12582778930664, 61.02705001831055, 62.548160552978516, 61.45000457763672, 65.27113914489746, 60.18996238708496, 59.36002731323242, 60.13298034667969, 59.8299503326416, 59.168100357055664, 65.20915031433105, 60.43219566345215, 58.91895294189453, 58.67791175842285, 59.50117111206055, 59.977054595947266, 65.39011001586914, 62.3931884765625, 69.40793991088867, 61.64288520812988, 66.52498245239258, 69.78988647460938, 60.96601486206055, 57.71303176879883, 61.81192398071289]

Median time (milliseconds):
61.5649223328
~~~

To understand why performance improved, again use [`EXPLAIN`](explain.html) to see the new query plan:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT count(DISTINCT users.id) \
FROM users \
INNER JOIN rides ON rides.rider_id = users.id \
WHERE start_time BETWEEN '2018-07-20 00:00:00' AND '2018-07-21 00:00:00';"
~~~

~~~
         tree         |    field    |                      description
----------------------+-------------+--------------------------------------------------------
                      | distributed | true
                      | vectorized  | false
  group               |             |
   │                  | aggregate 0 | count(DISTINCT id)
   │                  | scalar      |
   └── render         |             |
        └── hash-join |             |
             │        | type        | inner
             │        | equality    | (rider_id) = (id)
             ├── scan |             |
             │        | table       | rides@rides_start_time_idx
             │        | spans       | /2018-07-20T00:00:00Z-/2018-07-21T00:00:00.000000001Z
             └── scan |             |
                      | table       | users@users_name_idx
                      | spans       | FULL SCAN
(15 rows)
~~~

Notice that CockroachDB now starts by using `rides@rides_start_time_idx` secondary index to retrieve the relevant rides without needing to scan the full `rides` table.

Let's check the ranges for the new index:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW RANGES FROM INDEX rides@rides_start_time_idx;"
~~~

~~~
                                          start_key                                         |                                          end_key                                          | range_id | range_size_mb | lease_holder | lease_holder_locality | replicas |                  replica_localities
+-------------------------------------------------------------------------------------------+-------------------------------------------------------------------------------------------+----------+---------------+--------------+-----------------------+----------+------------------------------------------------------+
  NULL                                                                                      | /2018-07-03T01:30:40.141401Z/"new york"/"4v\xc5HJ\xf0Bս\xcb\x1f\xab\xe4\xd9y\x02"         |       43 |             0 |            1 | region=us-east1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /2018-07-03T01:30:40.141401Z/"new york"/"4v\xc5HJ\xf0Bս\xcb\x1f\xab\xe4\xd9y\x02"         | /2018-07-03T01:41:59.820666Z/"boston"/"\x8fX\xce\x02c\xb5O\x95\x81\x9d\xee\xa9D<\xb6\x03" |       45 |      0.431928 |            2 | region=us-central1    | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /2018-07-03T01:41:59.820666Z/"boston"/"\x8fX\xce\x02c\xb5O\x95\x81\x9d\xee\xa9D<\xb6\x03" | /2018-07-16T01:33:31.787252Z/"new york"/"\xb1\xbb\xc0\x98\xe1\xee@\"\xbayd\x0f\x02i\x18l" |       44 |     33.554432 |            1 | region=us-east1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
  /2018-07-16T01:33:31.787252Z/"new york"/"\xb1\xbb\xc0\x98\xe1\xee@\"\xbayd\x0f\x02i\x18l" | NULL                                                                                      |       46 |     46.717599 |            1 | region=us-east1       | {1,2,3}  | {region=us-east1,region=us-central1,region=us-west1}
(4 rows)
~~~

This tells us that the index is stored in 4 ranges, with the leaseholders on nodes 1 and 2. Based on the output of `SHOW RANGES FROM TABLE users` that we saw earlier, we already know that the leaseholder for the `users` table is on node 3.

#### Using `IN (list)` with a subquery

Now let's say you want to get the latest ride of each of the 5 most used vehicles. To do this, you might think to use a subquery to get the IDs of the 5 most frequent vehicles from the `rides` table, passing the results into the `IN` list of another query to get the most recent ride of each of the 5 vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
    SELECT vehicle_id \
    FROM rides \
    GROUP BY vehicle_id \
    ORDER BY count(*) DESC \
    LIMIT 5 \
) \
GROUP BY vehicle_id" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id', 'max']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62', '2018-08-02 03:06:31.293184']
['0962cdca-9d85-457c-9616-cc2ae2d32008', '2018-08-02 03:01:25.414512']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', '2018-08-02 02:47:43.755989']
['c6541da5-9858-4e3f-9b49-992e206d2c50', '2018-08-02 02:14:50.543760']
['35752c4c-b878-4436-8330-8d7246406a55', '2018-08-02 03:08:49.823209']

Times (milliseconds):
[3012.6540660858154, 2456.5110206604004, 2482.675075531006, 2488.3930683135986, 2474.393129348755, 2494.3790435791016, 2504.063129425049, 2491.326093673706, 2507.4589252471924, 2482.077121734619, 2495.9230422973633, 2497.60103225708, 2478.4271717071533, 2496.574878692627, 2506.395101547241, 2468.4300422668457, 2476.508140563965, 2497.958183288574, 2480.7958602905273, 2484.0168952941895]

Median time (milliseconds):
2489.85958099
~~~

However, as you can see, this query is slow because, currently, when the `WHERE` condition of a query comes from the result of a subquery, CockroachDB scans the entire table, even if there is an available index. Use `EXPLAIN` to see this in more detail:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="EXPLAIN SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
    SELECT vehicle_id \
    FROM rides \
    GROUP BY vehicle_id \
    ORDER BY count(*) DESC \
    LIMIT 5 \
) \
GROUP BY vehicle_id;"
~~~

~~~
              tree              |       field        |                     description
--------------------------------+--------------------+------------------------------------------------------
                                | distributed        | true
                                | vectorized         | false
  group                         |                    |
   │                            | aggregate 0        | vehicle_id
   │                            | aggregate 1        | max(end_time)
   │                            | group by           | vehicle_id
   └── hash-join                |                    |
        │                       | type               | semi
        │                       | equality           | (vehicle_id) = (vehicle_id)
        │                       | right cols are key |
        ├── scan                |                    |
        │                       | table              | rides@primary
        │                       | spans              | FULL SCAN
        └── limit               |                    |
             │                  | count              | 5
             └── sort           |                    |
                  │             | order              | -count_rows
                  └── group     |                    |
                       │        | aggregate 0        | vehicle_id
                       │        | aggregate 1        | count_rows()
                       │        | group by           | vehicle_id
                       └── scan |                    |
                                | table              | rides@rides_auto_index_fk_vehicle_city_ref_vehicles
                                | spans              | FULL SCAN
(24 rows)
~~~

This is a complex query plan, but the important thing to note is the full table scan of `rides@primary` above the `subquery`. This shows you that, after the subquery returns the IDs of the top 5 vehicles, CockroachDB scans the entire primary index to find the rows with `max(end_time)` for each `vehicle_id`, although you might expect CockroachDB to more efficiently use the secondary index on `vehicle_id` (CockroachDB is working to remove this limitation in a future version).

#### Using `IN (list)` with explicit values

Because CockroachDB will not use an available secondary index when using `IN (list)` with a subquery, it's much more performant to have your application first select the top 5 vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id \
FROM rides \
GROUP BY vehicle_id \
ORDER BY count(*) DESC \
LIMIT 5" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id']
['35752c4c-b878-4436-8330-8d7246406a55']
['0962cdca-9d85-457c-9616-cc2ae2d32008']
['c6541da5-9858-4e3f-9b49-992e206d2c50']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62']

Times (milliseconds):
[1049.2329597473145, 1038.0151271820068, 1037.7991199493408, 1036.5591049194336, 1037.7249717712402, 1040.544033050537, 1022.7780342102051, 1056.9651126861572, 1054.3549060821533, 1042.3550605773926, 1042.68217086792, 1031.7370891571045, 1051.880121231079, 1035.8471870422363, 1035.2818965911865, 1035.607099533081, 1040.0230884552002, 1048.8879680633545, 1056.014060974121, 1036.1089706420898]

Median time (milliseconds):
1039.01910782
~~~

And then put the results into the `IN` list to get the most recent rides of the vehicles:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT vehicle_id, max(end_time) \
FROM rides \
WHERE vehicle_id IN ( \
  '35752c4c-b878-4436-8330-8d7246406a55', \
  '0962cdca-9d85-457c-9616-cc2ae2d32008', \
  'c6541da5-9858-4e3f-9b49-992e206d2c50', \
  '78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', \
  '3c950d36-c2b8-48d0-87d3-e0d6f570af62' \
) \
GROUP BY vehicle_id;" \
--repeat=20 \
--times
~~~

~~~
Result:
['vehicle_id', 'max']
['35752c4c-b878-4436-8330-8d7246406a55', '2018-08-02 03:08:49.823209']
['0962cdca-9d85-457c-9616-cc2ae2d32008', '2018-08-02 03:01:25.414512']
['3c950d36-c2b8-48d0-87d3-e0d6f570af62', '2018-08-02 03:06:31.293184']
['78fdd6f8-c6a1-42df-a89f-cd65b7bb8be9', '2018-08-02 02:47:43.755989']
['c6541da5-9858-4e3f-9b49-992e206d2c50', '2018-08-02 02:14:50.543760']

Times (milliseconds):
[1165.5981540679932, 1135.9851360321045, 1201.0550498962402, 1135.0820064544678, 1195.7061290740967, 1132.0109367370605, 1134.9878311157227, 1175.88210105896, 1174.0548610687256, 1152.566909790039, 1164.9351119995117, 1175.5108833312988, 1161.651849746704, 1195.3318119049072, 1162.4629497528076, 1156.1191082000732, 1127.0110607147217, 1165.4651165008545, 1159.6789360046387, 1190.3491020202637]

Median time (milliseconds):
1163.69903088
~~~

This approach reduced the query time from 2489.85ms (query with subquery) to 2202.70ms (2 distinct queries).

### Step 7. Test/tune write performance

- [Bulk inserting into an existing table](#bulk-inserting-into-an-existing-table)
- [Minimizing unused indexes](#minimizing-unused-indexes)
- [Retrieving the ID of a newly inserted row](#retrieving-the-id-of-a-newly-inserted-row)

#### Bulk inserting into an existing table

Moving on to writes, let's imagine that you have a batch of 100 new users to insert into the `users` table. The most obvious approach is to insert each row using 100 separate [`INSERT`](insert.html) statements:  

{{site.data.alerts.callout_info}}
For the purpose of demonstration, the command below inserts the same user 100 times, each time with a different unique ID. Note also that you're now adding the `--cumulative` flag to print the total time across all 100 inserts.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=100 \
--times \
--cumulative
~~~

~~~
Times (milliseconds):
[10.773181915283203, 12.186050415039062, 9.711980819702148, 9.730815887451172, 10.200977325439453, 9.32002067565918, 9.002923965454102, 9.426116943359375, 9.312152862548828, 8.329153060913086, 9.626150131225586, 8.965015411376953, 9.562969207763672, 9.305000305175781, 9.34910774230957, 7.394075393676758, 9.3231201171875, 9.066104888916016, 8.419036865234375, 9.158134460449219, 9.278059005737305, 8.022069931030273, 8.542060852050781, 9.237051010131836, 8.165121078491211, 8.094072341918945, 8.025884628295898, 8.04591178894043, 9.728193283081055, 8.485078811645508, 7.967948913574219, 9.319067001342773, 8.099079132080078, 9.041070938110352, 10.046005249023438, 10.684013366699219, 9.672880172729492, 8.129119873046875, 8.10098648071289, 7.884979248046875, 9.484052658081055, 8.594036102294922, 9.479045867919922, 9.239912033081055, 9.16600227355957, 9.155988693237305, 9.392976760864258, 11.08694076538086, 9.402990341186523, 8.034944534301758, 8.053064346313477, 8.03995132446289, 8.891820907592773, 8.054971694946289, 8.903980255126953, 9.057998657226562, 9.713888168334961, 7.99107551574707, 8.114814758300781, 8.677959442138672, 11.178970336914062, 9.272098541259766, 9.281158447265625, 8.177995681762695, 9.47880744934082, 10.025978088378906, 8.352041244506836, 8.320808410644531, 10.892868041992188, 8.227825164794922, 8.220911026000977, 9.625911712646484, 10.272026062011719, 8.116960525512695, 10.786771774291992, 9.073972702026367, 9.686946868896484, 9.903192520141602, 9.887933731079102, 9.399890899658203, 9.413003921508789, 8.594036102294922, 8.433103561401367, 9.271860122680664, 8.529901504516602, 9.474992752075195, 9.005069732666016, 9.341001510620117, 9.388923645019531, 9.775876998901367, 8.558988571166992, 9.613990783691406, 8.897066116333008, 8.642911911010742, 9.527206420898438, 8.274078369140625, 9.073972702026367, 9.637832641601562, 8.516788482666016, 9.564876556396484]

Median time (milliseconds):
9.20152664185

Cumulative time (milliseconds):
910.985708237
~~~

The 100 inserts took 910.98ms to complete, which isn't bad. However, it's significantly faster to use a single `INSERT` statement with 100 comma-separated `VALUES` clauses:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), \
(gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347'), (gen_random_uuid(), 'new york', 'Max Roach', '411 Drum Street', '173635282937347')" \
--repeat=1 \
--cumulative
~~~

~~~
Median time (milliseconds):
15.4001712799

Cumulative time (milliseconds):
15.4001712799
~~~

As you can see, this multi-row `INSERT` technique reduced the total time for 100 inserts from 910.98ms to 15.40ms. It's useful to note that this technique is equally effective for [`UPSERT`](upsert.html) and [`DELETE`](delete.html) statements as well.

{{site.data.alerts.callout_info}}
You can also use the [`IMPORT INTO`](import-into.html) statement to bulk-insert CSV data into an existing table.
{{site.data.alerts.end}}

#### Minimizing unused indexes

Earlier, we saw how important secondary indexes are for read performance. For writes, however, it's important to recognized the overhead that they create.

Let's consider the `users` table:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="SHOW INDEXES FROM users;"
~~~

~~~
  table_name |   index_name   | non_unique | seq_in_index | column_name | direction | storing | implicit
+------------+----------------+------------+--------------+-------------+-----------+---------+----------+
  users      | primary        |   false    |            1 | city        | ASC       |  false  |  false
  users      | primary        |   false    |            2 | id          | ASC       |  false  |  false
  users      | users_name_idx |    true    |            1 | name        | ASC       |  false  |  false
  users      | users_name_idx |    true    |            2 | credit_card | N/A       |  true   |  false
  users      | users_name_idx |    true    |            3 | city        | ASC       |  false  |   true
  users      | users_name_idx |    true    |            4 | id          | ASC       |  false  |   true
(6 rows)
~~~

This table has the primary index (the full table) and a secondary index on `name` that is also storing `credit_card`. This means that whenever a row is inserted, or whenever `name`, `credit_card`, `city`, or `id` are modified in existing rows, both indexes are updated.

To make this more concrete, let's count how many rows have a name that starts with `C` and then update those rows to all have the same name:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT count(*) \
FROM users \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
['count']
['179']

Median time (milliseconds):
2.52604484558
~~~

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Carl Kimball' \
WHERE name LIKE 'C%'" \
--repeat=1
~~~

~~~
Median time (milliseconds):
52.2060394287
~~~

Because `name` is in both the `primary` and `users_name_idx` indexes, for each of the 168 rows, 2 keys were updated.

Now, assuming that the `users_name_idx` index is no longer needed, lets drop the index and execute an equivalent query:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql \
--insecure \
--host=<address of any node> \
--database=movr \
--execute="DROP INDEX users_name_idx;"
~~~

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="UPDATE users \
SET name = 'Peedie Hirata' \
WHERE name = 'Carl Kimball'" \
--repeat=1
~~~

~~~
Median time (milliseconds):
22.7289199829
~~~

Before, when both the primary and secondary indexes needed to be updated, the updates took 52.20ms. Now, after dropping the secondary index, an equivalent update took only 22.72ms.

#### Retrieving the ID of a newly inserted row

Now let's focus on the common case of inserting a row into a table and then retrieving the ID of the new row to do some follow-up work. One approach is to execute two statements, an `INSERT` to insert the row and then a `SELECT` to get the new ID:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Toni Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960')" \
--repeat=1
~~~

~~~
Median time (milliseconds):
10.4398727417
~~~

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="SELECT id FROM users WHERE name = 'Toni Brooks'" \
--repeat=1
~~~

~~~
Result:
['id']
['ae563e17-ad59-4307-a99e-191e682b4278']

Median time (milliseconds):
5.53798675537
~~~

Combined, these statements are relatively fast, at 15.96ms, but an even more performant approach is to append `RETURNING id` to the end of the `INSERT`:

{% include copy-clipboard.html %}
~~~ shell
$ ./tuning.py \
--host=<address of any node> \
--statement="INSERT INTO users VALUES (gen_random_uuid(), 'new york', 'Brian Brooks', '800 Camden Lane, Brooklyn, NY 11218', '98244843845134960') \
RETURNING id" \
--repeat=1
~~~

~~~
Result:
['id']
['3d16500e-cb2e-462e-9c83-db0965d6deaf']

Median time (milliseconds):
9.48596000671
~~~

At just 9.48ms, this approach is faster due to the write and read executing in one instead of two client-server roundtrips. Note also that, as discussed earlier, if the leaseholder for the table happens to be on a different node than the query is running against, that introduces additional network hops and latency.

<!-- - upsert instead of insert/update
- update using case expressions (instead of 2 separate updates)
- returning nothing
- insert with returning (auto gen ID) instead of select to get auto gen ID
- Maybe interleaved tables -->

## Multi-region deployment

<!-- roachprod instructions for multi-region deployment
You created all instanced up front, so no need to add more now.
1. Start the nodes in us-west1-a: roachprod start -b "/usr/local/bin/cockroach" <yourname>-tuning:5-7
2. Start the nodes in us-west2-a: roachprod start -b "/usr/local/bin/cockroach" <yourname>-tuning:9-11
3. Install the Python client on instance 8:
   - SSH to instance 8: roachprod run <yourname>-tuning:8
   - Run commands in Step 5 above.
4. Install the Python client on instance 12:
   - SSH onto instance 12: roachprod run <yourname>-tuning:12
   - Run commands in Step 5 above.
5. Check rebalancing:
   - SSH to instance 4, 8, or 12.
   - Run `SHOW RANGES` from Step 11 below.
6. Test performance:
   - Run the SQL commands in Step 12 below. You'll need to SSH to instance 8 or 12 as suggested.
7. Partition the data:
   - SSH to any node and run the SQL in Step 13 below.
8. Check rebalancing after partitioning:
   - SSH to instance 4, 8, or 12.
   - Run `SHOW RANGES` from Step 14 below.
8. Test performance after partitioning:
   - Run the SQL commands in Step 15 below. You'll need to SSH to instance 8 or 12 as suggested.
-->

Given that Movr is active on both US coasts, you'll now scale the cluster into two new regions, `us-west1-a` and `us-west2-a`, each with 3 nodes and an extra instance for simulating regional client traffic.

### Step 8. Create more instances

1. [Create 6 more instances](https://cloud.google.com/compute/docs/instances/create-start-instance), 3 in the `us-west1-a` zone (Oregon), and 3 in the `us-west2-a` zone (Los Angeles). While creating each instance:
    - Use the `n1-standard-4` machine type (4 vCPUs, 15 GB memory).
    - Use the Ubuntu 16.04 OS image.
    - [Create and mount a local SSD](https://cloud.google.com/compute/docs/disks/local-ssd#create_local_ssd).
    - To apply the Web UI firewall rule you created earlier, click **Management, disk, networking, SSH keys**, select the **Networking** tab, and then enter `cockroachdb` in the **Network tags** field.

2. Note the internal IP address of each `n1-standard-4` instance. You'll need these addresses when starting the CockroachDB nodes.

3. Create an additional instance in the `us-west1-a` and `us-west2-a` zones. These can be smaller, such as `n1-standard-1`.

### Step 9. Scale the cluster

{% include {{ page.version.version }}/performance/scale-cluster.md %}

### Step 10. Install the Python client

In each of the new zones, SSH to the instance not running a CockroachDB node, and install the Python client as described in [step 5](#step-5-install-the-python-client) above.

### Step 11. Check rebalancing

{% include {{ page.version.version }}/performance/check-rebalancing.md %}

### Step 12. Test performance

{% include {{ page.version.version }}/performance/test-performance.md %}

### Step 13. Partition data by city

{% include {{ page.version.version }}/performance/partition-by-city.md %}

### Step 14. Check rebalancing after partitioning

{% include {{ page.version.version }}/performance/check-rebalancing-after-partitioning.md %}

### Step 15. Test performance after partitioning

{% include {{ page.version.version }}/performance/test-performance-after-partitioning.md %}

## See also

- [SQL Performance Best Practices](performance-best-practices-overview.html)
- [Performance Benchmarking](performance-benchmarking-with-tpcc-small.html)
- [Production Checklist](recommended-production-settings.html)
