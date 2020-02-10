"""
Calculate docs CSAT based on "Was this page helpful?" feedback submissions
and unique pageviews, as tracked via Google Analytics; and generate a graph
plotting docs pages based on their negative and positive votes, with dot size
indicating number of unique pageviews.

Help: python3 docs-csat.py --help

Requirements:
  - Set up Google Analytics Reporting API:
    https://developers.google.com/analytics/devguides/reporting/core/v4/quickstart/service-py#1_enable_the_api.
  - Store GA credentials file as a GA_KEY_FILE_LOCATION env variable.
  - Install Google Analytics Python client library:
    pip3 install --upgrade google-api-python-client oauth2client
  - Install the Plotly visualization library:
    pip3 install plotly
"""


from apiclient.discovery import build
import argparse
import json
from oauth2client.service_account import ServiceAccountCredentials
import os
import plotly.graph_objects as go


parser = argparse.ArgumentParser(
    description = 'Calculate docs CSAT and generate graph of pages.'
)
parser.add_argument(
    '--ga_key_file_location',
    default=os.environ.get('GA_KEY_FILE_LOCATION', None),
    help='''Location of your Google Analytics key file. Store as a
    GA_KEY_FILE_LOCATION env variable or pass here.'''
)
parser.add_argument(
    '--ga_view_id',
    default='119439298',
    help='''Google Analytics view to query. You can use
    https://ga-dev-tools.appspot.com/account-explorer/ to find a view ID.'''
)
args = parser.parse_args()


def initialize_analyticsreporting():
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        args.ga_key_file_location, 'https://www.googleapis.com/auth/analytics.readonly')

    analytics = build('analyticsreporting', 'v4', credentials=credentials)

    return analytics


