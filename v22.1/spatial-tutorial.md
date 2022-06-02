---
title: Spatial Data
summary: Tutorial for working with spatial data in CockroachDB.
toc: true
toc_not_nested: true
docs_area: deploy
---

In this tutorial, you will plan a vacation from New York City to the [Adirondack Mountains](https://visitadirondacks.com/about) in northern New York State to do some birdwatching while visiting local independent bookstores. In the process, you will explore several of CockroachDB's [spatial capabilities](spatial-features.html):

+ Importing spatial data from SQL files (including how to build spatial geometries from data in CSV files).
+ Putting together separate spatial data sets to ask and answer potentially interesting questions.
+ Using various [built-in functions](functions-and-operators.html#spatial-functions) for operating on spatial data.
+ Creating [indexes](spatial-indexes.html) on spatial data.
+ Performing [joins](joins.html) on spatial data, and using [`EXPLAIN`](explain.html) to make sure indexes are effective.
+ Visualizing the output of your queries using free tools like <https://geojson.io>

<div class="clearfix">
  <a class="btn btn-outline-primary" href="../tutorials/demo-spatial-tutorial-interactive.html" target="_blank" rel="noopener">Run this in your browser &rarr;</a>
</div>

## Step 1. Review the scenario

You live in New York City and are an avid birdwatcher and reader of books. You are going on a vacation up to the [Adirondack Mountains](https://visitadirondacks.com/about) in northern New York State. Although you are interested in many bird species, you are most interested in seeing (and [hearing](https://macaulaylibrary.org/asset/107964)) the <a href="https://ebird.org/species/comloo" data-proofer-ignore>Common Loon</a>, a bird that can be found near the lakes and ponds of the north woods.

As a connoisseur of bookstores, you also want to make sure to visit as many of the local independent bookstores as possible on your trip, as long as they are nearby to Loon habitat.

Therefore, in order to plan your vacation trip effectively and optimize for having the most fun, you want to make sure to visit:

+ Loon habitat (at minimum -- ideally you would like to go on the "hunt" for other interesting bird species).
+ Independent bookstores that are located within the approximate home range of the loon.

To accomplish the above, you have put together a data set that consists of what are normally several different data sets, namely:

+ NY State bird sighting data from the years 2000-2019, taken from the [North American Breeding Bird Survey (NABBS)](https://www.sciencebase.gov/catalog/item/52b1dfa8e4b0d9b325230cd9). The full survey covers the US and Canada from the years 1966-2019 and is very large, so you have decided to import just the recent NY data since that is all you need to plan your trip.

+ Road data from the [US National Atlas - Major Roads of the United States](https://www.sciencebase.gov/catalog/item/581d052be4b08da350d524ce) data set. This consists of a full road map of the United States. It was last modified in 2016, so it should be reasonably accurate.

+ Bookstore information (name, address, website, etc.) you scraped from the [American Booksellers Association website's member directory](https://bookweb.org/member_directory/search/ABAmember).

For more information about how this data set is put together, see the [Data set description](#data-set-description).

## Step 2. Start CockroachDB

This tutorial can be accomplished in any CockroachDB cluster running [v20.2](../releases/v20.2.html#v20-2-0) or later.

The simplest way to get up and running is with [`cockroach demo`](cockroach-demo.html), which starts a temporary, in-memory CockroachDB cluster and opens an interactive SQL shell:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

You will see a [SQL client prompt](cockroach-sql.html) that looks like the one shown below. You will use this prompt for the rest of the tutorial.

~~~
root@127.0.0.1:34839/movr>
~~~

## Step 3. Load the data set

1. Create a `tutorial` database, and use it.

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE tutorial;
    USE tutorial;
    ~~~

2. [`IMPORT`](import.html) the parts of [the data set](#data-set-description) that live in the `tutorial` database.

    {% include copy-clipboard.html %}
    ~~~ sql
    IMPORT PGDUMP ('https://spatial-tutorial.s3.us-east-2.amazonaws.com/bookstores-and-roads-20210125.sql') WITH ignore_unsupported_statements;
    ~~~

    ~~~
            job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
    ---------------------+-----------+--------------------+--------+---------------+-----------
      629565276454256641 | succeeded |                  1 | 228807 |             0 | 75952972
    (1 row)

    Time: 17.745s total (execution 17.744s / network 0.000s)
    ~~~

3. Create a `birds` database, and use it.

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE birds;
    USE birds;
    ~~~

4. [`IMPORT`](import.html) the parts of [the data set](#data-set-description) that live in the `birds` database.

    {% include copy-clipboard.html %}
    ~~~ sql
    IMPORT PGDUMP ('https://spatial-tutorial.s3.us-east-2.amazonaws.com/birds-20210125.sql') WITH ignore_unsupported_statements;
    ~~~

    ~~~
            job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
    ---------------------+-----------+--------------------+-------+---------------+----------
      629565605599412225 | succeeded |                  1 | 86616 |             0 | 4096847
    (1 row)
    ~~~

5. Switch back to the `tutorial` database. All of the queries in this tutorial assume you are in the `tutorial` database.

    {% include copy-clipboard.html %}
    ~~~ sql
    USE tutorial;
    ~~~

## Step 4. Scout loon locations

### (1) Where has the Common Loon been sighted by the NABBS in the years 2000-2019 in NY state?

As a first step, you'd like to know where exactly the Common Loon has been sighted in New York State. You know that many of the loon sightings will have taken place in the Adirondacks (our overall destination) due to the nature of the loon's preferred habitat of northern lakes and ponds, but it will be useful to know the precise locations for trip planning, and for asking further related questions about other bird habitats as well as nearby bookstores you'd like to visit.

Because of the structure of [the `birds` database](#the-birds-database), you will wrap the results of a [subquery](subqueries.html) against the `birds` database in a [common table expression (CTE)](common-table-expressions.html) to provide a shorthand name for referring to this data. This step will be necessary every time you want to get information about bird sightings. Therefore, the general pattern for many of these queries will be something like:

1. Get bird information (usually including location data) and store the results in a named CTE.
2. Using the named CTE, perform additional processing against the results of the CTE combined with other data you have (e.g., bookstores, roads). Depending on the complexity of the questions asked, you may even need to create multiple CTEs.

In the query below, to answer the question "where are the loons?", take the following steps:

1. Join `birds.birds`, `birds.routes`, and `birds.observations` on the bird ID and route IDs where the bird name is "Common Loon".
2. Collect the resulting birdwatcher route geometries (`routes.geom`) into one geometry (a [MultiPoint](multipoint.html)).
3. Give the resulting table a name, `loon_sightings`, and query against it. In this case the query is rather simple: since the geometries have been collected into one in step 2 above, output the geometry as [GeoJSON](geojson.html) so the result can be pasted into <https://geojson.io> to generate a map of the sightings.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_sightings
		AS (
			SELECT
				st_collect(routes.geom) AS the_geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	st_asgeojson(the_geom)
FROM
	loon_sightings;
~~~

~~~
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        st_asgeojson
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  {"type":"MultiPoint","coordinates":[[-75.078218,43.662991],[-75.078218,43.662991],[-75.078218,43.662991],[-75.078218,43.662991],[-75.078218,43.662991],[-75.078218,43.662991],[-75.078218,43.662991],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.389678,43.652701],[-74.9492509,43.6625207],[-74.473788,43.726581],[-74.473788,43.726581],[-74.473788,43.726581],[-74.234828,43.971271],[-74.234828,43.971271],[-74.234828,43.971271],[-74.234828,43.971271],[-74.234828,43.971271],[-74.234828,43.971271],[-74.3975289,43.5654587],[-74.3975289,43.5654587],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.7918689,43.7217467],[-74.0622389,43.6884937],[-74.0622389,43.6884937],[-73.7371009,43.6098217],[-75.0557089,44.4354227],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.9230359,44.1319167],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.1807169,44.4319917],[-74.7210849,44.5376687],[-74.7210849,44.5376687],[-74.7210849,44.5376687],[-73.4887779,44.4433387],[-73.4887779,44.4433387],[-75.7014799,44.1487467],[-75.7014799,44.1487467],[-75.7014799,44.1487467],[-75.7014799,44.1487467],[-75.7014799,44.1487467],[-74.9852279,42.0781957],[-74.9852279,42.0781957],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.966888,43.679941],[-74.492148,44.522881],[-74.492148,44.522881],[-74.492148,44.522881],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587],[-74.6305979,44.1294587]]}
(1 row)
~~~

Paste the result above into <https://geojson.io> and you should see the following map, with gray markers for each loon sighting from the bird survey.

<img src="{{ 'images/v22.1/geospatial/tutorial/query-01.png' | relative_url }}" alt="Common Loon sightings in the years 2000-2019 in NY state" style="max-width:100%" />

### (2) What is the total area of Loon sightings?

Now that you have some sense of how loon sightings are distributed across the state, you may wonder: What is the area of the loon's approximate habitat (per these sightings) in New York State?

To find the answer:

1. Collect the geometries of all loon sightings together in a CTE as one geometry.
2. Get the area of the [convex hull](st_convexhull.html) of the resulting geometry.
3. Because the `birds.routes` data uses [SRID 4326](srid-4326.html), the resulting area is measured in degrees, which can be converted to square miles by casting the data to a `GEOGRAPHY` type and dividing by 1609 (the number of meters in a mile) squared.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_sightings
		AS (
			SELECT
				st_collect(routes.geom) AS the_geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	st_area(st_convexhull(the_geom)::GEOGRAPHY) / 1609 ^ 2
FROM
	loon_sightings;
~~~

The result is an area of about 10,000 square miles, which can be visualized by a box with sides that are a little over 100 miles long. This answer can be verified by looking at the map output from [#1][q_01] and noting that most of the observation locations are well within 100 miles of each other.

~~~
       ?column?
----------------------
  10430.691899422598
(1 row)
~~~

### (3) How many Loon sightings have there been in NY state in the years 2000-2019?

In addition to the [loon observation point locations][q_01] and the [area of those observations][q_02] (which you can take as a proxy for the size of the loon's local habitat), you may want to know exactly how many times a loon has been sighted in the area.

To find the answer:

1. Join `birds.birds` and `birds.observations` on the bird ID where the bird name is "Common Loon".
2. Sum all of the sightings; the `GROUP BY` on bird names is necessary due to the use of the `sum` aggregate function.

{% include copy-clipboard.html %}
~~~ sql
SELECT
	birds.name, sum(observations.count) AS sightings
FROM
	birds.birds, birds.observations
WHERE
	birds.name = 'Common Loon'
	AND birds.id = observations.bird_id
GROUP BY
	birds.name;
~~~

~~~
     name     | sightings
--------------+------------
  Common Loon |       269
(1 row)
~~~

### (4) How many Loon sightings were there in NY state in just the year 2019?

You might like to get a sense of how many of the loon sightings were more recent. For example, if there have been fewer sightings of loons in recent years, you might wonder if the population were declining in NY State.

To determine how many sightings there were in NY state in 2019, re-use the query from [#3][q_03], with the additional constraint that the observation year is 2019.

{% include copy-clipboard.html %}
~~~ sql
SELECT
	birds.name, sum(observations.count) AS sightings
FROM
	birds.birds, birds.observations
WHERE
	birds.name = 'Common Loon'
	AND birds.id = observations.bird_id
	AND observations.year = 2019
GROUP BY
	birds.name;
~~~

If the sightings are evenly distributed, you might expect this to yield about 13 sightings. In fact, it's pretty close. This suggests that the loon population may have remained fairly stable over the years 2000-2019.

~~~
     name     | sightings
--------------+------------
  Common Loon |        12
(1 row)
~~~

### (5) What is the density of Loon sightings per square mile in its range as defined by this data set in 2019?

Since you are planning to do some hiking back into the woods to find the actual loons, you may get curious as to how densely the loon population is scattered over its habitat. From a practical perspective, the distribution is not actually even, since loons are most frequently located on lakes and ponds. Even so, it may serve as a useful proxy for the general areas in which to focus your birdwatching travels.

To answer this question:

1. Build a CTE that returns both the convex hull of loon habitat, as well as the sum of all loon observations in NY.
2. Query the result table of the CTE from step 1 to divide the number of sightings by the area of the loon's habitat (the convex hull). As in [#2][q_02], do some arithmetic to convert from the unit of degrees returned by [SRID 4326](srid-4326.html) to square miles.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				sum(observations.count) AS sightings,
				st_convexhull(st_collect(routes.geom))
					AS the_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
				AND observations.year = 2019
		)
SELECT
	loon_habitat.sightings::FLOAT8
	/ (
			SELECT
				st_area(loon_habitat.the_hull::GEOGRAPHY)
				/ 1609 ^ 2
		)
FROM
	loon_habitat;
~~~

It turns out that this is a pretty small number. There are not very many loon sightings per square mile within its overall habitat area, since lakes and ponds make up a small portion of the physical space inside the convex hull of observations.

~~~
        ?column?
------------------------
  0.005078531189694916
(1 row)
~~~

## Step 5. Find bookstores to visit

### (6) What are the bookstores that lie within the Loon's habitat range in NY state?

Now that you have asked (and answered) some exploratory questions that may inform your birdwatching activities while on vacation, it would be good to start thinking about what bookstores to visit as part of your travels.

A natural question that arises is: given that you are looking for loon habitat, what are the bookstores located within that habitat?

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is [contained](st_contains.html) by the loon habitat. Note that the query below [orders by](order-by.html) the store geometries so that stores in the list are clustered by location. This ordering may be useful if you want to travel between nearby stores. For more information about how this ordering is calculated, see [How CockroachDB's spatial indexing works](spatial-indexes.html#how-cockroachdbs-spatial-indexing-works).

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_sightings
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS loon_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	name, street, city, state, url, phone
FROM
	tutorial.bookstores, loon_sightings
WHERE
	st_contains(loon_hull, geom)
ORDER BY
	geom;
~~~

~~~
                        name                       |        street         |      city      | state |                       url                       |     phone
---------------------------------------------------+-----------------------+----------------+-------+-------------------------------------------------+-----------------
  Blacktree Books                                  | 5006 State Highway 23 | Oneonta        | NY    | https://blacktreeoneonta.square.site/           | 6074321200
  The Green Toad Bookstore                         | 198 Main St           | Oneonta        | NY    | http://www.greentoadbookstore.com               | (607) 433-8898
  The Treehouse Reading and Arts Center            | 587 Main St Ste 304   | New York Mills | NY    | http://treehousebookshop.com                    | 315-765-6262
  Gansevoort House Books at Gems Along the Mohawk  | 800 Mohawk St         | Herkimer       | NY    |                                                 |
  Gansevoort House Books at The Shoppes at 25 West | 25 W Mill Street      | Little Falls   | NY    | http://www.gansevoorthouse.com/bookstore/       |
  Mysteries On Main Street                         | 144 W Main St         | Johnstown      | NY    | https://www.facebook.com/MysteriesOnMainStreet/ | (518) 736-2665
  The Bookstore Plus Music &amp; Art               | 2491 Main St          | Lake Placid    | NY    | http://www.thebookstoreplus.com                 | (518) 523-2950
  The Book Nook (Saranac Lake, NY)                 | 7 Broadway            | Saranac Lake   | NY    | https://www.facebook.com/slbooknook/            | 6315999511
(8 rows)
~~~

### (7) How many different species of bird habitats contain the location of the Book Nook in Saranac Lake, NY?

As a birdwatcher, you probably do not want to only see the Common Loon. As long as you are spending time outside, it would be nice to see what other species of bird are in the area. This may provide even more birdwatching fun.

Since you know you will want to hit up [The Book Nook in Saranac Lake, NY](https://www.facebook.com/slbooknook/) at least once on your trip, you decide to see what bird species' habitats contain the store's location. That way you can get a sense of the diversity of bird species in the area.

To answer this question:

1. Build a CTE that returns some information about the bookstore you want to visit.
2. Build another CTE that returns information about the habitats of birds observed in NY state, and collects the habitat geometries together into one geometry.
3. Join the results of the above CTEs and query the count of birds whose habitats contain the location of the bookstore.

{{site.data.alerts.callout_info}}
The final [`SELECT`](selection-queries.html) in the query below is doing a join that will not benefit from [spatial indexing](spatial-indexes.html), since both sides of the join are the results of [CTEs](common-table-expressions.html), and are therefore not indexed.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
WITH
	the_book_nook
		AS (
			SELECT
				bookstores.name, street, city, state, geom
			FROM
				tutorial.bookstores
			WHERE
				state = 'NY' AND city = 'Saranac Lake'
		),
	local_birds
		AS (
			SELECT
				birds.name,
				st_convexhull(st_collect(routes.geom))
					AS the_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.id = observations.bird_id
				AND observations.route_id = routes.id
			GROUP BY
				birds.name
		)
SELECT
	count(local_birds.name)
FROM
	local_birds, the_book_nook
WHERE
	st_contains(local_birds.the_hull, the_book_nook.geom);
~~~

This is encouraging; there are over 120 species of birds for you to choose from whose habitats include the bookstore you want to visit!

~~~
  count
---------
    124
(1 row)
~~~

You can verify the results by checking how many bird species have been sighted by the bird survey overall; you should expect that this number will be much larger than 124, and indeed it is:

{% include copy-clipboard.html %}
~~~ sql
SELECT COUNT(name) FROM birds.birds;
~~~

~~~
  count
---------
    756
(1 row)
~~~

### (8) Which 25 birds were most often sighted within 10 miles of the Book Nook in Saranac Lake, NY during the 2000-2019 observation period?

It's great that you [know how many bird species may be near a given bookstore][q_07]; however, that query didn't tell you which birds you have the best chance of seeing. Therefore, you'd like to figure out what birds are the most commonly seen in the area near a bookstore you want to visit: The Book Nook in Saranac Lake, NY.

To answer this question:

1. Build a CTE that returns some information about the bookstore you want to visit.
2. Join the results of the above CTE and a query against the `birds` database that lists the names and observation totals (sums) of birds whose habitats are within 10 miles of the location of the bookstore.

{{site.data.alerts.callout_info}}
The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's [`EXPLAIN`](explain.html) output for details).
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
WITH
	the_book_nook
		AS (
			SELECT
				bookstores.name, street, city, state, geom
			FROM
				tutorial.bookstores
			WHERE
				state = 'NY' AND city = 'Saranac Lake'
		)
SELECT
	birds.name, sum(observations.count) AS sightings
FROM
	birds.birds,
	birds.observations,
	birds.routes,
	the_book_nook
WHERE
	birds.id = observations.bird_id
	AND observations.route_id = routes.id
	AND st_distance(
			the_book_nook.geom::GEOGRAPHY,
			routes.geom::GEOGRAPHY
		)
		< (1609 * 10)
GROUP BY
	birds.name
ORDER BY
	sightings DESC
LIMIT
	25;
~~~

Perhaps surprisingly, the <a href="https://ebird.org/species/reevir1/US-NY" data-proofer-ignore>Red-eyed Vireo</a> is the "winner", followed by a number of other fairly common birds. If you want a birdwatching challenge, you can reverse the sort order of the above query to find the rarest birds.

~~~
                   name                  | sightings
-----------------------------------------+------------
  Red-eyed Vireo                         |      2557
  White-throated Sparrow                 |       928
  Hermit Thrush                          |       924
  American Robin                         |       691
  Ovenbird                               |       650
  American Crow                          |       528
  (Myrtle Warbler) Yellow-rumped Warbler |       506
  Chipping Sparrow                       |       465
  Black-capped Chickadee                 |       390
  Yellow-bellied Sapsucker               |       359
  Blue-headed Vireo                      |       357
  Blue Jay                               |       345
  Winter Wren                            |       344
  Cedar Waxwing                          |       272
  Blackburnian Warbler                   |       248
  Magnolia Warbler                       |       236
  Black-throated Green Warbler           |       226
  Common Grackle                         |       218
  Red-breasted Nuthatch                  |       209
  Common Yellowthroat                    |       184
  Northern Parula                        |       175
  Nashville Warbler                      |       164
  Red-winged Blackbird                   |       152
  Least Flycatcher                       |       128
  American Redstart                      |       123
(25 rows)
~~~

### (9) What does the shape of all bookstore locations that lie within the Loon's habitat look like?

You [already discovered which bookstores are located within loon habitat][q_06]. However, you cannot really tell where these stores are located based on reading that query's output. You need to see them on the map. Therefore, for trip planning purposes, you decide you would like to look at the shape of the convex hull of the store locations.

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is [contained](st_contains.html) by the loon habitat.
3. Collect the geometries that result from the step above into a single geometry, calculate its convex hull, and return the results as [GeoJSON](geojson.html).

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS the_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	st_asgeojson(st_convexhull(st_collect(geom)))
FROM
	tutorial.bookstores, loon_habitat
WHERE
	st_contains(the_hull, geom);
~~~

~~~
                                                                                              st_asgeojson
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  {"type":"Polygon","coordinates":[[[-75.036815,42.448793],[-75.062138,42.454003],[-75.296575,43.098322],[-74.131673,44.326892],[-73.980251,44.279377],[-74.374175,43.006495],[-75.036815,42.448793]]]}
(1 row)
~~~

Paste the result above into <https://geojson.io> and you should see the following map:

<img src="{{ 'images/v22.1/geospatial/tutorial/query-09.png' | relative_url }}" alt="Convex hull of bookstore locations within Common Loon habitat" style="max-width:100%" />

### (10) What is the area of the shape of all bookstore locations that are in the Loon's habitat range within NY state?

You have already [visualized the convex hull][q_09], but now you would like to calculate its area in square miles.

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is [contained](st_contains.html) by the loon habitat.
2. Get the area of the [convex hull](st_convexhull.html) of the resulting geometry.
3. Collect the geometries that result from the step above into a single geometry, calculate its convex hull, and calculate the area of the hull. As in previous examples, note that because the `birds.routes` data uses [SRID 4326](srid-4326.html), the resulting area is measured in degrees, which is converted to square miles by casting the data to a `GEOGRAPHY` type and dividing by 1609 (the number of meters in a mile) squared.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS the_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	st_area(st_convexhull(st_collect(geom))::GEOGRAPHY)
	/ 1609 ^ 2
FROM
	tutorial.bookstores, loon_habitat
WHERE
	st_contains(the_hull, geom);
~~~

The result is an area of about 3,500 square miles, which can be visualized by a box with sides that are approximately 60 miles long. This answer can be verified by looking at the map output from [#9][q_09] and noting that most of the points on the hull are within about 60 miles of each other.

~~~
       ?column?
----------------------
  3564.1722404508437
(1 row)
~~~

## Step 6. Plan your route

### (11) How long is the route from Mysteries on Main Street in Johnstown, NY to The Book Nook in Saranac Lake, NY?

So far, you have written queries that ask questions about bird habitats, bookstore locations, or some combination of the two. Because you are planning a trip, you want to think about how to travel between the bookstores in the loon habitat area. Depending on how far apart the bookstores are, you may want to visit more than one of them in a day, perhaps doing some birdwatching along the way.

In order to accomplish this, you start looking at [the `bookstore_routes` table](#the-bookstores-and-bookstore_routes-tables) to see how far the distance is in miles between two of the bookstores you'd like to visit.

To answer this question:

1. Issue subqueries that find the IDs of two of the bookstores you'd like to travel between, as start and end points.
2. Measure the length of the geometry that corresponds to those start and end IDs. Note that because the `bookstore_routes.geom` column has a SRID of 0 (which it inherited from the `roads` database from which it was created), you can convert to miles by casting the data to a `GEOGRAPHY` type, which uses meters, and then dividing by 1609 (the number of meters in a mile).

{% include copy-clipboard.html %}
~~~ sql
SELECT
	st_length(geom::GEOGRAPHY) / 1609
FROM
	bookstore_routes
WHERE
	end_store_id
	= (
			SELECT
				id
			FROM
				tutorial.bookstores
			WHERE
				city = 'Johnstown' AND state = 'NY'
		)
	AND start_store_id
		= (
				SELECT
					id
				FROM
					tutorial.bookstores
				WHERE
					city = 'Saranac Lake' AND state = 'NY'
			);
~~~

The answer is: these two stores are about 132 miles apart, measured in road miles.

~~~
      ?column?
---------------------
  132.6837073049756
(1 row)
~~~

### (12) What does the route from Mysteries on Main Street in Johnstown, NY to The Book Nook in Saranac Lake, NY look like?

You have [determined how long the drive between these two stores will be][q_11], but you would like to see what it looks like on the map.

To find this out, you can re-use the query from the previous question, using `ST_AsGeoJSON` instead of `ST_Length`, and skipping the distance math to generate output in miles.

{% include copy-clipboard.html %}
~~~ sql
SELECT
	st_asgeojson(geom)
FROM
	bookstore_routes
WHERE
	end_store_id
	= (
			SELECT
				id
			FROM
				tutorial.bookstores
			WHERE
				city = 'Johnstown' AND state = 'NY'
		)
	AND start_store_id
		= (
				SELECT
					id
				FROM
					tutorial.bookstores
				WHERE
					city = 'Saranac Lake' AND state = 'NY'
			);
~~~

The result is a very large chunk of JSON:

~~~
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                st_asgeojson
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  {"type":"MultiLineString","coordinates":[[[-74.152265,44.317412001],[-74.150683244,44.320361245],[-74.149541,44.322491001]],[[-74.357329,44.244378001],[-74.356093,44.243859001],[-74.354178,44.242898001],[-74.348143,44.239648001],[-74.343626,44.237058001],[-74.342321,44.236058001],[-74.341749001,44.235410001],[-74.33975,44.232579001],[-74.339208,44.231977001],[-74.338667001,44.231599001],[-74.337461,44.231248001],[-74.326169,44.228478001],[-74.324681,44.228200001],[-74.322827,44.228066001],[-74.319936001,44.228040001],[-74.318920999,44.228200001],[-74.316251,44.228909001],[-74.315228,44.229337001],[-74.313824,44.230576001],[-74.310864,44.234299001],[-74.308766,44.236287001],[-74.30769,44.237137001],[-74.306668,44.237778001],[-74.305104,44.238369001],[-74.300305,44.239258001],[-74.298489,44.239849001],[-74.296765,44.240559001],[-74.293965,44.241978001],[-74.285755,44.246469001],[-74.284199,44.246998001],[-74.283496,44.247158001],[-74.278659999,44.246807001],[-74.277065,44.246487001],[-74.27103,44.244926001],[-74.269977,44.244766001],[-74.268862,44.244926001],[-74.267528001,44.245315001],[-74.264667,44.246425001],[-74.263103,44.246887001],[-74.262439,44.246956001],[-74.261516,44.246887001],[-74.258806999,44.246215001],[-74.258105,44.246128001],[-74.256106,44.246376001],[-74.249583,44.248748001],[-74.242563999,44.250486001],[-74.240374,44.251056001],[-74.237955,44.251956001],[-74.236117,44.252757001],[-74.234713,44.253264001],[-74.233477,44.253375001],[-74.232264001,44.253214001],[-74.230066,44.252714001],[-74.228067,44.252554001],[-74.224855,44.252695001],[-74.222374999,44.253027001],[-74.220468,44.253485001],[-74.219284999,44.253916001],[-74.218202,44.254465001],[-74.217285999,44.255606001],[-74.216554001,44.256914001],[-74.216272,44.258444001],[-74.216172,44.260206001],[-74.215837,44.261663001],[-74.215417,44.262537001],[-74.215105,44.262884001],[-74.210526,44.266176001],[-74.209443,44.267164001],[-74.205635,44.272016001],[-74.204712,44.272855001],[-74.203781,44.273633001],[-74.20137,44.275014001],[-74.199875,44.276155001],[-74.189735,44.286454001],[-74.1883,44.287625001],[-74.187415,44.288033001],[-74.186333,44.288353001],[-74.184364869,44.288747417],[-74.184364734,44.288747444],[-74.180854001,44.289451001],[-74.178374,44.290524001],[-74.177191,44.291213001],[-74.176085,44.292084001],[-74.175354,44.292725001],[-74.174521,44.293915001],[-74.173979,44.295353001],[-74.173468,44.297363001],[-74.172934001,44.298374001],[-74.166349,44.306545001],[-74.165144,44.308003001],[-74.160711,44.311824001],[-74.159916999,44.312461001],[-74.157789,44.313514001],[-74.154476999,44.315021001],[-74.153623,44.315642001],[-74.152265,44.317412001]],[[-74.464373,44.224200001],[-74.462122,44.224250001],[-74.461046,44.224318001],[-74.455468999,44.22478],[-74.442636406,44.225904612],[-74.437326,44.226370001],[-74.436273,44.226599001],[-74.416718001,44.232618001],[-74.398811,44.238371001],[-74.396683,44.238729001],[-74.390892,44.239401001],[-74.386916999,44.240198001],[-74.376418001,44.242708001],[-74.37461,44.243078001],[-74.369964,44.243669001],[-74.358573,44.244409001],[-74.357329,44.244378001]],[[-74.538494,44.124160001],[-74.537784999,44.125049001],[-74.534733,44.128341001],[-74.533054,44.129662001],[-74.531116,44.130992001],[-74.528957,44.132541001],[-74.527345325,44.134460927],[-74.527338703,44.134468817],[-74.527332393,44.134476334],[-74.525867,44.136222001],[-74.525164999,44.137359001],[-74.524524,44.138992001],[-74.524012999,44.140750001],[-74.522853,44.151859001],[-74.522876,44.154721001],[-74.523166,44.156341001],[-74.523501999,44.157512001],[-74.523822,44.158702001],[-74.523914,44.160320001],[-74.523753999,44.161079001],[-74.523371,44.161991001],[-74.521656,44.164352001],[-74.518795,44.167732001],[-74.517734,44.168800001],[-74.515415,44.170791001],[-74.512392,44.173229001],[-74.511211,44.174079001],[-74.507396,44.176181001],[-74.500621,44.180629001],[-74.492266,44.190040001],[-74.487185,44.193339001],[-74.485827,44.194141001],[-74.480456,44.196220001],[-74.478991,44.196551001],[-74.474985,44.197211001],[-74.472384001,44.197902001],[-74.471864933,44.198667258],[-74.471781,44.198791001],[-74.471609775,44.199419986],[-74.47160767,44.199427717],[-74.471357398,44.200347074],[-74.471238999,44.200782001],[-74.470742999,44.204081001],[-74.470324,44.205100001],[-74.470011,44.205630001],[-74.468932391,44.207118271],[-74.468927664,44.207124794],[-74.467852,44.208609001],[-74.464525,44.213050001],[-74.462816,44.215560001],[-74.462626,44.216022001],[-74.462687,44.217509001],[-74.46288977,44.21846686],[-74.46306,44.219271001],[-74.463861,44.220321001],[-74.464914999,44.221049001],[-74.465776999,44.221599001],[-74.466311,44.222030001],[-74.466249999,44.222491001],[-74.465655,44.223059001],[-74.464373,44.224200001]],[[-74.529117,44.099819001],[-74.531985,44.102500001],[-74.532741,44.103572001],[-74.533183,44.104492001],[-74.533435,44.106109001],[-74.533527,44.108600001],[-74.534061,44.111190001],[-74.534503,44.112152001],[-74.535045,44.113109001],[-74.536502999,44.115379001],[-74.537357,44.116381001],[-74.537456,44.116455001]],[[-74.472935039,44.000000001],[-74.479534023,44.002542684],[-74.479984937,44.002716429],[-74.480005378,44.002724305],[-74.480329,44.002849001],[-74.48677,44.005149001],[-74.49295,44.007480001],[-74.496628,44.009689001],[-74.498024,44.010719001],[-74.499611,44.012371001],[-74.501511,44.014541001],[-74.503151,44.016508001],[-74.508523,44.023811001],[-74.511529,44.027950001],[-74.514778999,44.032821001],[-74.515222,44.034469001],[-74.515473999,44.036991001],[-74.516015,44.039112001],[-74.517175,44.041202001],[-74.517816,44.042251001],[-74.519449,44.044540001],[-74.520181,44.045272001],[-74.521486,44.046760001],[-74.52189,44.047332001],[-74.522234,44.048221],[-74.522074,44.052341001],[-74.521654,44.055591001],[-74.520983,44.059932001],[-74.520051,44.065921001],[-74.519023544,44.072237853],[-74.519022043,44.072247084],[-74.518511,44.075389001],[-74.518381,44.076869001],[-74.518374,44.078979001],[-74.518503,44.079730001],[-74.518976,44.081382001],[-74.519572001,44.082641001],[-74.52122,44.085311001],[-74.525523,44.093051001],[-74.52682,44.095809001],[-74.528056,44.098220001],[-74.5291102,44.099808753],[-74.529115821,44.099817225],[-74.529117,44.099819001]],[[-74.419277,43.968522001],[-74.420169,43.969804001],[-74.420413,43.970281001],[-74.420604,43.971353001],[-74.420643889,43.971779185],[-74.420644773,43.971788634],[-74.42081,43.973554001],[-74.421245,43.974141001],[-74.421848,43.974301001],[-74.426426993,43.974695925],[-74.42644422,43.974697411],[-74.427425,43.974782001],[-74.42815,43.975010001],[-74.428618155,43.975309199],[-74.428626193,43.975314337],[-74.429577,43.975922001],[-74.43047,43.976590001],[-74.431927,43.977391001],[-74.435977,43.978982001],[-74.437787,43.979302001],[-74.439526,43.979302001],[-74.443196,43.979050001],[-74.444340001,43.979092001],[-74.445003999,43.979191001],[-74.446484,43.979640001],[-74.449117,43.980812001],[-74.451276,43.981953001],[-74.453779,43.983780001],[-74.456640001,43.986951001],[-74.460989,43.992531001],[-74.461897,43.993790001],[-74.4634,43.995430001],[-74.464407001,43.996460001],[-74.465362,43.997082001],[-74.472935039,44.000000001]],[[-74.430422635,43.855487245],[-74.430823844,43.859778886],[-74.432091,43.864603001],[-74.430741,43.872534001],[-74.430741,43.873312001],[-74.431092,43.874205001],[-74.431824999,43.875052001],[-74.432267,43.875433001],[-74.433274,43.876513001],[-74.433854,43.877634001],[-74.433946,43.878454001],[-74.433725001,43.879091001],[-74.432962,43.880034001],[-74.431573,43.881113001],[-74.427842,43.882784001],[-74.424844,43.884363001],[-74.424027,43.884882001],[-74.418244,43.889235],[-74.417732,43.889895001],[-74.417481,43.890444001],[-74.417428,43.891023001],[-74.417481,43.891981001],[-74.417992999,43.893305001],[-74.418686999,43.894175001],[-74.419221,43.894613001],[-74.420586,43.895502001],[-74.422838,43.896364001],[-74.424661,43.896803001],[-74.428651,43.896982001],[-74.434976,43.898191001],[-74.435762,43.898394001],[-74.436464,43.898992001],[-74.436815,43.899541001],[-74.437037001,43.900682001],[-74.437006,43.902284001],[-74.436844816,43.902957433],[-74.436815,43.903082001],[-74.436568249,43.903468348],[-74.436564,43.903475001],[-74.435687001,43.905462001],[-74.435648,43.906812001],[-74.435877,43.907381001],[-74.436884,43.908254001],[-74.437456,43.908434001],[-74.439768,43.909033001],[-74.440714,43.909444001],[-74.442675,43.910814001],[-74.443247,43.911241001],[-74.443949,43.912252001],[-74.444194,43.912843001],[-74.444163,43.913831001],[-74.443477,43.917234001],[-74.443286,43.917814001],[-74.442683,43.918993001],[-74.442408,43.919753002],[-74.441707,43.924302001],[-74.442027,43.925031001],[-74.44321,43.926824001],[-74.444118,43.927891001],[-74.444727999,43.928422001],[-74.455486001,43.936163001],[-74.457503769,43.936996535],[-74.457628577,43.938124354],[-74.456197485,43.939437358],[-74.452444415,43.94344539],[-74.450565344,43.945532689],[-74.449504442,43.946317113],[-74.446375524,43.948497454],[-74.446308501,43.948545699],[-74.4417465,43.951936699],[-74.441713582,43.95196156],[-74.441577106,43.952073562],[-74.44144825,43.95219425],[-74.441440603,43.952201926],[-74.440944602,43.952701927],[-74.440831562,43.952823108],[-74.440719559,43.952959582],[-74.440616724,43.953103091],[-74.440523492,43.953253017],[-74.440440267,43.95340872],[-74.440417621,43.953455787],[-74.440279357,43.953750403],[-74.439810963,43.954070359],[-74.438161986,43.954733199],[-74.435710574,43.955480195],[-74.435629767,43.955506216],[-74.435464532,43.955568406],[-74.435303719,43.955641268],[-74.435303325,43.955641463],[-74.434326325,43.956123464],[-74.434253446,43.956160804],[-74.429912445,43.958468803],[-74.429830017,43.958514493],[-74.429792382,43.958536629],[-74.428869382,43.95908963],[-74.428757089,43.959160725],[-74.428613582,43.959263561],[-74.428602976,43.959271742],[-74.425443975,43.961720742],[-74.425061746,43.963823434],[-74.423999,43.966344001],[-74.419277,43.968522001]],[[-74.430422635,43.855487245],[-74.422981,43.853304001],[-74.422035,43.852503001],[-74.421463,43.851863001],[-74.42086,43.850794001],[-74.420173,43.849055001],[-74.417701001,43.847792001],[-74.416725,43.847434001],[-74.411512999,43.845713001],[-74.410461,43.845374001],[-74.405379,43.845622001],[-74.404302999,43.845653001],[-74.402564,43.845443001],[-74.391691,43.843593001],[-74.389043999,43.842933001],[-74.386389,43.842044001],[-74.383202099,43.84067843],[-74.383194658,43.840675242],[-74.383008908,43.840595648],[-74.380788,43.839644001],[-74.378271,43.838885001],[-74.370183,43.837283001],[-74.369199,43.836986001],[-74.367238,43.835895001],[-74.366452,43.835223001],[-74.362378,43.829894001],[-74.361927,43.829215001],[-74.360920001,43.826236001],[-74.360073,43.825275001],[-74.359158,43.824615001],[-74.356823,43.823444001],[-74.351642,43.821704001],[-74.350788,43.821453001],[-74.345065,43.820084001],[-74.339946,43.819373001],[-74.338977001,43.819164001],[-74.33768,43.818595001],[-74.336580999,43.817832001],[-74.334681,43.816055001],[-74.333987,43.815483001],[-74.33301,43.815112001],[-74.332346,43.815025001],[-74.328997,43.815135001],[-74.328265,43.815044001],[-74.32606,43.814525001],[-74.324885,43.814014001],[-74.323565,43.813075001],[-74.317789,43.807224001],[-74.316904,43.805984001],[-74.315865999,43.804916001],[-74.314164,43.803356001],[-74.312616,43.802234001],[-74.309617,43.800743001],[-74.304787,43.798774001],[-74.303597,43.798156002],[-74.302544,43.797374001],[-74.302017,43.796764001],[-74.301766,43.795703001],[-74.301293,43.789993001],[-74.301239,43.788345001],[-74.30156,43.787366001],[-74.301964,43.786903001],[-74.303009,43.785984001],[-74.303856,43.785053001],[-74.303766,43.784523001],[-74.303169,43.783584001],[-74.30237657,43.782755241],[-74.302368102,43.782746385],[-74.301773,43.782124001],[-74.300392,43.781143001],[-74.299507001,43.780723001],[-74.298248001,43.780403001],[-74.296165,43.780174001],[-74.294173999,43.780174001],[-74.293197,43.780403001],[-74.289786,43.781475001],[-74.283652001,43.782913001],[-74.281074,43.783226001],[-74.276053,43.783065001],[-74.266203,43.782344001],[-74.265295,43.782203001]],[[-74.363938,43.502013001],[-74.366326,43.504158001],[-74.367432,43.504927001],[-74.368592001,43.505598001],[-74.3695,43.506236001],[-74.369966,43.506716001],[-74.371263,43.508746001],[-74.371728,43.510188002],[-74.371759,43.510878001],[-74.371072,43.513346001],[-74.371126,43.514128001],[-74.371263001,43.514609001],[-74.371606001,43.515086001],[-74.372988,43.516226001],[-74.37459,43.516986001],[-74.377199,43.518266001],[-74.385432,43.522406001],[-74.386088,43.523017001],[-74.386408999,43.523497001],[-74.386691,43.524646001],[-74.386532553,43.526017531],[-74.38653144,43.526027172],[-74.386442444,43.526797514],[-74.386409,43.527087001],[-74.385913,43.528948001],[-74.385119,43.531458001],[-74.383929,43.534228001],[-74.383212,43.535826001],[-74.383021,43.537089001],[-74.382983,43.538138001],[-74.383334,43.538897001],[-74.384273,43.540125001],[-74.385593,43.541586001],[-74.390468001,43.545298001],[-74.391071,43.546008002],[-74.391918,43.547678001],[-74.395001,43.555265001],[-74.395131,43.556048001],[-74.395283,43.557879001],[-74.395321,43.561217001],[-74.395543,43.562746001],[-74.395909,43.563776],[-74.396512,43.564509001],[-74.397519,43.565466001],[-74.398803582,43.566517366],[-74.398814559,43.56652635],[-74.399221,43.566859001],[-74.399824,43.567705001],[-74.399944999,43.568259001],[-74.399945,43.569647001],[-74.399221,43.572188001],[-74.39919,43.573626001],[-74.399662,43.574797001],[-74.40064,43.575918001],[-74.404486,43.579416001],[-74.405202999,43.580538001],[-74.405584,43.581227001],[-74.405916539,43.5819675],[-74.405920409,43.581976118],[-74.406069135,43.582307303],[-74.407255,43.584948001],[-74.407721,43.586386001],[-74.408263,43.588358001],[-74.408606,43.591215001],[-74.408484,43.592638001],[-74.408454,43.594439001],[-74.408896,43.595877001],[-74.409934,43.596907001],[-74.410712,43.597319001],[-74.414336,43.598826001],[-74.418052,43.600195001],[-74.418937,43.600676001],[-74.419784,43.601568001],[-74.420166,43.602099001],[-74.420356,43.602716001],[-74.420326,43.603445001],[-74.419976,43.604178001],[-74.417839,43.607267001],[-74.416397,43.610147001],[-74.414604,43.614607001],[-74.414423322,43.616825244],[-74.412448675,43.618905862],[-74.40718547,43.621568425],[-74.402912985,43.623921388],[-74.397525939,43.62776043],[-74.395234896,43.628936913],[-74.392262735,43.632218675],[-74.39075766,43.634708852],[-74.389909772,43.637358042],[-74.388159464,43.640096794],[-74.387494889,43.644231168],[-74.387252,43.646085001],[-74.387122,43.646905001],[-74.387222,43.647615001],[-74.387664,43.648465001],[-74.388618,43.649698001],[-74.388953999,43.650544001],[-74.389282339,43.651568593],[-74.389285046,43.651577041],[-74.389527445,43.652333453],[-74.389847852,43.655810221],[-74.388573718,43.658372116],[-74.385712295,43.660061454],[-74.378887271,43.663353982],[-74.375864153,43.663837969],[-74.373971827,43.663959237],[-74.371619282,43.665055508],[-74.369785751,43.66516015],[-74.365134387,43.665658299],[-74.363288,43.666715001],[-74.362213,43.667745001],[-74.360854,43.669385001],[-74.360518,43.669934001],[-74.360167,43.670827001],[-74.356002,43.676476001],[-74.349882999,43.683015001],[-74.344527,43.687794001],[-74.343077,43.689374001],[-74.342131,43.691105001],[-74.340582,43.694836001],[-74.339514,43.696484],[-74.335066,43.700436001],[-74.334242,43.701874001],[-74.333174,43.704007001],[-74.331496,43.707844001],[-74.330802,43.709084001],[-74.330076,43.709927001],[-74.329352001,43.710366001],[-74.328215,43.710705001],[-74.324652001,43.710957001],[-74.320875,43.711563001],[-74.319922,43.711865001],[-74.319266,43.712277001],[-74.313734,43.718174001],[-74.313069,43.719135001],[-74.312566999,43.720524001],[-74.311713,43.722103001],[-74.309912,43.724556001],[-74.302595001,43.732204001],[-74.299216,43.735523001],[-74.297856999,43.736393001],[-74.294798006,43.740837095],[-74.294792616,43.740844925],[-74.292921,43.743564001],[-74.290266,43.747505001],[-74.289922999,43.747887001],[-74.287932,43.748733001],[-74.287207,43.749325001],[-74.286703,43.750084001],[-74.285567,43.752563001],[-74.285345,43.753802001],[-74.284903,43.754875001],[-74.283926,43.756206001],[-74.282431,43.757225001],[-74.278173999,43.761955001],[-74.276846,43.763714001],[-74.27561,43.764866001],[-74.274252,43.765823001],[-74.270308,43.768245001],[-74.265844,43.770633001],[-74.264074,43.773136001],[-74.263722,43.773906001],[-74.263662,43.775093001],[-74.263884,43.776195001],[-74.264570001,43.777404001],[-74.264853,43.778395001],[-74.265265,43.781635001],[-74.265295,43.782203001]],[[-74.538405,43.399411001],[-74.534987,43.400719001],[-74.533636,43.401360001],[-74.531745,43.402501001],[-74.530805999,43.403229001],[-74.529921,43.404080001],[-74.527311,43.407731001],[-74.526495,43.409058001],[-74.524985001,43.412920001],[-74.524451,43.413998001],[-74.523793,43.414979001],[-74.523108,43.415730001],[-74.522154001,43.416398001],[-74.521093999,43.417008001],[-74.518043001,43.418500001],[-74.513304,43.420670001],[-74.508344,43.422768001],[-74.507361,43.423131001],[-74.499571001,43.426739001],[-74.497915,43.427628001],[-74.495504,43.429299001],[-74.488104,43.434572002],[-74.486913001,43.435559001],[-74.483991,43.437459001],[-74.480543,43.439400001],[-74.476689,43.440937001],[-74.474523,43.441449001],[-74.473745,43.441516001],[-74.472646,43.441288001],[-74.47054,43.440808001],[-74.468564,43.440540001],[-74.467183,43.440702001],[-74.465771,43.441201001],[-74.457173,43.447567001],[-74.453511,43.450928001],[-74.452411999,43.452049001],[-74.451405,43.452919001],[-74.445484001,43.457390001],[-74.440525,43.460407001],[-74.43845,43.461510001],[-74.435283,43.462418001],[-74.432674,43.463798001],[-74.430072,43.466109001],[-74.428562001,43.466999001],[-74.423259001,43.469658001],[-74.421505,43.470231001],[-74.420529,43.470428001],[-74.414973,43.471008001],[-74.412081,43.470958001],[-74.411082001,43.470890001],[-74.408251,43.470256001],[-74.407214,43.470119001],[-74.406328,43.470231001],[-74.405237,43.470639001],[-74.404421,43.471187001],[-74.403751968,43.471760018],[-74.40374812,43.471763313],[-74.402247,43.473049001],[-74.398798,43.475128001],[-74.397257,43.475996001],[-74.395281,43.476959001],[-74.394808,43.477138001],[-74.39409,43.477649001],[-74.392458,43.479358001],[-74.392168001,43.479747001],[-74.389879,43.481849001],[-74.388879,43.482417001],[-74.388063,43.482768001],[-74.384286001,43.483890001],[-74.38231,43.484687001],[-74.379548,43.485988001],[-74.378007,43.487247001],[-74.37459,43.490497001],[-74.371728001,43.493628001],[-74.368516,43.497519001],[-74.368081,43.498088001],[-74.366921,43.499526001],[-74.363938,43.502013001]],[[-74.517516,43.229490001],[-74.517511546,43.229491206],[-74.51715,43.229589001],[-74.516121,43.230180001],[-74.515517999,43.231168001],[-74.515166985,43.234115798],[-74.516126976,43.235651784],[-74.516352909,43.23601328],[-74.516358236,43.236021803],[-74.516627882,43.236453236],[-74.517407028,43.237621954],[-74.517309635,43.23869328],[-74.516725275,43.241225503],[-74.516335703,43.242783794],[-74.516451181,43.24314947],[-74.516596508,43.243609679],[-74.516599124,43.243617961],[-74.517504421,43.246484736],[-74.517504421,43.249114353],[-74.517789825,43.250826773],[-74.517791285,43.250835533],[-74.517991388,43.25203615],[-74.517699208,43.253497048],[-74.517991387,43.25447098],[-74.519257499,43.255152732],[-74.522958442,43.255931877],[-74.528899427,43.255931877],[-74.534353447,43.255055339],[-74.534409397,43.255065212],[-74.534613985,43.255101316],[-74.534616201,43.255101707],[-74.536009132,43.255347518],[-74.539125714,43.256224057],[-74.540781399,43.258464101],[-74.541755331,43.259340641],[-74.543216229,43.260119786],[-74.544190161,43.261483291],[-74.544287555,43.263236368],[-74.545346767,43.265596244],[-74.547662904,43.26791238],[-74.54885406,43.269831465],[-74.549383463,43.271419675],[-74.550640795,43.272809358],[-74.551104022,43.274265215],[-74.552295179,43.275654897],[-74.553486335,43.276846053],[-74.553817212,43.277706333],[-74.55342016,43.278831314],[-74.552824581,43.280088646],[-74.553023108,43.281015101],[-74.553684861,43.282338608],[-74.553817212,43.283926816],[-74.553883387,43.286242954],[-74.553618685,43.287764988],[-74.553287809,43.289353196],[-74.553221634,43.291272281],[-74.553817213,43.293654593],[-74.556202148,43.296330374],[-74.55620838,43.296337366],[-74.556530402,43.296698659],[-74.557439202,43.297789221],[-74.557853909,43.298286869],[-74.561625903,43.299875077],[-74.563942041,43.300603006],[-74.565265548,43.301198584],[-74.567250809,43.303316195],[-74.566593,43.306008001],[-74.565959,43.306329001],[-74.565021001,43.306668001],[-74.564342,43.306809001],[-74.562518,43.306870001],[-74.561672,43.307118001],[-74.560832,43.307580001],[-74.56026,43.308179001],[-74.559603999,43.309251001],[-74.559513,43.310868001],[-74.557223999,43.314487001],[-74.556812,43.314969001],[-74.556179,43.315419001],[-74.551799,43.317689001],[-74.550791999,43.318028001],[-74.550205,43.318139001],[-74.54932,43.318120001],[-74.548602,43.317998001],[-74.546553305,43.317435031],[-74.546540117,43.317431407],[-74.546535,43.317430001],[-74.545314,43.317448001],[-74.543769359,43.317982042],[-74.54346,43.318089001],[-74.541895334,43.319480577],[-74.541874268,43.319499312],[-74.541227786,43.320074278],[-74.537982,43.322961001],[-74.536966999,43.324059001],[-74.534404,43.326890001],[-74.534053,43.327348001],[-74.534023,43.328469001],[-74.534145,43.329949001],[-74.53445,43.331300001],[-74.534633,43.335969001],[-74.534572,43.336610001],[-74.533748,43.339700001],[-74.532902,43.341908001],[-74.532711,43.342562001],[-74.532711,43.344109001],[-74.533154001,43.347749001],[-74.533329,43.348180001],[-74.534245,43.348569001],[-74.535931,43.348920001],[-74.539784,43.352101001],[-74.540059001,43.352578001],[-74.5425,43.359578001],[-74.542431,43.360329001],[-74.544652,43.365231001],[-74.545285,43.366009001],[-74.546719999,43.368889001],[-74.546911,43.369328],[-74.546941,43.370099001],[-74.546910434,43.37081979],[-74.546910043,43.370828991],[-74.546743,43.374768001],[-74.54523859,43.380839868],[-74.545236318,43.380849039],[-74.544607,43.383389001],[-74.544165,43.384350001],[-74.543592,43.385129001],[-74.543226,43.386269001],[-74.543211,43.387047001],[-74.543211,43.393700001],[-74.543363,43.395100001],[-74.543692001,43.395955001]],[[-74.523337,43.190378001],[-74.523589,43.190599001],[-74.524406,43.191679001],[-74.524398,43.193460001],[-74.526046,43.199522001],[-74.526756,43.201952001],[-74.526946,43.202500001],[-74.527358,43.203001001],[-74.528816,43.204241001],[-74.529228,43.204851001],[-74.530654,43.209131001],[-74.530807,43.211530001],[-74.531021,43.219041001],[-74.53099,43.219652001],[-74.530456,43.220411001],[-74.530075,43.220682001],[-74.529297,43.220998001],[-74.527389,43.221368001],[-74.526168,43.222299],[-74.52523,43.223351001],[-74.524131,43.225301],[-74.523285,43.226121001],[-74.520644999,43.228219001],[-74.519776,43.228719001],[-74.518394,43.229248001],[-74.517552345,43.229479983],[-74.517516,43.229490001]],[[-74.489522,43.144732001],[-74.487653,43.146842001],[-74.486974,43.147891001],[-74.486386,43.149222001],[-74.486196,43.149931001],[-74.486257,43.151370001],[-74.486982,43.157683001],[-74.487302,43.158499001],[-74.487553068,43.15885108],[-74.487558704,43.158858983],[-74.487645,43.158980001],[-74.488584,43.159922001],[-74.488995999,43.160261001],[-74.492902,43.163321001],[-74.493688,43.163782001],[-74.494749,43.164259001],[-74.498129,43.165240001],[-74.499593,43.166041002],[-74.506094,43.169752001],[-74.50688,43.170550001],[-74.507994,43.172289001],[-74.508909,43.172949001],[-74.509619,43.173319001],[-74.511809,43.174372001],[-74.512953,43.174563001],[-74.514395,43.174440001],[-74.516836999,43.174101001],[-74.517744999,43.174101001],[-74.522367999,43.174429001],[-74.525397,43.174822001],[-74.526427,43.175142001],[-74.527365999,43.175741001],[-74.527617001,43.176222001],[-74.527709,43.177180001],[-74.526206,43.180349001],[-74.524421,43.182619001],[-74.523757,43.183832001],[-74.523505,43.184771001],[-74.523482798,43.184871668],[-74.523481108,43.184879335],[-74.523350626,43.185470982],[-74.522689,43.188471001],[-74.522567,43.189432001],[-74.522849,43.189939001],[-74.523337,43.190378001]],[[-74.481137,43.137126001],[-74.477955,43.136122001],[-74.474796,43.133918001],[-74.473491999,43.132907001],[-74.469212,43.127990001],[-74.467541,43.125544001],[-74.462276001,43.121722001],[-74.461239002,43.120872001],[-74.451899999,43.111972001],[-74.44482,43.104675001],[-74.442248,43.100520001],[-74.441287,43.099738001],[-74.438442511,43.098239949],[-74.43842793,43.098232271],[-74.433276,43.095519001],[-74.427227,43.092842001],[-74.424792,43.092453001],[-74.423205,43.091941001],[-74.422495,43.091514001],[-74.421168,43.090263001],[-74.420733,43.089435001],[-74.420069,43.087520001],[-74.419657,43.084262001],[-74.418360001,43.081066001],[-74.416842,43.078594001],[-74.416178,43.077903001],[-74.409875999,43.074226001],[-74.402719,43.070606001],[-74.401857,43.070297001],[-74.396333,43.069805001],[-74.389688,43.068142001],[-74.388277001,43.067131001],[-74.383843,43.061993001],[-74.382844,43.060459001],[-74.381737,43.057114001],[-74.380936,43.055908001],[-74.37941,43.054917001],[-74.374505,43.053871001],[-74.373430143,43.05371745],[-74.372559,43.053593001],[-74.367921,43.052548001],[-74.366035999,43.051289001]],[[-74.366035999,43.051289001],[-74.365227,43.050747001],[-74.3619,43.050244001],[-74.360909,43.050106001],[-74.359956,43.050152001],[-74.354088001,43.051007001],[-74.352554,43.051045001],[-74.351057999,43.050888001],[-74.348739,43.050381001],[-74.346245,43.050488001]],[[-74.352012,43.027703001],[-74.350357,43.028802001],[-74.34217,43.035565001],[-74.335830001,43.039841001]],[[-74.360901,43.013665001],[-74.358557,43.013592001],[-74.357467,43.013772001],[-74.356567,43.014214001],[-74.353729,43.016545001],[-74.351463001,43.017712001]],[[-74.385208,43.015484001],[-74.384799414,43.015297285],[-74.374367565,43.010530139],[-74.374315078,43.009100739],[-74.374314756,43.009091976],[-74.374214,43.006348001]]]}
(1 row)
~~~

Paste the result above into <https://geojson.io> and you should see the following map:

<img src="{{ 'images/v22.1/geospatial/tutorial/query-12.png' | relative_url }}" alt="What does the route from Mysteries on Main Street in Johnstown, NY to The Book Nook in Saranac Lake, NY look like?" style="max-width:100%" />

### (13) What were the 25 most-commonly-sighted birds in 2019 within 10 miles of the route between Mysteries on Main Street in Johnstown, NY and The Bookstore Plus in Lake Placid, NY?

A natural question that arises once you start traveling between stores is: if I decide to visit two of these stores in a day, and do some birdwatching in between, what are some of the bird species I may expect to find? In this case you are looking at what species are near the route between [Mysteries on Main Street in Johnstown, NY](https://www.facebook.com/MysteriesOnMainStreet), and [The Bookstore Plus in Lake Placid, NY](http://www.thebookstoreplus.com).

To answer this question:

1. Build a CTE that returns the route between the two stores of interest (a geometry).
2. Join the results of the above CTE with a query against [the `birds` database](#the-birds-database) that checks whether the distance between the route geometry and the location of the bird observation (`birds.routes.geom`) bookstore's location is less than the desired length of 10 miles. Note that because the call to `ST_Distance` is operating on shapes cast to `GEOGRAPHY` data type, the results are in meters, which then have to be converted to miles by dividing the result by 1609 (the number of meters in a mile).

{{site.data.alerts.callout_info}}
The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's [`EXPLAIN`](explain.html) output for details).
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
WITH
	bookstore_trip
		AS (
			SELECT
				geom
			FROM
				bookstore_routes
			WHERE
				start_store_id
				= (
						SELECT
							id
						FROM
							tutorial.bookstores
						WHERE
							city = 'Johnstown'
							AND state = 'NY'
					)
				AND end_store_id
					= (
							SELECT
								id
							FROM
								tutorial.bookstores
							WHERE
								city = 'Lake Placid'
								AND state = 'NY'
						)
		)
SELECT
	birds.birds.name,
	sum(birds.observations.count) AS sightings
FROM
	birds.birds,
	birds.observations,
	birds.routes,
	bookstore_trip
WHERE
	birds.birds.id = birds.observations.bird_id
	AND observations.route_id = routes.id
	AND observations.year = 2019
	AND st_distance(
			bookstore_trip.geom::GEOGRAPHY,
			birds.routes.geom::GEOGRAPHY
		)
		< (1609 * 10)
GROUP BY
	birds.name
ORDER BY
	sightings DESC
LIMIT
	25;
~~~

~~~
                   name                  | sightings
-----------------------------------------+------------
  Red-eyed Vireo                         |       124
  Ovenbird                               |        98
  Blue Jay                               |        56
  Black-capped Chickadee                 |        44
  American Robin                         |        43
  American Crow                          |        31
  White-throated Sparrow                 |        26
  Common Yellowthroat                    |        25
  Red-breasted Nuthatch                  |        19
  Blue-headed Vireo                      |        18
  Red-winged Blackbird                   |        16
  Veery                                  |        16
  Winter Wren                            |        16
  American Redstart                      |        15
  Blackburnian Warbler                   |        15
  Chipping Sparrow                       |        14
  Least Flycatcher                       |        13
  Northern Parula                        |        13
  American Goldfinch                     |        13
  Magnolia Warbler                       |        12
  Cedar Waxwing                          |        12
  Song Sparrow                           |        11
  Hermit Thrush                          |        11
  Common Raven                           |        10
  (Myrtle Warbler) Yellow-rumped Warbler |        10
(25 rows)
~~~

### (14) What are the 25 least often sighted other species of birds in the loon's sightings range?

Since you are already looking for loons, you would like to know if there are other, more challenging birdwatching opportunities available within the loon habitat you are already visiting. Specifically, you would like to know: What are the least-often-observed bird species in the loon's habitat?

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE and a query against [the `birds` database](#the-birds-database) that lists the names and observation totals (sums) of birds whose habitats are contained within the convex hull of loon habitat.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS loon_hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	birds.name, sum(birds.observations.count) AS sightings
FROM
	birds.birds,
	birds.observations,
	birds.routes,
	loon_habitat
WHERE
	birds.id = observations.bird_id
	AND observations.route_id = routes.id
	AND st_contains(loon_hull, routes.geom)
GROUP BY
	birds.name
ORDER BY
	sightings ASC
LIMIT
	25;
~~~

~~~
                        name                       | sightings
---------------------------------------------------+------------
  Vesper Sparrow                                   |         1
  Northern Saw-whet Owl                            |         1
  Sora                                             |         1
  Least Bittern                                    |         1
  Palm Warbler                                     |         1
  Ring-necked Duck                                 |         1
  American Three-toed Woodpecker                   |         1
  unid. Yellow-billed Cuckoo / Black-billed Cuckoo |         1
  unid. Accipiter hawk                             |         1
  Eastern Whip-poor-will                           |         1
  Golden-winged Warbler                            |         1
  Eastern Screech-Owl                              |         1
  Northern Goshawk                                 |         1
  Upland Sandpiper                                 |         1
  Hooded Warbler                                   |         2
  Grasshopper Sparrow                              |         2
  Gadwall                                          |         2
  Brewster Warbler (Golden-winged x Blue-winged)   |         2
  Double-crested Cormorant                         |         3
  White-winged Crossbill                           |         3
  Marsh Wren                                       |         3
  Pine Siskin                                      |         3
  Great Horned Owl                                 |         3
  Northern Mockingbird                             |         3
  Red-shouldered Hawk                              |         4
(25 rows)
~~~

## Step 7. Get road and travel info

### (15) What are the top 10 roads nearest to a Loon sighting location in NY?

So far, you have learned [where the birds are](#step-4-scout-loon-locations), [where the overlaps are between birds and bookstores](#step-5-find-bookstores-to-visit), and [how to travel between bookstores while finding birds](#step-6-plan-your-route).

Now you will start asking questions that involve looking at [the `roads` table](#the-roads-table) as well.

Specifically, you would like to know: What are the 10 roads that are closest to a loon observation site?  The answer to this question may help you figure out exactly which roads you should travel down to start the search for loons. The closer a road is to the sighting location, the better: it means there is probably less work to do to see the birds you are looking for.

To answer this question:

1. Build a CTE called `loon_habitat` that collects all of the Common Loon sightings into a single geometry.
2. Build another CTE called `nearby_roads` that joins the results of the subquery above with [the `roads` table](#the-roads-table) and pulls out the roads in NY state that are within a degree (about 60 nautical miles). Order the roads returned by their distance from a loon sighting. This will return some duplicate roads (since loons can be sighted multiple times along a single road), which is why you need to `LIMIT` to 20 here so you can get the list down to 10 later. Because the data in the `roads` table has an SRID of 0, you need to use `ST_SetSRID` to set its SRID to [4326](srid-4326.html). This step is necessary because `ST_Distance` cannot operate on geometries with differing SRIDs.
3. Finally, query the results of the `nearby_roads` subquery to get a list of 10 distinct road names that you can plan to visit.

{{site.data.alerts.callout_info}}
The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's [`EXPLAIN`](explain.html) output for details).
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_collect(routes.geom) AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		),
	nearby_roads
		AS (
			SELECT
				roads.prime_name AS road_name
			FROM
				roads, loon_habitat
			WHERE
				st_distance(
					loon_habitat.geom,
					st_setsrid(roads.geom, 4326)
				)
				< 1
			ORDER BY
				st_distance(
					loon_habitat.geom,
					st_setsrid(roads.geom, 4326)
				)
					ASC
			LIMIT
				20
		)
SELECT
	DISTINCT road_name
FROM
	nearby_roads
LIMIT
	10;
~~~

~~~
      prime_name
-----------------------
  US Route 9
  State Route 30
  State Route 22 Spur
  State Route 22
  State Route 28
  State Route 86
  State Route 28N
  Interstate 87
  US Route 11
  State Route 421
(10 rows)

Time: 1.447s total (execution 1.446s / network 0.000s)
~~~

Unfortunately, this query is a bit slower than you would like: about 1.5 seconds on a single-node [`cockroach demo`](cockroach-demo.html) cluster on a laptop. There are several reasons for this:

1. You haven't created any indexes at all yet. The query is likely to be doing full table scans, which you will need to hunt down with [`EXPLAIN`](explain.html).
2. CockroachDB does not yet have built-in support for index-based nearest neighbor queries. If this feature is important to you, please comment with some information about your use case on [cockroachdb/cockroach#55227](https://github.com/cockroachdb/cockroach/issues/55227).

Let's look at the `EXPLAIN` output to see if there is something that can be done to improve this query's performance:

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN WITH loon_habitat AS (SELECT st_collect(routes.geom) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), nearby_roads AS (SELECT roads.prime_name AS road_name FROM roads, loon_habitat WHERE st_distance(loon_habitat.geom, st_setsrid(roads.geom, 4326)) < 1 ORDER BY st_distance(loon_habitat.geom, st_setsrid(roads.geom, 4326)) ASC LIMIT 20) SELECT DISTINCT road_name FROM nearby_roads LIMIT 10;
~~~

{% include copy-clipboard.html %}
~~~
                                tree                               |        field        |                      description
-------------------------------------------------------------------+---------------------+---------------------------------------------------------
                                                                   | distribution        | full
                                                                   | vectorized          | true
  limit                                                            |                     |
   │                                                               | count               | 10
   └── distinct                                                    |                     |
        │                                                          | distinct on         | road_name
        └── render                                                 |                     |
             └── limit                                             |                     |
                  │                                                | count               | 20
                  └── sort                                         |                     |
                       │                                           | order               | +column48
                       └── render                                  |                     |
                            └── cross join                         |                     |
                                 │                                 | pred                | st_dwithinexclusive(geom, st_setsrid(geom, 4326), 1.0)
                                 ├── scan                          |                     |
                                 │                                 | estimated row count | 225838
                                 │                                 | table               | roads@primary
                                 │                                 | spans               | FULL SCAN
                                 └── render                        |                     |
                                      └── group (scalar)           |                     |
                                           └── hash join           |                     |
                                                │                  | equality            | (route_id) = (id)
                                                │                  | right cols are key  |
                                                ├── hash join      |                     |
                                                │    │             | equality            | (bird_id) = (id)
                                                │    │             | right cols are key  |
                                                │    ├── scan      |                     |
                                                │    │             | Estimated row count | 85731
                                                │    │             | table               | observations@primary
                                                │    │             | spans               | FULL SCAN
                                                │    └── filter    |                     |
                                                │         │        | filter              | name = 'Common Loon'
                                                │         └── scan |                     |
                                                │                  | estimated row count | 756
                                                │                  | table               | birds@primary
                                                │                  | spans               | FULL SCAN
                                                └── scan           |                     |
                                                                   | estimated row count | 129
                                                                   | table               | routes@primary
                                                                   | spans               | FULL SCAN
(40 rows)
~~~

As you can see above, there are several full table scans being performed (see `FULL SCAN`). For each table, you have a hypothesis on what is causing the scan; usually the hypothesis is that the table is missing an index.

- For [the `roads` table](#the-roads-table), there is no [spatial index](spatial-indexes.html) on the `road.geom` column. This is probably the worst performance offender of the bunch, since this table has almost a quarter of a million rows. It makes sense that it's quite large, since it represents a road map of the entire United States.
  - In addition to adding an index to `roads.geom`, you will need to update the SRID of the `roads.geom` column to use [SRID 4326](srid-4326.html) so it matches the SRID of the loon habitat geometry. Updating the SRID to match will allow you to stop using `ST_SetSRID` on `roads.geom` as shown above, which will keep CockroachDB from taking advantage of the spatial index on that column.
- On [the `birds.observations` table](#the-birds-database), there is no index on the `birds.observations.route_id` or `birds.observations.bird_id` columns, which are used for all bird information lookups.
- On the [`birds.birds` table](#the-birds-database), there is no index on the `birds.birds.name` column which you're filtering on (this is also used by almost all of your other bird-related queries).

Based on these hypotheses, you take the following steps:

1. Add an index to the `roads.geom` column. Note that creating the index on `roads.geom` takes about a minute on a single-node [`cockroach demo`](cockroach-demo.html) cluster, since the table is relatively large.

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE INDEX ON roads USING GIST(geom);
    ~~~

2. Update the SRID of the `roads.geom` column from 0 to [4326](srid-4326.html). This will take a few seconds.

    {% include copy-clipboard.html %}
    ~~~ sql
    UPDATE roads SET geom = st_transform(st_setsrid(geom, 4326), 4326) WHERE gid IS NOT NULL RETURNING NOTHING;
    ~~~

3. Add indexes on the `birds.observations.route_id` and `birds.observations.bird_id` columns:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE INDEX ON birds.observations(bird_id);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE INDEX ON birds.observations(route_id);
    ~~~

4. Add an index on the `birds.birds.name` column:

    {% include copy-clipboard.html %}
    ~~~ sql
    CREATE INDEX ON birds.birds(name);
    ~~~

Did adding all of these indexes and updating the road geometry SRIDs make this query any faster?  Let's check. Note that the query below has been modified to no longer use the `ST_SetSRID` function.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_collect(routes.geom) AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		),
	nearby_roads
		AS (
			SELECT
				roads.prime_name AS road_name
			FROM
				roads, loon_habitat
			WHERE
				st_distance(loon_habitat.geom, roads.geom)
				< 1
			ORDER BY
				st_distance(loon_habitat.geom, roads.geom)
					ASC
			LIMIT
				20
		)
SELECT
	DISTINCT road_name
FROM
	nearby_roads
LIMIT
	10;
~~~

It looks like the answer is yes; you have sped up this query by about 30%:

~~~
      prime_name
-----------------------
  US Route 9
  State Route 30
  State Route 22 Spur
  State Route 22
  State Route 28
  State Route 86
  State Route 28N
  Interstate 87
  US Route 11
  State Route 421
(10 rows)

Time: 998ms total (execution 998ms / network 0ms)
~~~

To see why, look at the [`EXPLAIN`](explain.html) output:

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN WITH loon_habitat AS (SELECT st_collect(routes.geom) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.ID), nearby_roads AS (SELECT roads.prime_name AS road_name FROM roads, loon_habitat WHERE st_distance(loon_habitat.geom, roads.geom) < 1 ORDER BY st_distance(loon_habitat.geom, roads.geom) ASC LIMIT 20) SELECT DISTINCT road_name FROM nearby_roads LIMIT 10;
~~~

~~~
                                   tree                                   |         field         |              description
--------------------------------------------------------------------------+-----------------------+----------------------------------------
                                                                          | distribution          | full
                                                                          | vectorized            | false
  limit                                                                   |                       |
   │                                                                      | count                 | 10
   └── distinct                                                           |                       |
        │                                                                 | distinct on           | road_name
        └── render                                                        |                       |
             └── limit                                                    |                       |
                  │                                                       | count                 | 20
                  └── sort                                                |                       |
                       │                                                  | order                 | +column49
                       └── render                                         |                       |
                            └── lookup join                               |                       |
                                 │                                        | table                 | roads@primary
                                 │                                        | equality              | (gid) = (gid)
                                 │                                        | equality cols are key |
                                 │                                        | pred                  | st_dwithinexclusive(geom, geom, 1.0)
                                 └── inverted join                        |                       |
                                      │                                   | table                 | roads@roads_geom_idx
                                      └── render                          |                       |
                                           └── group (scalar)             |                       |
                                                └── hash join             |                       |
                                                     │                    | equality              | (route_id) = (id)
                                                     │                    | right cols are key    |
                                                     ├── lookup join      |                       |
                                                     │    │               | table                 | observations@primary
                                                     │    │               | equality              | (id) = (id)
                                                     │    │               | equality cols are key |
                                                     │    └── lookup join |                       |
                                                     │         │          | table                 | observations@observations_bird_id_idx
                                                     │         │          | equality              | (id) = (bird_id)
                                                     │         └── scan   |                       |
                                                     │                    | estimated row count   | 1
                                                     │                    | table                 | birds@birds_name_idx
                                                     │                    | spans                 | [/'Common Loon' - /'Common Loon']
                                                     └── scan             |                       |
                                                                          | estimated row count   | 129
                                                                          | table                 | routes@primary
                                                                          | spans                 | FULL SCAN
(39 rows)
~~~

Based on the output above, you notice the following improvements:

- The [spatial index](spatial-indexes.html) on `roads.geom` is being used by the join between that column and the loon habitat geometry. This is the biggest reason for improved performance, since [the `roads` table](#the-roads-table) has ~225,000 rows.
- You no longer appear to be scanning all ~85,000 rows of [the `birds.observations` table](#the-birds-database) thanks to the index on the `birds.observations.bird_id` column.
- You are probably getting a small speedup from the index on [`birds.birds.name`](#the-birds-database) (although that table is not very large, only about 750 rows).

### (16) How many miles of roads are contained within the portion of the Loon habitat that lies within NY state?

It may not be immediately relevant to your birdwatching or book-buying travels, but a question of general interest that could arise is: How many miles of roads are contained within loon habitat?

To answer this:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE and a query against [the `roads` table](#the-roads-table) that sums the mileage of all roads that are contained within the convex hull of loon habitat.

{{site.data.alerts.callout_info}}
Because you are using `ST_Contains`, the query below only sums the road mileages of roads whose geometries lie entirely within the loon habitat.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS hull
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	sum(roads.miles)
FROM
	roads, loon_habitat
WHERE
	roads.state = 'NY'
	AND st_contains(
			loon_habitat.hull,
			roads.geom
		);
~~~

The answer to your question is that there are about 1,700 miles of roads within the Common Loon's habitat. Further, you can change the `WHERE` clause of the above query slightly to say `AND (NOT (ST_Contains(...)))` to find out how many miles of roads in NY state are _not_ within loon habitat (it's about 14,600).

~~~
          sum
-----------------------
  1704.65731711040306
(1 row)
~~~

### (17) Which bookstore in the Loon's region in NY has the fewest miles of roads within a 10 mile radius of the store?

As you are driving around the Adirondacks, searching for loons as well as your next great read, the question occurs to you: Which bookstore is the most remotely located?  This is important since one of your goals for this vacation is to "get away from it all." You do not have population density data, but you do have road data. Therefore you decide to use "miles of roads near the store" as a rough proxy for which store location is the most remote: the fewer miles of roads near the store, the more remote you can assume it is.

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Build a CTE that joins [the `bookstores` table](#the-bookstores-and-bookstore_routes-tables) and the results of the above subquery to generate a set of bookstores inside the loon's habitat area.
3. Finally, generate a query that joins the results of the above subquery against [the `roads` table](#the-roads-table) based on which roads are within a 10 mile radius. This generates a list of bookstores and the number of miles of nearby roads, sorted in order of which store has the fewest miles of road nearby.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		),
	loon_bookstores
		AS (
			SELECT
				bookstores.name,
				address,
				bookstores.geom AS geom
			FROM
				bookstores, loon_habitat
			WHERE
				st_contains(
					loon_habitat.geom,
					bookstores.geom
				)
		)
SELECT
	loon_bookstores.name,
	address,
	sum(roads.miles)::INT AS nearby_road_miles
FROM
	roads, loon_bookstores
WHERE
	st_distance(
		loon_bookstores.geom,
		roads.geom
	)
	< (10 / 69)
GROUP BY
	loon_bookstores.name, address
ORDER BY
	nearby_road_miles ASC;
~~~

You get an answer, but unfortunately it's rather slow: about 6 seconds!

~~~
                        name                       |                    address                     | nearby_road_miles
---------------------------------------------------+------------------------------------------------+--------------------
  The Bookstore Plus Music &amp; Art               | 2491 Main St, Lake Placid, NY, 12946           |                40
  The Book Nook (Saranac Lake, NY)                 | 7 Broadway, Saranac Lake, NY, 12983            |                81
  Blacktree Books                                  | 5006 State Highway 23, Oneonta, NY, 13820      |               106
  The Green Toad Bookstore                         | 198 Main St, Oneonta, NY, 13820                |               107
  Gansevoort House Books at Gems Along the Mohawk  | 800 Mohawk St, Herkimer, NY, 13350             |               136
  Gansevoort House Books at The Shoppes at 25 West | 25 W Mill Street, Little Falls, NY, 13365      |               155
  The Treehouse Reading and Arts Center            | 587 Main St Ste 304, New York Mills, NY, 13417 |               156
  Mysteries On Main Street                         | 144 W Main St, Johnstown, NY, 12095            |               172
(8 rows)

Time: 6.214s total (execution 6.214s / network 0.000s)
~~~

Let's look at the `EXPLAIN` output to see if there is something that can be done to improve this query's performance:

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN WITH loon_habitat AS (SELECT st_convexhull(st_collect(routes.geom)) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), loon_bookstores AS (SELECT bookstores.name, address, bookstores.geom AS geom FROM bookstores, loon_habitat WHERE st_contains(loon_habitat.geom, bookstores.geom)) SELECT loon_bookstores.name, address, sum(roads.miles)::INT AS nearby_road_miles FROM roads, loon_bookstores WHERE st_distance(loon_bookstores.geom, roads.geom) < (10 / 69) GROUP BY loon_bookstores.name, address ORDER BY nearby_road_miles ASC;
~~~

~~~
                              tree                              |         field         |                     description
----------------------------------------------------------------+-----------------------+-------------------------------------------------------
                                                                | distribution          | full
                                                                | vectorized            | true
  sort                                                          |                       |
   │                                                            | order                 | +nearby_road_miles
   └── render                                                   |                       |
        └── group                                               |                       |
             │                                                  | group by              | name, address
             └── cross join                                     |                       |
                  │                                             | pred                  | st_dwithinexclusive(geom, geom, 0.14492753623188406)
                  ├── scan                                      |                       |
                  │                                             | estimated row count   | 225838
                  │                                             | table                 | roads@primary
                  │                                             | spans                 | FULL SCAN
                  └── render                                    |                       |
                       └── cross join                           |                       |
                            │                                   | pred                  | st_contains(geom, geom)
                            ├── scan                            |                       |
                            │                                   | estimated row count   | 2913
                            │                                   | table                 | bookstores@primary
                            │                                   | spans                 | FULL SCAN
                            └── render                          |                       |
                                 └── group (scalar)             |                       |
                                      └── hash join             |                       |
                                           │                    | equality              | (route_id) = (id)
                                           │                    | right cols are key    |
                                           ├── lookup join      |                       |
                                           │    │               | table                 | observations@primary
                                           │    │               | equality              | (id) = (id)
                                           │    │               | equality cols are key |
                                           │    └── lookup join |                       |
                                           │         │          | table                 | observations@observations_bird_id_idx
                                           │         │          | equality              | (id) = (bird_id)
                                           │         └── scan   |                       |
                                           │                    | estimated row count   | 1
                                           │                    | table                 | birds@birds_name_idx
                                           │                    | spans                 | [/'Common Loon' - /'Common Loon']
                                           └── scan             |                       |
                                                                | estimated row count   | 129
                                                                | table                 | routes@primary
                                                                | spans                 | FULL SCAN
(40 rows)
~~~

Looking at these results from the bottom up, you can see that:

1. There is a full table scan happening on the `birds.birds.routes` table. Since it's so small (129 rows), let's move on for now.
2. There is a full table scan on the `bookstores` table. Since the predicate is [`ST_Contains`](st_contains.html), you probably need to add a [spatial index](spatial-indexes.html) on `bookstores.geom`.
3. There is a full table scan happening on the `roads` table. This is a serious problem due to the size of that table: ~225,000 rows. You already have an index on the `roads.geom` column for the `ST_DWithin` predicate to use, so you need to find another way to reduce the number of rows scanned. You can do what you did in [query 16][q_16] and add a check that the `roads.state = 'NY'`, since you are only looking at roads inside New York State.

Based on these observations, you add an index to the `bookstores.geom` column:

{% include copy-clipboard.html %}
~~~ sql
CREATE INDEX ON bookstores USING GIST(geom);
~~~

After adding the index, you modify your query as shown below to filter on `roads.state`.  This looks only at roads in New York (as in [query 16][q_16]):

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_convexhull(st_collect(routes.geom))
					AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		),
	loon_bookstores
		AS (
			SELECT
				bookstores.name,
				address,
				bookstores.geom AS geom
			FROM
				bookstores, loon_habitat
			WHERE
				st_contains(
					loon_habitat.geom,
					bookstores.geom
				)
		)
SELECT
	loon_bookstores.name,
	address,
	sum(roads.miles)::INT8 AS nearby_road_miles
FROM
	roads, loon_bookstores
WHERE
	roads.state = 'NY'
	AND st_distance(
			roads.geom,
			loon_bookstores.geom
		)
		< (10 / 69)
GROUP BY
	loon_bookstores.name, address
ORDER BY
	nearby_road_miles ASC;
~~~

The steps above brings your query execution down to about 400ms!

~~~
                        name                       |                    address                     | nearby_road_miles
---------------------------------------------------+------------------------------------------------+--------------------
  The Bookstore Plus Music &amp; Art               | 2491 Main St, Lake Placid, NY, 12946           |                40
  The Book Nook (Saranac Lake, NY)                 | 7 Broadway, Saranac Lake, NY, 12983            |                81
  Blacktree Books                                  | 5006 State Highway 23, Oneonta, NY, 13820      |               106
  The Green Toad Bookstore                         | 198 Main St, Oneonta, NY, 13820                |               107
  Gansevoort House Books at Gems Along the Mohawk  | 800 Mohawk St, Herkimer, NY, 13350             |               136
  Gansevoort House Books at The Shoppes at 25 West | 25 W Mill Street, Little Falls, NY, 13365      |               155
  The Treehouse Reading and Arts Center            | 587 Main St Ste 304, New York Mills, NY, 13417 |               156
  Mysteries On Main Street                         | 144 W Main St, Johnstown, NY, 12095            |               172
(8 rows)

Time: 376ms total (execution 376ms / network 0ms)
~~~

When you look at `EXPLAIN` for the modified query, you see why: the filter on `roads.state='NY'` means you are scanning far fewer columns of the `roads` table (~8,900), and the index on `bookstores.geom` means you are using that index now as well:

{% include copy-clipboard.html %}
~~~ sql
EXPLAIN WITH loon_habitat AS (SELECT st_convexhull(st_collect(routes.geom)) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), loon_bookstores AS (SELECT bookstores.name, address, bookstores.geom AS geom FROM bookstores, loon_habitat WHERE st_contains(loon_habitat.geom, bookstores.geom)) SELECT loon_bookstores.name, address, sum(roads.miles)::INT8 AS nearby_road_miles FROM roads, loon_bookstores WHERE roads.state = 'NY' AND st_distance(roads.geom, loon_bookstores.geom) < (10 / 69) GROUP BY loon_bookstores.name, address ORDER BY nearby_road_miles ASC;
~~~

~~~
                                 tree                                |         field         |                              description
---------------------------------------------------------------------+-----------------------+-------------------------------------------------------------------------
                                                                     | distribution          | full
                                                                     | vectorized            | true
  sort                                                               |                       |
   │                                                                 | order                 | +nearby_road_miles
   └── render                                                        |                       |
        └── group                                                    |                       |
             │                                                       | group by              | name, address
             └── cross join                                          |                       |
                  │                                                  | pred                  | st_dwithinexclusive(geom, geom, 0.14492753623188406)
                  ├── index join                                     |                       |
                  │    │                                             | table                 | roads@primary
                  │    └── scan                                      |                       |
                  │                                                  | estimated row count   | 8899
                  │                                                  | table                 | roads@roads_state_idx
                  │                                                  | spans                 | [/'NY' - /'NY']
                  └── render                                         |                       |
                       └── lookup join                               |                       |
                            │                                        | table                 | bookstores@primary
                            │                                        | equality              | (id) = (id)
                            │                                        | equality cols are key |
                            │                                        | pred                  | st_contains(geom, geom)
                            └── inverted join                        |                       |
                                 │                                   | table                 | bookstores@bookstores_geom_idx
                                 └── render                          |                       |
                                      └── group (scalar)             |                       |
                                           └── hash join             |                       |
                                                │                    | equality              | (route_id) = (id)
                                                │                    | right cols are key    |
                                                ├── lookup join      |                       |
                                                │    │               | table                 | observations@primary
                                                │    │               | equality              | (id) = (id)
                                                │    │               | equality cols are key |
                                                │    └── lookup join |                       |
                                                │         │          | table                 | observations@observations_bird_id_idx
                                                │         │          | equality              | (id) = (bird_id)
                                                │         └── scan   |                       |
                                                │                    | estimated row count   | 1
                                                │                    | table                 | birds@birds_name_idx
                                                │                    | spans                 | [/'Common Loon' - /'Common Loon']
                                                └── scan             |                       |
                                                                     | estimated row count   | 129
                                                                     | table                 | routes@primary
                                                                     | spans                 | FULL SCAN
~~~

## Step 8. Find other birds

### (18) What are the hawks sighted in the same region as the Common Loon?

If you get tired of looking for Common Loons (and it's understandable that you might), you may want to widen your search to other types of birds. You have already looked at [different bird species based on frequency of observation][q_13]. Now you turn your attention to a specific type of bird: hawks.

Due to your long birdwatching experience, you recall that hawks are in the family "Accipitridae". You can use this knowledge to answer the question: What hawks live in the same region as the Common Loon in New York State?

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above subquery with [the `birds` database](#the-birds-database) to find the names and observation counts of the birds that:
  1. Are in the family "Accipitridae".
  2. Have sighting locations whose geometry is contained by the hull describing the Common Loon's habitat.
3. Order the birds in the list by how frequently they are sighted, since you may want to look for the most common hawks first.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_collect(routes.geom) AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	birds.name, sum(birds.observations.count) AS sightings
FROM
	birds.birds,
	birds.observations,
	birds.routes,
	loon_habitat
WHERE
	birds.family = 'Accipitridae'
	AND birds.id = observations.bird_id
	AND observations.route_id = routes.id
	AND st_contains(loon_habitat.geom, routes.geom)
GROUP BY
	birds.name
ORDER BY
	sightings DESC;
~~~

Based on this data, it looks like the most commonly sighted hawk by far in the area over the years 2000-2019 is the <a href="https://ebird.org/species/brwhaw" data-proofer-ignore>Broad-winged Hawk</a>:

~~~
          name         | sightings
-----------------------+------------
  Broad-winged Hawk    |       115
  Red-tailed Hawk      |        33
  Northern Harrier     |        12
  Red-shouldered Hawk  |        11
  Sharp-shinned Hawk   |         9
  Bald Eagle           |         9
  Cooper Hawk          |         7
  Northern Goshawk     |         5
  unid. Accipiter hawk |         1
(9 rows)
~~~

### (19) What if you also want to look for owls as well as hawks?

If you are a fan of owls as well as hawks, you can make several updates to [the previous query][q_18], which just looked for hawks. In particular, you want to group the hawks together and the owls together.

To answer this question:

1. Build a CTE that returns the [convex hull](st_convexhull.html) of Common Loon habitat.
2. Join the results of the above subquery with [the `birds` database](#the-birds-database) to find the names and observation counts of the birds that:
  1. Are in the family "Accipitridae" (hawks) _or_ the family "Strigidae" (owls).
  2. Have sighting locations whose geometry is contained by the hull describing the Common Loon's habitat.
3. Group the birds by name and family, and within each grouping order the birds by how frequently they are sighted, since you may want to look for the most common hawks or owls first.

{% include copy-clipboard.html %}
~~~ sql
WITH
	loon_habitat
		AS (
			SELECT
				st_collect(routes.geom) AS geom
			FROM
				birds.birds,
				birds.observations,
				birds.routes
			WHERE
				birds.name = 'Common Loon'
				AND birds.id = observations.bird_id
				AND observations.route_id = routes.id
		)
SELECT
	birds.name,
	birds.family,
	sum(birds.observations.count) AS sightings
FROM
	birds.birds,
	birds.observations,
	birds.routes,
	loon_habitat
WHERE
	(
		birds.family = 'Accipitridae'
		OR birds.family = 'Strigidae'
	)
	AND birds.id = observations.bird_id
	AND observations.route_id = routes.id
	AND st_contains(loon_habitat.geom, routes.geom)
GROUP BY
	birds.name, birds.family
ORDER BY
	birds.family, sightings DESC;
~~~

~~~
          name          |    family    | sightings
------------------------+--------------+------------
  Broad-winged Hawk     | Accipitridae |       115
  Red-tailed Hawk       | Accipitridae |        33
  Northern Harrier      | Accipitridae |        12
  Red-shouldered Hawk   | Accipitridae |        11
  Sharp-shinned Hawk    | Accipitridae |         9
  Bald Eagle            | Accipitridae |         9
  Cooper Hawk           | Accipitridae |         7
  Northern Goshawk      | Accipitridae |         5
  unid. Accipiter hawk  | Accipitridae |         1
  Barred Owl            | Strigidae    |        44
  Eastern Screech-Owl   | Strigidae    |         3
  Great Horned Owl      | Strigidae    |         1
  Northern Saw-whet Owl | Strigidae    |         1
(13 rows)
~~~

## Next steps

Now that you are familiar with writing and tuning spatial queries, you are ready for the following steps:

- Learn more details about the [spatial features](spatial-features.html) supported by CockroachDB.

- Learn how to migrate spatial data from [shapefiles](migrate-from-shapefiles.html), [GeoPackages](migrate-from-geopackage.html), [GeoJSON](migrate-from-geojson.html), or [OpenStreetMap](migrate-from-openstreetmap.html) into CockroachDB.

- Learn how CockroachDB's [spatial indexes](spatial-indexes.html) work.

## Appendix

### Spatial features and corresponding queries

The queries are presented above in a "narrative order" that corresponds roughly to the order in which you might ask questions about bookstores and loon habitat as you plan for your vacation.

However, you may just want to see what queries are exercising a specific [spatial feature](spatial-features.html) supported by CockroachDB. The table below provides a mapping from a feature (such as 'spatial indexing' or 'spatial joins') to the queries that use that feature.

| Feature                      | Queries                                                                                                                                                | Description(s)                                                                                                                                                            |
|------------------------------+--------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Spatial data set preparation | N/A                                                                                                                                                    | For information about how this data set was prepared, see the relevant portions of the [Data set description](#data-set-description).                                     |
| Loading spatial data         | N/A                                                                                                                                                    | For loading instructions on loading the data set, see [Loading the data set](#step-3-load-the-data-set).                                                                      |
| Spatial joins                | [#6][q_06], [#7][q_07], [#8][q_08], [#9][q_09], [#10][q_10], [#13][q_13], [#14][q_14], [#15][q_15], [#16][q_16], [#17][q_17], [#18][q_18], [#19][q_19] | Joins that involve comparing spatial features from two or more tables, usually with a predicate such as [`ST_Contains`](st_contains.html).                                |
| Spatial indexing             | [#15][q_15], [#17][q_17]                                                                                                                               | These queries show explicit spatial index creation; many of the spatial join queries listed above could use these indexes, once created.                                  |
| Spatial relationships        | [#6][q_06], [#7][q_07], [#8][q_08], [#9][q_09], [#10][q_10], [#13][q_13], [#14][q_14], [#15][q_15], [#16][q_16], [#17][q_17], [#18][q_18], [#19][q_19] | Comparing spatial relationships with predicates such as [`ST_Contains`](st_contains.html) and `ST_DWithin`.                                                               |
| Nearest-neighbor searching   | [#15][q_15]                                                                                                                                            | This query shows how to execute a nearest-neighbor search using CockroachDB. |

### Data set description

This section contains an overview of the data sets and how they were constructed and put together. Because this data set is a "compound data set" that is built from several other data sets, there is some complexity to the schema that you will have to navigate.

The data set contains two databases:

- [The `tutorial` database](#the-tutorial-database)
- [The `birds` database](#the-birds-database)

#### The `tutorial` database

The `tutorial` database contains the following tables:

- [The `bookstores` table](#the-bookstores-and-bookstore_routes-tables) stores the independent bookstore information such as name, address, geo-location, etc.
- [The `bookstore_routes` table](#the-bookstores-and-bookstore_routes-tables) is a small table containing just the routes between the local bookstores that lie within the loon's Adirondack habitat (this will be explained in more detail below).
- [The `roads` table](#the-roads-table) is where the U.S. National Atlas road data is kept.

##### The `bookstores` and `bookstore_routes` tables

Below is an entity-relationship diagram showing the `bookstores` and `bookstore_routes` tables (generated using [DBeaver](dbeaver.html)):

<img src="{{ 'images/v22.1/geospatial/tutorial/er-bookstores.png' | relative_url }}" alt="tutorial.bookstores and tutorial.bookstore_routes ER diagrams" style="max-width:100%" />

As mentioned above, the `bookstores` table was created by scraping web data from the [American Booksellers Association website's member directory](https://bookweb.org/member_directory/search/ABAmember). In addition, the `geom` column was constructed by doing some [address geocoding](https://en.wikipedia.org/wiki/Address_geocoding) that converted each bookstore's address to a lon/lat pair and converted to a spatial object using `ST_MakePoint`. For each bookstore, the script did a bit of parsing and geocoding and ran essentially the following query:

{% include copy-clipboard.html %}
~~~ sql
INSERT
INTO
	bookstores
		(
			name,
			url,
			phone,
			address,
			street,
			city,
			state,
			zip,
			description,
			geom
		)
VALUES
	(
		'$name',
		'$url',
		'$phone',
		'$address',
		'$street',
		'$city',
		'$state',
		'$zip',
		'$description',
		(
			SELECT
				st_setsrid(
					st_makepoint('$lon', '$lat'),
					4326
				)
		)
	);
~~~

Similarly, the paths (specifically [MultiLinestrings](multilinestring.html)) between bookstores in the `bookstore_routes` table were also calculated using a script that made use of a simple greedy algorithm to find paths between the bookstores using the `roads` table (described below). The algorithm always looks for the next road that will bring you closer to the destination. It is fine for this small use case, but it is not robust enough for any kind of production use, since it does not perform any backtracking when it gets stuck in a local optimum. The algorithm works as follows, and assumes a starting bookstore _A_ and an ending bookstore _B_:

1. (Start) Find the road nearest _A_; call this road _R_<sub>A</sub>.
2. Find the road nearest the destination _B_; call this road _R_<sub>B</sub>.
3. Do _R_<sub>A</sub> and _R_<sub>B</sub> intersect?  If so, the algorithm is done. You have arrived at your destination. (This is the recursive base case.)
4. Otherwise, find the roads that intersect with _R_<sub>A</sub>. Of these roads, choose the one that passes closest to _R_<sub>B</sub>. Call it _R_<sub>A'</sub>.
5. Do _R_<sub>A'</sub> and _R_<sub>B</sub> intersect?  If so, the algorithm is done. You have arrived at your destination.
6. If the algorithm has arrived at this step without finishing, it goes back to step 4 and applies that step to the current "closest road to destination" _R_<sub>A'</sub>, and keeps operating steps 4-6 recursively until it has found a complete path or it hits some kind of heuristic timeout.

{{site.data.alerts.callout_info}}
For more information about production quality map routing software that uses OpenStreetMap, see [the OpenStreetMap wiki page on Routing](https://wiki.openstreetmap.org/wiki/Routing).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
There are multiple ways to do geocoding. You can use REST API-based services or do the geocoding yourself by processing [TIGER/LINE address data](https://www2.census.gov/geo/tiger/tigerua/) using a library for that purpose. For more information about some of the options available to you, see [this OpenStreetMap wiki page on geocoders](https://wiki.openstreetmap.org/wiki/Search_engines) or [this list of open source geocoding software](http://www.tsusiatsoftware.net/geocode.html).
{{site.data.alerts.end}}

##### The `roads` table

Meanwhile, the `roads` table has many columns; the most important ones used in this tutorial are `state`, `geom`, `miles`, and `prime_name` (the human-readable name of the road).

<img src="{{ 'images/v22.1/geospatial/tutorial/er-roads.png' | relative_url }}" alt="tutorial.roads ER diagrams" style="max-width:100%" />

For more information about what the other columns in `roads` mean, see the [full data set description](https://www.sciencebase.gov/catalog/file/get/581d052be4b08da350d524ce?f=__disk__60%2F6b%2F4e%2F606b4e564884da8cca57ffeb229cd817006616e0&transform=1&allowOpen=true).

{{site.data.alerts.callout_info}}
The `roads` table was imported from a [shapefile](https://prd-tnm.s3.amazonaws.com/StagedProducts/Small-scale/data/Transportation/roadtrl010g.shp_nt00920.tar.gz) using the method described in [Migrate from Shapefiles](migrate-from-shapefiles.html).
{{site.data.alerts.end}}

#### The `birds` database

The `birds` database contains several tables that you will have to [join](joins.html) together in most of the queries shown elsewhere on this page. The multi-table design reflects [the schema of the actual data set](https://www.sciencebase.gov/catalog/file/get/5ea04e9a82cefae35a129d65?f=__disk__b4%2F2f%2Fcf%2Fb42fcfe28a799db6e8c97200829ea1ebaccbf8ea&transform=1&allowOpen=true), which is split across files that map to these tables.

The tables in the `birds` database are diagrammed below:

- `birds` is a list of ~750 bird species. Most queries will use the `name` column.
- `routes` is a list of ~130 prescribed locations that the birdwatchers helping with the survey visit each year. The `geom` associated with each route is a [Point](point.html) marking the latitude and longitude of the route's starting point. For details, see the [schema](https://www.sciencebase.gov/catalog/file/get/5ea04e9a82cefae35a129d65?f=__disk__b4%2F2f%2Fcf%2Fb42fcfe28a799db6e8c97200829ea1ebaccbf8ea&transform=1&allowOpen=true) (search for the text "routes.csv").
- `observations` describes the ~85,000 times and places in which birds of various species were actually seen. The `bird_id` is a [foreign key](foreign-key.html) to the ID in the `birds` table, and the `route_id` points to the ID of the `routes` table.

<img src="{{ 'images/v22.1/geospatial/tutorial/er-birds.png' | relative_url }}" alt="birds.birds, birds.routes, and birds.observations ER diagrams" style="max-width:100%" />

Each of these tables were populated using a script that parsed [the CSV files available for download](https://www.sciencebase.gov/catalog/item/52b1dfa8e4b0d9b325230cd9) and added the data using [`INSERT`](insert.html) statements. For the `routes` table, once again the `ST_MakePoint` function was used to create a geometry from the lon/lat values in the CSV as follows:

{% include copy-clipboard.html %}
~~~ sql
INSERT
INTO
	routes (id, name, country, state, geom)
VALUES
	(
		'$route_id',
		'$route_name',
		'$country',
		'$state',
		(
			SELECT
				st_setsrid(
					st_makepoint('$lon', '$lat'),
					4326
				)
		)
	);
~~~

{{site.data.alerts.callout_info}}
This data is stored in a separate `birds` database due to the fact that it is split into several tables. It could also have been added to the `tutorial` database by naming the tables something like `bird_species`, `bird_routes`, and `bird_observations`.
{{site.data.alerts.end}}

## See also

- [Install CockroachDB](install-cockroachdb.html)
- [Working with Spatial Data](spatial-data.html)
- [Spatial Features](spatial-features.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial & GIS Glossary of Terms](spatial-glossary.html)
- [Working with Spatial Data](spatial-data.html)
- [Migrate from Shapefiles](migrate-from-shapefiles.html)
- [Migrate from GeoJSON](migrate-from-geojson.html)
- [Migrate from GeoPackage](migrate-from-geopackage.html)
- [Migrate from OpenStreetMap](migrate-from-openstreetmap.html)
- [Spatial functions](functions-and-operators.html#spatial-functions)
- [POINT](point.html)
- [LINESTRING](linestring.html)
- [POLYGON](polygon.html)
- [MULTIPOINT](multipoint.html)
- [MULTILINESTRING](multilinestring.html)
- [MULTIPOLYGON](multipolygon.html)
- [GEOMETRYCOLLECTION](geometrycollection.html)
- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [GeoJSON](geojson.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
- [`ST_Contains`](st_contains.html)
- [`ST_ConvexHull`](st_convexhull.html)
- [`ST_CoveredBy`](st_coveredby.html)
- [`ST_Covers`](st_covers.html)
- [`ST_Disjoint`](st_disjoint.html)
- [`ST_Equals`](st_equals.html)
- [`ST_Intersects`](st_intersects.html)
- [`ST_Overlaps`](st_overlaps.html)
- [`ST_Touches`](st_touches.html)
- [`ST_Union`](st_union.html)
- [`ST_Within`](st_within.html)
- [Troubleshooting overview](troubleshooting-overview.html)
- [Support resources](support-resources.html)

<!-- Reference links -->

[q_01]: #1-where-has-the-common-loon-been-sighted-by-the-nabbs-in-the-years-2000-2019-in-ny-state
[q_02]: #2-what-is-the-total-area-of-loon-sightings
[q_03]: #3-how-many-loon-sightings-have-there-been-in-ny-state-in-the-years-2000-2019
[q_04]: #4-how-many-loon-sightings-were-there-in-ny-state-in-just-the-year-2019
[q_05]: #5-what-is-the-density-of-loon-sightings-per-square-mile-in-its-range-as-defined-by-this-data-set-in-2019
[q_06]: #6-what-are-the-bookstores-that-lie-within-the-loons-habitat-range-in-ny-state
[q_07]: #7-how-many-different-species-of-bird-habitats-contain-the-location-of-the-book-nook-in-saranac-lake-ny
[q_08]: #8-which-25-birds-were-most-often-sighted-within-10-miles-of-the-book-nook-in-saranac-lake-ny-during-the-2000-2019-observation-period
[q_09]: #9-what-does-the-shape-of-all-bookstore-locations-that-lie-within-the-loons-habitat-look-like
[q_10]: #10-what-is-the-area-of-the-shape-of-all-bookstore-locations-that-are-in-the-loons-habitat-range-within-ny-state
[q_11]: #11-how-long-is-the-route-from-mysteries-on-main-street-in-johnstown-ny-to-the-book-nook-in-saranac-lake-ny
[q_12]: #12-what-does-the-route-from-mysteries-on-main-street-in-johnstown-ny-to-the-book-nook-in-saranac-lake-ny-look-like
[q_13]: #13-what-were-the-25-most-commonly-sighted-birds-in-2019-within-10-miles-of-the-route-between-mysteries-on-main-street-in-johnstown-ny-and-the-bookstore-plus-in-lake-placid-ny
[q_14]: #14-what-are-the-25-least-often-sighted-other-species-of-birds-in-the-loons-sightings-range
[q_15]: #15-what-are-the-top-10-roads-nearest-to-a-loon-sighting-location-in-ny
[q_16]: #16-how-many-miles-of-roads-are-contained-within-the-portion-of-the-loon-habitat-that-lies-within-ny-state
[q_17]: #17-which-bookstore-in-the-loons-region-in-ny-has-the-fewest-miles-of-roads-within-a-10-mile-radius-of-the-store
[q_18]: #18-what-are-the-hawks-sighted-in-the-same-region-as-the-common-loon
[q_19]: #19-what-if-you-also-want-to-look-for-owls-as-well-as-hawks

<!-- EOF -->
