## Index

To view this page, click on a index name on the [**Table Indexes**](#table-indexes) page.

The **Index** page displays the SQL statement used to [create the index]({% link {{ version_prefix }}/create-index.md %}), an index’s details with possible  recommendations.

the number of times the index was read since index statistics were reset, the time the index was last read, and the reason for the index recommendation. [Admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) also see a list of executed statement fingerprints using the index.

The following information is displayed for the index:

 Detail         | Description
----------------|-------------
Total Reads     | The number of times the index was read since index statistics were reset.
Last Read       | The time the index was created, last read, or index statistics were reset.
Recommendations | A recommendation to drop the index if it is unused.

### Index Usage

The **Index Usage** table displays a list of the most executed statement fingerprints using this index.

The following information is displayed for each statement fingerprint:

Detail          | Description
----------------|-------------
TODO | 