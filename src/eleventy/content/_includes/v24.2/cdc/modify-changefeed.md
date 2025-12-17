To modify an {{ site.data.products.enterprise }} changefeed, [pause]({% link "{{ page.version.version }}/create-and-configure-changefeeds.md" %}#pause) the job and then use:

~~~ sql
ALTER CHANGEFEED job_id {ADD table DROP table SET option UNSET option};
~~~

You can add new table targets, remove them, set new [changefeed options]({% link "{{ page.version.version }}/create-changefeed.md" %}#options), and unset them.

For more information, see [`ALTER CHANGEFEED`]({% link "{{ page.version.version }}/alter-changefeed.md" %}).
