**Where has the Common Loon been sighted by the NABBS in the years 2000-2019 in NY state?**

As a first step, you'd like to know where exactly the Common Loon has been sighted in New York State. You know that many of the loon sightings will have taken place in the Adirondacks (our overall destination) due to the nature of the loon's preferred habitat of northern lakes and ponds, but it will be useful to know the precise locations for trip planning, and for asking further related questions about other bird habitats as well as nearby bookstores you'd like to visit.

Because of the structure of [the `birds` database](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html#the-birds-database), you will wrap the results of a [subquery](https://www.cockroachlabs.com/docs/stable/subqueries.html) against the `birds` database in a [common table expression (CTE)](https://www.cockroachlabs.com/docs/stable/common-table-expressions.html) to provide a shorthand name for referring to this data. This step will be necessary every time you want to get information about bird sightings. Therefore, the general pattern for many of these queries will be something like:

1. Get bird information (usually including location data) and store the results in a named CTE.
2. Using the named CTE, perform additional processing against the results of the CTE combined with other data you have (e.g. bookstores, roads). Depending on the complexity of the questions asked, you may even need to create multiple CTEs.

In the query below, to answer the question "where are the loons?", take the following steps:

1. Join `birds.birds`, `birds.routes`, and `birds.observations` on the bird ID and route IDs where the bird name is "Common Loon".
2. Collect the resulting birdwatcher route geometries (`routes.geom`) into one geometry (a [MultiPoint](https://www.cockroachlabs.com/docs/stable/multipoint.html)).
3. Give the resulting table a name, `loon_sightings`, and query against it. In this case the query is rather simple: since the geometries have been collected into one in step 2 above, output the geometry as [GeoJSON](https://www.cockroachlabs.com/docs/stable/geojson.html) so the result can be pasted into [https://geojson.io](https://geojson.io) to generate a map of the sightings.

```sql
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
```{{execute}}

Paste the result into <https://geojson.io> and you will see a map with gray markers for each loon sighting from the bird survey.

**What is the total area of Loon sightings?**

Now that you have some sense of how loon sightings are distributed across the state, you may wonder: What is the area of the loon's approximate habitat (per these sightings) in New York State?

To find the answer:

1. Collect the geometries of all loon sightings together in a CTE as one geometry.
2. Get the area of the [convex hull](https://www.cockroachlabs.com/docs/stable/st_convexhull.html) of the resulting geometry.
3. Because the `birds.routes` data uses [SRID 4326](https://www.cockroachlabs.com/docs/stable/srid-4326.html), the resulting area is measured in degrees, which can be converted to square miles by casting the data to a `GEOGRAPHY` type and dividing by 1609 (the number of meters in a mile) squared.

```sql
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
```{{execute}}

The result is an area of about 10,000 square miles, which can be visualized by a box with sides that are a little over 100 miles long. This answer can be verified by looking at the map output from before and noting that most of the observation locations are well within 100 miles of each other.

```
       ?column?
----------------------
  10430.691899422598
(1 row)
```

**How many Loon sightings have there been in NY state in the years 2000-2019?**

In addition to the loon observation point locations and the area of those observations (which you can take as a proxy for the size of the loon's local habitat), you may want to know exactly how many times a loon has been sighted in the area.

To find the answer:

1. Join `birds.birds` and `birds.observations` on the bird ID where the bird name is "Common Loon".
2. Sum all of the sightings; the `GROUP BY` on bird names is necessary due to the use of the `sum` aggregate function.

```sql
SELECT
	birds.name, sum(observations.count) AS sightings
FROM
	birds.birds, birds.observations
WHERE
	birds.name = 'Common Loon'
	AND birds.id = observations.bird_id
GROUP BY
	birds.name;
```{{execute}}

```
     name     | sightings
--------------+------------
  Common Loon |       269
(1 row)
```

**How many Loon sightings were there in NY state in just the year 2019?**

You might like to get a sense of how many of the loon sightings were more recent. For example, if there have been fewer sightings of loons in recent years, you might wonder if the population were declining in NY State.

To determine how many sightings there were in NY state in 2019, re-use the previous query, with the additional constraint that the observation year is 2019.

```sql
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
```{{execute}}

If the sightings are evenly distributed, you might expect this to yield about 13 sightings. In fact, it's pretty close. This suggests that the loon population may have remained fairly stable over the years 2000-2019.

```
     name     | sightings
--------------+------------
  Common Loon |        12
(1 row)
```

**What is the density of Loon sightings per square mile in its range as defined by this data set in 2019?**

Since you are planning to do some hiking back into the woods to find the actual loons, you may get curious as to how densely the loon population is scattered over its habitat. From a practical perspective, the distribution is not actually even, since loons are most frequently located on lakes and ponds. Even so, it may serve as a useful proxy for the general areas in which to focus your birdwatching travels.

To answer this question:

1. Build a CTE that returns both the convex hull of loon habitat, as well as the sum of all loon observations in NY.
2. Query the result table of the CTE from step 1 to divide the number of sightings by the area of the loon's habitat (the convex hull). Do some arithmetic to convert from the unit of degrees returned by [SRID 4326](https://www.cockroachlabs.com/docs/stable/srid-4326.html) to square miles.

```sql
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
```{{execute}}

It turns out that this is a pretty small number. There are not very many loon sightings per square mile within its overall habitat area, since lakes and ponds make up a small portion of the physical space inside the convex hull of observations.

```
        ?column?
------------------------
  0.005078531189694916
(1 row)
```
