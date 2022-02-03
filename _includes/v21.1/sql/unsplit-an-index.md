Add a new secondary [index](indexes.html) to the `rides` table, on the `revenue` column, and then [split](split-at.html) the table ranges by secondary index values:

{% include copy-clipboard.html %}
~~~ sql
> CREATE INDEX revenue_idx ON rides(revenue);
~~~

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx SPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        | pretty |        split_enforced_until
--------------------+--------+--------------------------------------
  \277\214*2\000    | /25    | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*d\000    | /5E+1  | 2262-04-11 23:47:16.854776+00:00:00
  \277\214*\226\000 | /75    | 2262-04-11 23:47:16.854776+00:00:00
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          |        split_enforced_until
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------------------------------
        39 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | NULL
        56 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | 2262-04-11 23:47:16.854776+00:00:00
        55 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | 2262-04-11 23:47:16.854776+00:00:00
        53 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | 2262-04-11 23:47:16.854776+00:00:00
        66 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | 2262-04-11 23:47:16.854776+00:00:00
        52 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | 2262-04-11 23:47:16.854776+00:00:00
        65 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | 2262-04-11 23:47:16.854776+00:00:00
        64 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | 2262-04-11 23:47:16.854776+00:00:00
        54 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 | 2262-04-11 23:47:16.854776+00:00:00
        68 | /Table/55/4                                                                                 | /Table/55/4/25                                                                              | 2021-04-08 16:27:45.201336+00:00:00
        69 | /Table/55/4/25                                                                              | /Table/55/4/5E+1                                                                            | 2262-04-11 23:47:16.854776+00:00:00
        70 | /Table/55/4/5E+1                                                                            | /Table/55/4/75                                                                              | 2262-04-11 23:47:16.854776+00:00:00
        71 | /Table/55/4/75                                                                              | /Table/56                                                                                   | 2262-04-11 23:47:16.854776+00:00:00
(13 rows)
~~~

Now unsplit the index to remove the split enforcements:

{% include copy-clipboard.html %}
~~~ sql
> ALTER INDEX rides@revenue_idx UNSPLIT AT VALUES (25.00), (50.00), (75.00);
~~~
~~~
         key        |      pretty
--------------------+-------------------
  \277\214*2\000    | /Table/55/4/25
  \277\214*d\000    | /Table/55/4/5E+1
  \277\214*\226\000 | /Table/55/4/75
(3 rows)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT range_id, start_pretty, end_pretty, split_enforced_until FROM crdb_internal.ranges WHERE table_name='rides';
~~~
~~~
  range_id |                                        start_pretty                                         |                                         end_pretty                                          |        split_enforced_until
-----------+---------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------+--------------------------------------
        39 | /Table/55                                                                                   | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | NULL
        56 | /Table/55/1/"amsterdam"/"\xc5\x1e\xb8Q\xeb\x85@\x00\x80\x00\x00\x00\x00\x00\x01\x81"        | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | 2262-04-11 23:47:16.854776+00:00:00
        55 | /Table/55/1/"boston"/"8Q\xeb\x85\x1e\xb8B\x00\x80\x00\x00\x00\x00\x00\x00n"                 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | 2262-04-11 23:47:16.854776+00:00:00
        53 | /Table/55/1/"los angeles"/"\xa8\xf5\u008f\\(H\x00\x80\x00\x00\x00\x00\x00\x01J"             | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | 2262-04-11 23:47:16.854776+00:00:00
        66 | /Table/55/1/"new york"/"\x1c(\xf5\u008f\\I\x00\x80\x00\x00\x00\x00\x00\x007"                | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | 2262-04-11 23:47:16.854776+00:00:00
        52 | /Table/55/1/"paris"/"\xe1G\xae\x14z\xe1H\x00\x80\x00\x00\x00\x00\x00\x01\xb8"               | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | 2262-04-11 23:47:16.854776+00:00:00
        65 | /Table/55/1/"san francisco"/"\x8c\xcc\xcc\xcc\xcc\xcc@\x00\x80\x00\x00\x00\x00\x00\x01\x13" | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | 2262-04-11 23:47:16.854776+00:00:00
        64 | /Table/55/1/"seattle"/"p\xa3\xd7\n=pD\x00\x80\x00\x00\x00\x00\x00\x00\xdc"                  | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | 2262-04-11 23:47:16.854776+00:00:00
        54 | /Table/55/1/"washington dc"/"Tz\xe1G\xae\x14L\x00\x80\x00\x00\x00\x00\x00\x00\xa5"          | /Table/55/4                                                                                 | 2262-04-11 23:47:16.854776+00:00:00
        68 | /Table/55/4                                                                                 | /Table/55/4/25                                                                              | 2021-04-08 16:27:45.201336+00:00:00
        69 | /Table/55/4/25                                                                              | /Table/55/4/5E+1                                                                            | NULL
        70 | /Table/55/4/5E+1                                                                            | /Table/55/4/75                                                                              | NULL
        71 | /Table/55/4/75                                                                              | /Table/56                                                                                   | NULL
(13 rows)
~~~

The index is still split into ranges at `25.00`, `50.00`, and `75.00`, but the `split_enforced_until` column is now `NULL` for all ranges in the index. The split is no longer enforced, and CockroachDB can [merge the data](architecture/distribution-layer.html#range-merges) in the index as needed.
