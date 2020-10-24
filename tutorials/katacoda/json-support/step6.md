In a new terminal, run the Python code you downloaded earlier to insert rows into your table:

`python3 json-sample.py`{{execute T3}}

The code queries the [Reddit API](https://www.reddit.com/dev/api/) for posts in [/r/programming](https://www.reddit.com/r/programming/). The Reddit API only returns 25 results per page; however, each page returns an `"after"` string that tells you how to get the next page. Therefore, the program does the following in a loop:

1. Makes a request to the API.
2. Grabs the `"after"` string.
3. Inserts the results into the table.
4. Uses the new `"after"` string as the basis for the next request.

The program will loop through that 40 times, but you can start querying the data right away.
