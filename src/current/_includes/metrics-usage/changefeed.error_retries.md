This metric tracks transient <a href="https://www.cockroachlabs.com/docs/stable/change-data-capture-overview">changefeed</a> errors.  Alert on "too many" errors, such as 50 retries in 15 minutes. For example, during a rolling upgrade this counter will increase because the changefeed jobs will restart following node restarts. There is an exponential backoff, up to 10 minutes. But if there is no rolling upgrade in process or other cluster maintenance, and the error rate is high, investigate the changefeed job.