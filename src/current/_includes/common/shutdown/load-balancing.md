Configure your load balancer to monitor node health. Your [load balancer]({% link {{ page.version.version }}/recommended-production-settings.md %}#load-balancing) should use the [`/health?ready=1` endpoint]({% link {{ page.version.version }}/monitoring-and-alerting.md %}#health-ready-1) to actively monitor node health and direct SQL client connections away from draining nodes.

To handle node shutdown effectively, the load balancer must be given enough time by the [`server.shutdown.initial_wait` duration](#server-shutdown-initial_wait).
