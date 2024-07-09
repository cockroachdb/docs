~~~
'azure-event-hub://{event-hubs-namespace}.servicebus.windows.net:9093?shared_access_key_name={policy-name}&shared_access_key={url-encoded key}'
~~~

You can also use a `kafka://` scheme in the URI:

~~~
'kafka://{event-hubs-namespace}.servicebus.windows.net:9093?shared_access_key_name={policy-name}&shared_access_key={url-encoded key}'
~~~