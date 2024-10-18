## Index Details Page

To view this page, click on a index name on the [Indexes List Tab](#indexes-list-tab) of the [Table Details Page](#table-details-page).

The **Index** page displays the SQL statement used to [create the index]({% link {{ version_prefix }}/create-index.md %}) and an index’s details. The page also allows [admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role) to [**Reset all index stats**](#reset-all-index-statistics).

The following information is displayed for the index:

 Detail               | Description
----------------------|-------------
Total Reads           | The number of times the index was read since index statistics were reset.
Last Read             | The time the index was created, last read, or index statistics were reset.
Index Recommendations | A [recommendation](#index-recommendations) to drop the index if it is unused.

### Index Usage

The **Index Usage** table displays a list of the most executed statement fingerprints using this index. This table is only visible to [Admin users]({% link {{ version_prefix }}/security-reference/authorization.md %}#admin-role). The information displayed for each statement fingerprint is similar to the table on the [**Statements**]({% link {{ version_prefix }}/ui-statements-page.md %}#statements-table) page.