The best way to estimate your resource usage is to enter a spend limit you're comfortable with and run your workload. You can see the RUs and storage your cluster has used in the **Usage this month** section of the [**Cluster Overview**](serverless-cluster-management.html#view-cluster-overview) page. Once enough usage data is available, you can also see a graph of your monthly resource usage and recommended spend limit on the [**Edit cluster**](serverless-cluster-management.html#edit-your-spend-limit) page.

To see the approximate RU cost of a SQL statement, use the EXPLAIN ANALYZE statement:

  ~~~ shell
  EXPLAIN ANALYZE SELECT * FROM employees WHERE salary > 50000;
  ~~~