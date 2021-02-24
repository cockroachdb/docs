In this tutorial, you will plan a vacation from New York City to the [Adirondack Mountains](https://visitadirondacks.com/about) in northern New York State to do some birdwatching while visiting local independent bookstores. In the process, you will explore several of CockroachDB's [spatial capabilities](https://www.cockroachlabs.com/docs/stable/spatial-features.html):

+ Importing spatial data from SQL files (including how to build spatial geometries from data in CSV files).
+ Putting together separate spatial data sets to ask and answer potentially interesting questions.
+ Using various [built-in functions](https://www.cockroachlabs.com/docs/stable/functions-and-operators.html#spatial-functions) for operating on spatial data.
+ Creating [indexes](https://www.cockroachlabs.com/docs/stable/spatial-indexes.html) on spatial data.
+ Performing [joins](https://www.cockroachlabs.com/docs/stable/joins.html) on spatial data, and using [`EXPLAIN`](https://www.cockroachlabs.com/docs/stable/explain.html) to make sure indexes are effective.
+ Visualizing the output of your queries using free tools like [https://geojson.io](https://geojson.io).

To get you started, we're installing CockroachDB and starting a single-node demo cluster, pre-loaded with a database called `movr`.

Once you see the `movr>` prompt, click **Continue**.
