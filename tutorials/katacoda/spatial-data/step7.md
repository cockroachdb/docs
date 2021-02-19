**What are the top 10 roads nearest to a Loon sighting location in NY?**

So far, you have learned where the birds are, where the overlaps are between birds and bookstores, and how to travel between bookstores while finding birds.

Now you will start asking questions that involve looking at [the `roads` table](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html#the-roads-table) as well.

Specifically, you would like to know: What are the 10 roads that are closest to a loon observation site?  The answer to this question may help you figure out exactly which roads you should travel down to start the search for loons. The closer a road is to the sighting location, the better: it means there is probably less work to do to see the birds you are looking for.

To answer this question:

1. Build a CTE called `loon_habitat` that collects all of the Common Loon sightings into a single geometry.
2. Build another CTE called `nearby_roads` that joins the results of the subquery above with the `roads` table and pulls out the roads in NY state that are within a degree (about 60 nautical miles). Order the roads returned by their distance from a loon sighting. This will return some duplicate roads (since loons can be sighted multiple times along a single road), which is why you need to `LIMIT` to 20 here so you can get the list down to 10 later. Because the data in the `roads` table has an SRID of 0, you need to use `ST_SetSRID` to set its SRID to [4326](https://www.cockroachlabs.com/docs/stable/srid-4326.html). This step is necessary because `ST_Distance` cannot operate on geometries with differing SRIDs.
3. Finally, query the results of the `nearby_roads` subquery to get a list of 10 distinct road names that you can plan to visit.

Note: The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](https://www.cockroachlabs.com/docs/stable/spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's `EXPLAIN` output for details).

```sql
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
```{{execute}}

Unfortunately, this query is a bit slower than you would like. There are several reasons for this:

1. You haven't created any indexes at all yet. The query is likely to be doing full table scans, which you will need to hunt down with `EXPLAIN`.
2. CockroachDB does not yet have built-in support for index-based nearest neighbor queries. If this feature is important to you, please comment with some information about your use case on [cockroachdb/cockroach#55227](https://github.com/cockroachdb/cockroach/issues/55227).

Let's look at the `EXPLAIN` output to see if there is something that can be done to improve this query's performance:

```sql
EXPLAIN WITH loon_habitat AS (SELECT st_collect(routes.geom) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), nearby_roads AS (SELECT roads.prime_name AS road_name FROM roads, loon_habitat WHERE st_distance(loon_habitat.geom, st_setsrid(roads.geom, 4326)) < 1 ORDER BY st_distance(loon_habitat.geom, st_setsrid(roads.geom, 4326)) ASC LIMIT 20) SELECT DISTINCT road_name FROM nearby_roads LIMIT 10;
```{{execute}}

In the output, you'll see that several full table scans being performed (see `FULL SCAN`). For each table, you have a hypothesis on what is causing the scan; usually the hypothesis is that the table is missing an index.

- For the `roads` table, there is no spatial index on the `road.geom` column. This is probably the worst performance offender of the bunch, since this table has almost a quarter of a million rows. It makes sense that it's quite large, since it represents a road map of the entire United States.
  - In addition to adding an index to `roads.geom`, you will need to update the SRID of the `roads.geom` column to use [SRID 4326](https://www.cockroachlabs.com/docs/stable/srid-4326.html) so it matches the SRID of the loon habitat geometry. Updating the SRID to match will allow you to stop using `ST_SetSRID` on `roads.geom` as shown above, which will keep CockroachDB from taking advantage of the spatial index on that column.
- On the `birds.observations` table, there is no index on the `birds.observations.route_id` or `birds.observations.bird_id` columns, which are used for all bird information lookups.
- On the `birds.birds` table, there is no index on the `birds.birds.name` column which you're filtering on (this is also used by almost all of your other bird-related queries).

Based on these hypotheses, you take the following steps:

1. Add an index to the `roads.geom` column. Note that creating the index on `roads.geom` takes about a minute on a single-node `cockroach demo` cluster, since the table is relatively large.

    ```sql
    CREATE INDEX ON roads USING GIST(geom);
    ```{{execute}}

2. Update the SRID of the `roads.geom` column from 0 to [4326](srid-4326.html). This will take a few seconds.

    ```sql
    UPDATE roads SET geom = st_transform(st_setsrid(geom, 4326), 4326) WHERE gid IS NOT NULL RETURNING NOTHING;
    ```{{execute}}

3. Add indexes on the `birds.observations.route_id` and `birds.observations.bird_id` columns:

    ```sql
    CREATE INDEX ON birds.observations(bird_id);
    ```{{execute}}

    ```sql
    CREATE INDEX ON birds.observations(route_id);
    ```{{execute}}

4. Add an index on the `birds.birds.name` column:

    ```sql
    CREATE INDEX ON birds.birds(name);
    ```{{execute}}

Did adding all of these indexes and updating the road geometry SRIDs make this query any faster?  Let's check. Note that the query below has been modified to no longer use the `ST_SetSRID` function.

```sql
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
```{{execute}}

It looks like the answer is yes; you have sped up this query by about 30%:

To see why, look at the `EXPLAIN` output:

```sql
EXPLAIN WITH loon_habitat AS (SELECT st_collect(routes.geom) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.ID), nearby_roads AS (SELECT roads.prime_name AS road_name FROM roads, loon_habitat WHERE st_distance(loon_habitat.geom, roads.geom) < 1 ORDER BY st_distance(loon_habitat.geom, roads.geom) ASC LIMIT 20) SELECT DISTINCT road_name FROM nearby_roads LIMIT 10;
```{{execute}}

In the output, you'll notice the following improvements:

- The spatial index on `roads.geom` is being used by the join between that column and the loon habitat geometry. This is the biggest reason for improved performance, since the `roads` table has ~225,000 rows.
- You no longer appear to be scanning all ~85,000 rows of the `birds.observations` table thanks to the index on the `birds.observations.bird_id` column.
- You are probably getting a small speedup from the index on `birds.birds.name` (although that table is not very large, only about 750 rows).

**How many miles of roads are contained within the portion of the Loon habitat that lies within NY state?**

It may not be immediately relevant to your birdwatching or book-buying travels, but a question of general interest that could arise is: How many miles of roads are contained within loon habitat?

To answer this:

1. Build a CTE that returns the convex hull of Common Loon habitat.
2. Join the results of the above CTE and a query against the `roads` table that sums the mileage of all roads that are contained within the convex hull of loon habitat.

Note: Because you are using `ST_Contains`, the query below only sums the road mileages of roads whose geometries lie entirely within the loon habitat.

```sql
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
```{{execute}}

The answer to your question is that there are about 1,700 miles of roads within the Common Loon's habitat. Further, you can change the `WHERE` clause of the above query slightly to say `AND (NOT (ST_Contains(...)))` to find out how many miles of roads in NY state are _not_ within loon habitat (it's about 14,600).

```
          sum
-----------------------
  1704.65731711040306
(1 row)
```

**Which bookstore in the Loon's region in NY has the fewest miles of roads within a 10 mile radius of the store?**

As you are driving around the Adirondacks, searching for loons as well as your next great read, the question occurs to you: Which bookstore is the most remotely located?  This is important since one of your goals for this vacation is to "get away from it all." You don't have population density data, but you do have road data. Therefore you decide to use "miles of roads near the store" as a rough proxy for which store location is the most remote: the fewer miles of roads near the store, the more remote you can assume it is.

To answer this question:

1. Build a CTE that returns the convex hull of Common Loon habitat.
2. Build a CTE that joins the `bookstores` table and the results of the above subquery to generate a set of bookstores inside the loon's habitat area.
3. Finally, generate a query that joins the results of the above subquery against the `roads` table based on which roads are within a 10 mile radius. This generates a list of bookstores and the number of miles of nearby roads, sorted in order of which store has the fewest miles of road nearby.

```sql
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
```{{execute}}

You get an answer, but unfortunately it's rather slow.

Let's look at the `EXPLAIN` output to see if there is something that can be done to improve this query's performance:

```sql
EXPLAIN WITH loon_habitat AS (SELECT st_convexhull(st_collect(routes.geom)) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), loon_bookstores AS (SELECT bookstores.name, address, bookstores.geom AS geom FROM bookstores, loon_habitat WHERE st_contains(loon_habitat.geom, bookstores.geom)) SELECT loon_bookstores.name, address, sum(roads.miles)::INT AS nearby_road_miles FROM roads, loon_bookstores WHERE st_distance(loon_bookstores.geom, roads.geom) < (10 / 69) GROUP BY loon_bookstores.name, address ORDER BY nearby_road_miles ASC;
```{{execute}}

In the results, looking from the bottom up, you can see that:

1. There is a full table scan happening on the `birds.birds.routes` table. Since it's so small (129 rows), let's move on for now.
2. There is a full table scan on the `bookstores` table. Since the predicate is `ST_Contains`, you probably need to add a spatial index on `bookstores.geom`.
3. There is a full table scan happening on the `roads` table. This is a serious problem due to the size of that table: ~225,000 rows. You already have an index on the `roads.geom` column for the `ST_DWithin` predicate to use, so you need to find another way to reduce the number of rows scanned. You can do what you did in the previous query and add a check that the `roads.state = 'NY'`, since you are only looking at roads inside New York State.

Based on these observations, you add an index to the `bookstores.geom` column:

```sql
CREATE INDEX ON bookstores USING GIST(geom);
```{{execute}}

After adding the index, you modify your query as shown below to filter on `roads.state`.  This looks only at roads in New York:

```sql
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
```{{execute}}

The steps above brings your query execution down to about 400ms!

When you look at `EXPLAIN` for the modified query, you see why: the filter on `roads.state='NY'` means you are scanning far fewer columns of the `roads` table (~8,900), and the index on `bookstores.geom` means you are using that index now as well:

```sql
EXPLAIN WITH loon_habitat AS (SELECT st_convexhull(st_collect(routes.geom)) AS geom FROM birds.birds, birds.observations, birds.routes WHERE birds.name = 'Common Loon' AND birds.id = observations.bird_id AND observations.route_id = routes.id), loon_bookstores AS (SELECT bookstores.name, address, bookstores.geom AS geom FROM bookstores, loon_habitat WHERE st_contains(loon_habitat.geom, bookstores.geom)) SELECT loon_bookstores.name, address, sum(roads.miles)::INT8 AS nearby_road_miles FROM roads, loon_bookstores WHERE roads.state = 'NY' AND st_distance(roads.geom, loon_bookstores.geom) < (10 / 69) GROUP BY loon_bookstores.name, address ORDER BY nearby_road_miles ASC;
```{{execute}}
