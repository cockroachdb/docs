**How long is the route from Mysteries on Main Street in Johnstown, NY to The Book Nook in Saranac Lake, NY?**

So far, you have written queries that ask questions about bird habitats, bookstore locations, or some combination of the two. Because you are planning a trip, you want to think about how to travel between the bookstores in the loon habitat area. Depending on how far apart the bookstores are, you may want to visit more than one of them in a day, perhaps doing some birdwatching along the way.

In order to accomplish this, you start looking at the `bookstore_routes` table to see how far the distance is in miles between two of the bookstores you'd like to visit.

To answer this question:

1. Issue subqueries that find the IDs of two of the bookstores you'd like to travel between, as start and end points.
2. Measure the length of the geometry that corresponds to those start and end IDs. Note that because the `bookstore_routes.geom` column has a SRID of 0 (which it inherited from the `roads` database from which it was created), you can convert to miles by casting the data to a `GEOGRAPHY` type, which uses meters, and then dividing by 1609 (the number of meters in a mile).

```sql
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
```{{execute}}

The answer is: these two stores are about 132 miles apart, measured in road miles.

```
      ?column?
---------------------
  132.6837073049756
(1 row)
```

**What does the route from Mysteries on Main Street in Johnstown, NY to The Book Nook in Saranac Lake, NY look like?**

You have determined how long the drive between these two stores will be, but you would like to see what it looks like on the map.

To find this out, you can re-use the query from the previous question, using `ST_AsGeoJSON` instead of `ST_Length`, and skipping the distance math to generate output in miles.

```sql
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
```{{execute}}

The result is a very large chunk of JSON. Paste it into <https://geojson.io> to see the drive between these two stores on a map.

**What were the 25 most-commonly-sighted birds in 2019 within 10 miles of the route between Mysteries on Main Street in Johnstown, NY and The Bookstore Plus in Lake Placid, NY?**

A natural question that arises once you start traveling between stores is: if I decide to visit two of these stores in a day, and do some birdwatching in between, what are some of the bird species I may expect to find? In this case you are looking at what species are near the route between [Mysteries on Main Street in Johnstown, NY](https://www.facebook.com/MysteriesOnMainStreet), and [The Bookstore Plus in Lake Placid, NY](http://www.thebookstoreplus.com).

To answer this question:

1. Build a CTE that returns the route between the two stores of interest (a geometry).
2. Join the results of the above CTE with a query against the `birds` database that checks whether the distance between the route geometry and the location of the bird observation (`birds.routes.geom`) bookstore's location is less than the desired length of 10 miles. Note that because the call to `ST_Distance` is operating on shapes cast to `GEOGRAPHY` data type, the results are in meters, which then have to be converted to miles by dividing the result by 1609 (the number of meters in a mile).

Note: The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](https://www.cockroachlabs.com/docs/stable/spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's `EXPLAIN` output for details).

```sql
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
```{{execute}}

**What are the 25 least often sighted other species of birds in the loon's sightings range?**

Since you are already looking for loons, you would like to know if there are other, more challenging birdwatching opportunities available within the loon habitat you are already visiting. Specifically, you would like to know: What are the least-often-observed bird species in the loon's habitat?

To answer this question:

1. Build a CTE that returns the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE and a query against the `birds` database that lists the names and observation totals (sums) of birds whose habitats are contained within the convex hull of loon habitat.

```sql
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
```{{execute}}
