{{site.data.alerts.callout_danger}}
Setting either `Messages` or `Bytes` with a non-zero value without setting `Frequency` will cause the sink to assume `Frequency` has an infinity value. If either `Messages` or `Bytes` have a non-zero value, then a non-zero value for `Frequency` **must** be provided. This configuration is invalid and will cause an error, since the messages could sit in a batch indefinitely if the other conditions do not trigger.
{{site.data.alerts.end}}

Some complexities to consider when setting `Flush` fields for batching:

- When all batching parameters are zero (`"Messages"`, `"Bytes"`, and `"Frequency"`) the sink will interpret this configuration as "send batch every time a message is available." This would be the same as not providing any configuration at all:

    ~~~
    {
      "Flush": {
        "Messages": 0,
        "Bytes": 0,
        "Frequency": "0s"
      }
    }
    ~~~

- If one or more fields are set as non-zero values, any fields with a zero value the sink will interpret as infinity. For example, in the following configuration, the sink will send a batch whenever the size reaches 100 messages, **or**, when 5 seconds has passed since the batch was populated with its first message. `Bytes` is unset, so the batch size is unlimited. No flush will be triggered due to batch size:

    ~~~
    {
      "Flush": {
        "Messages": 100,
        "Frequency": "5s"
      }
    }
    ~~~