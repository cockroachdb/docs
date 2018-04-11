By default, if a node stays offline for more than 5 minutes, the cluster will consider it dead and will rebalance its data to other nodes. Before temporarily stopping nodes for planned maintenance (e.g., upgrading system software), if you expect any nodes to be offline for longer than 5 minutes, you can prevent the cluster from unnecessarily rebalancing data off the nodes by increasing the `server.time_until_store_dead` [cluster setting](cluster-settings.html) to match the estimated maintenance window.

For example, let's say you want to maintain a group of servers, and the nodes running on the servers may be offline for up to 15 minutes as a result. Before shutting down the nodes, you might change the `server.time_until_store_dead` cluster setting as follows:

~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = '15m0s';
~~~

After completing the maintenance work and [restarting the nodes](start-a-node.html), you would then change the setting back to its default:

~~~ sql
> SET CLUSTER SETTING server.time_until_store_dead = '5m0s';
~~~

It's also important to ensure that load balancers don't send client traffic to a node about to be shut down for a longer period or just for a few seconds. If you find that your load balancer's health check needs more time to mark a node as unready, you can increase the `server.shutdown.drain_wait` setting, for example:

 ~~~ sql
 > SET CLUSTER SETTING server.shutdown.drain_wait = '10s';
 ~~~
