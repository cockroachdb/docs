---
title: Build a Test App
toc: false
---

This page demonstrates how to connect a simple test app to CockroachDB from various languages. The app creates a "bank" database, creates two accounts, and executes a transaction to transfer funds from one account to the other. 

We assume that you have already [installed CockroachDB](install-cockroachdb.html), [started an insecure local cluster](start-a-local-cluster.html#insecure), and [installed the relevant client driver](install-client-drivers.html).

## Go

~~~ go
{% include test-app1.go %}
~~~

## C/C++

~~~ c
{% include test-app1.c %}
~~~

## Python

~~~ py
{% include test-app1.py %}
~~~

## Ruby

~~~ ruby
{% include test-app1.rb %}
~~~

## Java

~~~ ruby
{% include test-app1.java %}
~~~

## JavaScript (Node.js)

~~~ js
{% include test-app1.js %}
~~~

## Clojure

~~~ clojure
{% include test-app1.clj %}
~~~

## PHP

~~~ php
{% include test-app1.php %}
~~~
