**What are the bookstores that lie within the Loon's habitat range in NY state?**

Now that you have asked (and answered) some exploratory questions that may inform your birdwatching activities while on vacation, it would be good to start thinking about what bookstores to visit as part of your travels.

A natural question that arises is: given that you are looking for loon habitat, what are the bookstores located within that habitat?

To answer this question:

1. Build a CTE that returns the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is [contained](https://www.cockroachlabs.com/docs/stable/st_contains.html) by the loon habitat. Note that the query below [orders by](https://www.cockroachlabs.com/docs/stable/query-order.html) the store geometries so that stores in the list are clustered by location. This ordering may be useful if you want to travel between nearby stores. For more information about how this ordering is calculated, see [How CockroachDB's spatial indexing works](https://www.cockroachlabs.com/docs/stable/spatial-indexes.html#how-cockroachdbs-spatial-indexing-works).

```sql
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
```{{execute}}

**How many different species of bird habitats contain the location of the Book Nook in Saranac Lake, NY?**

As a birdwatcher, you probably don't want to only see the Common Loon. As long as you are spending time outside, it would be nice to see what other species of bird are in the area. This may provide even more birdwatching fun.

Since you know you will want to hit up [The Book Nook in Saranac Lake, NY](https://www.facebook.com/slbooknook/) at least once on your trip, you decide to see what bird species' habitats contain the store's location. That way you can get a sense of the diversity of bird species in the area.

To answer this question:

1. Build a CTE that returns some information about the bookstore you want to visit.
2. Build another CTE that returns information about the habitats of birds observed in NY state, and collects the habitat geometries together into one geometry.
3. Join the results of the above CTEs and query the count of birds whose habitats contain the location of the bookstore.

Note: The final [`SELECT`](https://www.cockroachlabs.com/docs/stable/selection-queries.html) in the query below is doing a join that will not benefit from [spatial indexing](https://www.cockroachlabs.com/docs/stable/spatial-indexes.html), since both sides of the join are the results of [CTEs](https://www.cockroachlabs.com/docs/stable/common-table-expressions.html), and are therefore not indexed.

```sql
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
```{{execute}}

This is encouraging; there are over 120 species of birds for you to choose from whose habitats include the bookstore you want to visit!

```
  count
---------
    124
(1 row)
```

You can verify the results by checking how many bird species have been sighted by the bird survey overall; you should expect that this number will be much larger than 124, and indeed it is:

```sql
SELECT COUNT(name) FROM birds.birds;
```{{execute}}

```
  count
---------
    756
(1 row)
```

**Which 25 birds were most often sighted within 10 miles of the Book Nook in Saranac Lake, NY during the 2000-2019 observation period?**

It's great that you know how many bird species may be near a given bookstore; however, that query didn't tell you which birds you have the best chance of seeing. Therefore, you'd like to figure out what birds are the most commonly seen in the area near a bookstore you want to visit: The Book Nook in Saranac Lake, NY.

To answer this question:

1. Build a CTE that returns some information about the bookstore you want to visit.
2. Join the results of the above CTE and a query against the `birds` database that lists the names and observation totals (sums) of birds whose habitats are within 10 miles of the location of the bookstore.

Note: The query below can also be written using an explicit `ST_DWithin`, which is an [index-accelerated function](https://www.cockroachlabs.com/docs/stable/spatial-data.html#performance). CockroachDB optimizes `ST_Distance(...) < $some_value` to use `ST_DWithin` (see this query's `EXPLAIN` output for details).

```sql
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
```{{execute}}

Perhaps surprisingly, the [Red-eyed Vireo](https://ebird.org/species/reevir1/US-NY) is the "winner", followed by a number of other fairly common birds. If you want a birdwatching challenge, you can reverse the sort order of the above query to find the rarest birds.

**What does the shape of all bookstore locations that lie within the Loon's habitat look like?**

You already discovered which bookstores are located within loon habitat. However, you can't really tell where these stores are located based on reading that query's output. You need to see them on the map. Therefore, for trip planning purposes, you decide you would like to look at the shape of the convex hull of the store locations.

To answer this question:

1. Build a CTE that returns the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is [contained](https://www.cockroachlabs.com/docs/stable/st_contains.html) by the loon habitat.
3. Collect the geometries that result from the step above into a single geometry, calculate its convex hull, and return the results as [GeoJSON](https://www.cockroachlabs.com/docs/stable/geojson.html).

```sql
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
```{{execute}}

Paste the result into <https://geojson.io> and you should see the shape of the convex hull of the store locations on a map.

**What is the area of the shape of all bookstore locations that are in the Loon's habitat range within NY state?**

You have already visualized the convex hull, but now you would like to calculate its area in square miles.

To answer this question:

1. Build a CTE that returns the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of Common Loon habitat.
2. Join the results of the above CTE with a query against [the `bookstores` table](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html#the-bookstores-and-bookstore_routes-tables) that checks whether a bookstore's location is contained by the loon habitat.
2. Get the area of the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of the resulting geometry.
3. Collect the geometries that result from the step above into a single geometry, calculate its convex hull, and calculate the area of the hull. As in previous examples, note that because the `birds.routes` data uses [SRID 4326](https://www.cockroachlabs.com/docs/stable/srid-4326.html), the resulting area is measured in degrees, which is converted to square miles by casting the data to a `GEOGRAPHY` type and dividing by 1609 (the number of meters in a mile) squared.

```sql
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
```{{execute}}

The result is an area of about 3,500 square miles, which can be visualized by a box with sides that are approximately 60 miles long. This answer can be verified by looking at the last map output and noting that most of the points on the hull are within about 60 miles of each other.

```
       ?column?
----------------------
  3564.1722404508437
(1 row)
```
