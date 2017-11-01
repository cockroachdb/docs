# Goals

https://www.cockroachlabs.com/blog/local-and-distributed-processing-in-cockroachdb/

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- Motivation
- Architecture
- Implementation

/----------------------------------------/

## What is it?

Our tool to leverage parallel processing across your cluster.

/----------------------------------------/

## Motivation

Distributed processing necessary to improve performance of things like joins.

Design influenced by rejection of complexity (we aim to make data easy)

- a multi-tool to perform arbitrary computations close to your data.
- enable correctness, operational simplicity and higher developer productivity at scalable performance

/----------------------------------------/

## Architecture

Goal: Parallelize processing by using node that contains data to perform computations on it

1. When generating plan of Abstract Syntax Trees, CockroachDB also includes a physical plan where the processing is executed.

2. Coordinating node sends processing request to node identified in physical plan.

3. As the physical nodes execute the work, they stream tuple-at-a-time results back to the coordinating node.

/----------------------------------------/

## Implementation

filtering, joins, sorts and aggregations

`RETURNING NOTHING`

# Demo

## Remote-side filtering
Say we want to look at all species of cockroaches; we might use the following query:

~~~
SELECT * FROM life.vernacular WHERE vernacularName LIKE '%roach%';
~~~

We use some magic to look at a diagram of the distributed execution plan:

~~~
SELECT url FROM [EXPLAIN(DISTSQL) SELECT * FROM life.vernacular WHERE vernacularName LIKE '%roach%'];
~~~

## Distributed sorting
We adjust the query above to request an ordering on the name:

~~~
SELECT * FROM life.vernacular WHERE vernacularName LIKE '%roach%' ORDER BY vernacularName;
~~~

## Distributed aggregation

One of the first things often done after loading tables into a database is to count the rows in each table to make sure all the data is there.
~~~
SELECT COUNT(*) FROM life.taxon;
~~~

More interesting

~~~
SELECT phylum, COUNT(*) FROM life.taxon GROUP BY phylum;
~~~

## Joins

~~~
SELECT scientificName
 FROM life.distribution INNER JOIN life.taxon USING (taxonID)
 WHERE locality = 'Romania';
~~~

## Up Next

- Performance optimizations
