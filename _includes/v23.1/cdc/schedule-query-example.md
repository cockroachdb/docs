This example creates a nightly export of some filtered table data with a [scheduled changefeed](create-schedule-for-changefeed.html) that will run just after midnight every night. The changefeed uses [CDC queries](cdc-queries.html) to query the table and filter the data it will send to the sink: 

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE SCHEDULE sf_skateboard FOR CHANGEFEED INTO 'external://cloud-sink' WITH format=csv 
  AS SELECT current_location AS sf_address, id, type, status FROM vehicles 
  WHERE city = 'san francisco' AND type = 'skateboard' 
  RECURRING '1 0 * * *' WITH SCHEDULE OPTIONS on_execution_failure=retry, on_previous_running=start;
~~~

The [schedule options](create-schedule-for-changefeed.html#schedule-options) control the schedule's behavior:

- If it runs into a failure, `on_execution_failure=retry` will ensure that the schedule retries the changefeed immediately. 
- If the previous scheduled changefeed is still running, `on_previous_running=start` will start a new changefeed at the defined cadence.