def get_no_votes(analytics):
    return analytics.reports().batchGet(
        body={
            'reportRequests': [
                {
                    'viewId': args.ga_view_id,
                    'dateRanges': [
                        # {'startDate': '2019-11-01', 'endDate': '2020-01-31'}
                        {'startDate': '2020-02-01', 'endDate': 'today'}
                        # {'startDate': '2019-01-01', 'endDate': '2020-01-01'}
                    ],
                    'metrics': [
                        {'expression': 'ga:totalEvents'}
                    ],
                    'dimensions': [
                        {'name': 'ga:pageTitle'},
                        {'name': 'ga:pagePath'}
                        # {'name': 'ga:eventAction'}
                    ],
                    'dimensionFilterClauses': [
                        {
                            'filters': [
                                {
                                    'dimensionName': 'ga:eventCategory',
                                    'operator': 'REGEXP',
                                    'expressions': ['docs-feedback-no']
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ).execute()


def get_yes_votes(analytics):
    return analytics.reports().batchGet(
        body={
            'reportRequests': [
                {
                    'viewId': args.ga_view_id,
                    'dateRanges': [
                        # {'startDate': '2019-11-01', 'endDate': '2020-01-31'}
                        {'startDate': '2020-02-01', 'endDate': 'today'}
                        # {'startDate': '2019-01-01', 'endDate': '2020-01-01'}
                    ],
                    'metrics': [
                        {'expression': 'ga:totalEvents'}
                    ],
                    'dimensions': [
                        {'name': 'ga:pageTitle'},
                        {'name': 'ga:pagePath'}
                        # {'name': 'ga:eventAction'}
                    ],
                    'dimensionFilterClauses': [
                        {
                            'filters': [
                                {
                                    'dimensionName': 'ga:eventCategory',
                                    'operator': 'REGEXP',
                                    'expressions': ['docs-feedback-yes']
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ).execute()


no_votes = dict()
yes_votes = dict()
pages = list()
pageviews = dict()
def create_dict(response, dict):
    for report in response.get('reports', []):

        for row in report.get('data', {}).get('rows', []):
            page = row.get('dimensions')[1]
            title = row.get('dimensions')[0]
            # if not title.isascii():
            #     continue
            metrics = row.get('metrics')

            for i, values in enumerate(metrics):
                value = values.get('values')[0]
                # print(value)

                if page in dict:
                    dict[page] += int(value)
                    continue
                dict[page] = int(value)

                pages.append(page)

    # print(dict)


def get_pageviews(analytics):
    return analytics.reports().batchGet(
        body= {
            'reportRequests': [
                {
                    'viewId': args.ga_view_id,
                    'dateRanges': [
                        # {'startDate': '2019-11-01', 'endDate': '2020-01-31'}
                        {'startDate': '2020-02-01', 'endDate': 'today'}
                        # {'startDate': '2019-01-01', 'endDate': '2020-01-01'}
                    ],
                    'metrics': [
                        {'expression': 'ga:uniquePageviews'},
                    ],
                    'dimensions': [
                        {'name': 'ga:pageTitle'},
                        {'name': 'ga:pagePath'}
                    ],
                    'dimensionFilterClauses': [
                        {
                            'filters': [
                                {
                                    'dimensionName': 'ga:pagePath',
                                    'operator': 'IN_LIST',
                                    'expressions': [pages]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ).execute()


def calculate_csat():

    # Basic CSAT
    total_yes = 0
    total_no = 0
    for k,v in yes_votes.items():
        total_yes += v
    for k,v in no_votes.items():
        total_no += v
    total_votes = total_yes + total_no
    basic_csat = total_yes / total_votes

    # Weighted CSAT
    average_csats = dict()
    for k,v in pageviews.items():
        if k not in no_votes:
            no_votes[k] = 0
        if k not in yes_votes:
            yes_votes[k] = 0
    for k,v in yes_votes.items():
        yes = v
        if k not in no_votes:
            no_votes[k] = 0
        total = v + no_votes[k]
        average_csats[k] = yes / total

    weighted_csats = dict()
    for k,v in average_csats.items():
        if k in pageviews:
            weighted_csats[k] = v * pageviews[k]
    weighted_csat = sum(weighted_csats.values()) / sum(pageviews.values())

    return basic_csat, weighted_csat


def main():

    # Requests
    analytics = initialize_analyticsreporting()
    create_dict(get_no_votes(analytics), no_votes)
    create_dict(get_yes_votes(analytics), yes_votes)
    create_dict(get_pageviews(analytics), pageviews)

    # Exclude comparison page from caculations:
    pages = ['www.cockroachlabs.com/docs/stable/cockroachdb-in-comparison.html',
         'www.cockroachlabs.com/docs/v19.2/cockroachdb-in-comparison.html',
         'www.cockroachlabs.com/docs/dev/cockroachdb-in-comparison.html',
         'www.cockroachlabs.com/docs/v20.1/cockroachdb-in-comparison.html',
         'www.cockroachlabs.com/docs/v19.1/cockroachdb-in-comparison.html']
    for p in pages:
        if p in no_votes:
            del no_votes[p]
        if p in yes_votes:
            del yes_votes[p]
        if p in pageviews:
            del pageviews[p]

    # CSAT
    print('\n')
    print('CSAT (basic, weighted):', calculate_csat())
    print('\n')

    # print(no_votes, yes_votes, pageviews)

    # Graph
    pages = list()
    uniques = list()
    negative = list()
    positive = list()
    for k in pageviews:
        pages.append(k)
        uniques.append(pageviews[k])
        negative.append(no_votes[k])
        positive.append(yes_votes[k])

    # print(len(positive))
    # print(len(yes_votes))

    fig = go.Figure(data=go.Scatter(
        x=negative,
        y=positive,
        text=pages,
        customdata=uniques,
        hovertemplate =
            'No votes: %{x}'+
            '<br>Yes votes: %{y}'+
            '<br>%{text}'+
            '<br>Unique pageviews: %{customdata}',
        mode='markers',
        marker=dict(
            size=uniques,
            sizemode='area',
            sizeref=2.*max(uniques)/(100.**2),
            sizemin=4
        )
    ))

    fig.update_layout(
        title="Docs Feedback",
        xaxis_title="Negative Votes",
        yaxis_title="Positive Votes",
        font=dict(
            family="Courier New, monospace",
            size=18,
            color="#7f7f7f"
        )
    )

    fig.show()


if __name__ == '__main__':
    main()
