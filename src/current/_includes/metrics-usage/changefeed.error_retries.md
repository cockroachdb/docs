This metric tracks transient [changefeed]({% link {{ site.current_cloud_version }}/change-data-capture-overview.md %}) errors.  Alert on "too many" errors, such as 50 retries in 15 minutes. For example, during a rolling upgrade this counter will increase because the changefeed jobs will restart following node restarts. There is an exponential backoff, up to 10 minutes. But if there is no rolling upgrade in process or other cluster maintenance, and the error rate is high, investigate the changefeed job.