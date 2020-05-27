By default, if a node stays offline for more than 5 minutes, the cluster will consider it dead and will rebalance its data to other nodes. Before temporarily stopping nodes for planned maintenance (e.g., upgrading system software), if you expect any nodes to be offline for longer than 5 minutes, you can prevent the cluster from unnecessarily rebalancing data off the nodes by increasing the `server.time_until_store_dead` [cluster setting](cluster-settings.html) to match the estimated maintenance window.

For example, let's say you want to maintain a group of servers, and the nodes running on the servers may be offline for up to 15 minutes as a result. Before shutting down the nodes, you would change the `server.time_until_store_dead` cluster setting as follows:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the maintenance work and [restarting the nodes](cockroach-start.html), you would then change the setting back to its default:

{% include copy-clipboard.html %}
~~~ sql
> RESET CLUSTER SETTING server.time_until_store_dead;
~~~

It's also important to ensure that load balancers do not send client traffic to a node about to be shut down, even if it will only be down for a few seconds. If you find that your load balancer's health check is not always recognizing a node as unready before the node shuts down, you can increase the `server.shutdown.drain_wait` setting, which tells the node to wait in an unready state for the specified duration. For example:

{% include copy-clipboard.html %}
 ~~~ sql
 > SET CLUSTER SETTING server.shutdown.drain_wait = '10s';
 ~~~
