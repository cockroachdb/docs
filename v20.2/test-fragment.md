---
title: Test remote fragment includes
summary: Test file for remote fragment includes
toc: true
twitter: false
---

Fragment include:

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-python-psycopg2/master/example.py|def create_accounts|def delete_accounts %}
~~~

Broken fragment include:

{% include copy-clipboard.html %}
~~~ python
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-python-psycopg2/master/example.py|def create_accounts|dlkfjdsljflkdjf %}
~~~
