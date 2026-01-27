### Refresh

{% include_cached new-in.html version="v23.2" %} To control refresh of the data on the Active Executions views of the SQL Activity Statements and Transactions pages, the following controls have been added:

- An **Active Statements|Transactions As Of** timestamp: Indicates when the last refresh was performed.
- A manual **Refresh** button: When clicked, refreshes data immediately.
- An **Auto Refresh** toggle: When toggled **On** (default), refreshes data immediately and then automatically every 10 seconds. When toggled **Off**, stops automatic data refresh. The toggle setting is shared by both the Statements and the Transactions pages. Changing the setting on one page changes it on the other page. 

<img src="/docs/images/{{ page.version.version }}/active-executions-view-refresh.png" alt="Active executions view refresh" style="border:1px solid #eee;max-width:100%" />

If **Auto Refresh** is toggled **On**, navigating to the Active Executions view on either the Statements page or Transactions page refreshes the data.

If **Auto Refresh** is toggled **Off** and the data has not been refreshed in over 10 minutes, there will be an alert under the controls similar to: `Your active statements|transactions data is 11 minutes old. Consider refreshing for the latest information.`
