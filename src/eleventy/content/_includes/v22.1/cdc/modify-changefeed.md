To modify an {{ site.data.products.enterprise }} changefeed, [pause](create-and-configure-changefeeds.html#pause) the job and then use:

~~~ sql
ALTER CHANGEFEED job_id {ADD table DROP table SET option UNSET option};
~~~

You can add new table targets, remove them, set new [changefeed options](create-changefeed.html#options), and unset them.

For more information, see [`ALTER CHANGEFEED`](alter-changefeed.html).
