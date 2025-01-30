1. Create a database called `cdc_demo`:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > CREATE DATABASE cdc_demo;
    ~~~

1. Set the database as the default:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > SET DATABASE = cdc_demo;
    ~~~

1. Create a table and add data:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > CREATE TABLE office_dogs (
         id INT PRIMARY KEY,
         name STRING);
    ~~~

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > INSERT INTO office_dogs VALUES
       (1, 'Petee'),
       (2, 'Carl');
    ~~~

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > UPDATE office_dogs SET name = 'Petee H' WHERE id = 1;
    ~~~

1. Create another table and add data:

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > CREATE TABLE employees (
         dog_id INT REFERENCES office_dogs (id),
         employee_name STRING);
    ~~~

    {% include "_includes/copy-clipboard.html" %}
    ~~~ sql
    > INSERT INTO employees VALUES
       (1, 'Lauren'),
       (2, 'Spencer');
    ~~~
