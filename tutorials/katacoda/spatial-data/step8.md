**What are the hawks sighted in the same region as the Common Loon?**

If you get tired of looking for Common Loons (and it's understandable that you might), you may want to widen your search to other types of birds. You have already looked at different bird species based on frequency of observation. Now you turn your attention to a specific type of bird: hawks.

Due to your long birdwatching experience, you recall that hawks are in the family "Accipitridae". You can use this knowledge to answer the question: What hawks live in the same region as the Common Loon in New York State?

To answer this question:

1. Build a CTE that returns the convex hull of Common Loon habitat.
2. Join the results of the above subquery with the `birds` database to find the names and observation counts of the birds that:
  1. Are in the family "Accipitridae".
  2. Have sighting locations whose geometry is contained by the hull describing the Common Loon's habitat.
3. Order the birds in the list by how frequently they are sighted, since you may want to look for the most common hawks first.

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
```{{execute}}

Based on this data, it looks like the most commonly sighted hawk by far in the area over the years 2000-2019 is the [Broad-winged Hawk](https://ebird.org/species/brwhaw):

```
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
```

**What if you also want to look for owls as well as hawks?**

If you are a fan of owls as well as hawks, you can make several updates to the previous query, which just looked for hawks. In particular, you want to group the hawks together and the owls together.

To answer this question:

1. Build a CTE that returns the convex hull of Common Loon habitat.
2. Join the results of the above subquery with the `birds` database to find the names and observation counts of the birds that:
  1. Are in the family "Accipitridae" (hawks) _or_ the family "Strigidae" (owls).
  2. Have sighting locations whose geometry is contained by the hull describing the Common Loon's habitat.
3. Group the birds by name and family, and within each grouping order the birds by how frequently they are sighted, since you may want to look for the most common hawks or owls first.

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
```{{execute}}
