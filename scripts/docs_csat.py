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
from oauth2client.service_account import ServiceAccountCredentials
import os
import plotly.graph_objects as go


parser = argparse.ArgumentParser(
    description='Calculate docs CSAT and generate graph of pages.'
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
parser.add_argument(
    '--start_date',
    default='2020-02-01',
    help='Start date for CSAT calculations and graphing'
)
parser.add_argument(
    '--end_date',
    default='today',
    help='End date for CSAT calculations and graphing.'
)
args = parser.parse_args()


blacklist = ['cockroachdb-in-comparison.html']


def initialize_analyticsreporting():
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        args.ga_key_file_location,
        'https://www.googleapis.com/auth/analytics.readonly')

    analytics = build('analyticsreporting', 'v4', credentials=credentials)

    return analytics


def get_no_votes(analytics):
    return analytics.reports().batchGet(
        body={
            'reportRequests': [
                {
                    'viewId': args.ga_view_id,
                    'dateRanges': [
                        {'startDate': args.start_date, 'endDate': args.end_date}
                    ],
                    'metrics': [
                        {'expression': 'ga:totalEvents'}
                    ],
                    'dimensions': [
                        {'name': 'ga:pageTitle'},
                        {'name': 'ga:pagePath'}
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
                        {'startDate': args.start_date, 'endDate': args.end_date}
                    ],
                    'metrics': [
                        {'expression': 'ga:totalEvents'}
                    ],
                    'dimensions': [
                        {'name': 'ga:pageTitle'},
                        {'name': 'ga:pagePath'}
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


def get_pageviews(analytics):
    return analytics.reports().batchGet(
        body={
            'reportRequests': [
                {
                    'viewId': args.ga_view_id,
                    'dateRanges': [
                        {'startDate': args.start_date, 'endDate': args.end_date}
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
                                    'expressions': [pages_filter]
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
pageviews = dict()
pages_filter = list()



def create_dict(response, dict):
    for report in response.get('reports', []):

        for row in report.get('data', {}).get('rows', []):
            page = row.get('dimensions')[1]
            metrics = row.get('metrics')

            for values in metrics:
                value = values.get('values')[0]
                if page in dict:
                    dict[page] += float(value)
                else:
                    dict[page] = float(value)
                    pages_filter.append(page)


average_csats = dict()
weighted_csats = dict()


def calculate_csat(no_votes, yes_votes, pageviews):

    # Remove blacklisted pages.
    for p in blacklist:
        for k in list(pageviews):
            if p in k:
                del pageviews[k]
        for k in list(no_votes):
            if p in k:
                del no_votes[k]
        for k in list(yes_votes):
            if p in k:
                del yes_votes[k]

    # Even out dictionaries.
    for k in pageviews.keys():
        if k not in no_votes:
            no_votes[k] = 0.0
        if k not in yes_votes:
            yes_votes[k] = 0.0
    for k in no_votes.keys():
        if k not in yes_votes:
            yes_votes[k] = 0.0
        if k not in pageviews:
            pageviews[k] = 0.0
    for k in yes_votes.keys():
        if k not in no_votes:
            no_votes[k] = 0.0
        if k not in pageviews:
            pageviews[k] = 0.0

    # Basic CSAT
    total_yes = 0.0
    total_no = 0.0
    for v in yes_votes.values():
        total_yes += v
    for v in no_votes.values():
        total_no += v
    total_votes = total_yes + total_no
    basic_csat = total_yes / total_votes

    # Weighted CSAT
    for k,v in yes_votes.items():
        yes = v
        total = yes + no_votes[k]
        average_csats[k] = yes / total

    for k,v in average_csats.items():
        weighted_csats[k] = v * pageviews[k]
    weighted_csat = sum(weighted_csats.values()) / sum(pageviews.values())

    return basic_csat, weighted_csat


def main():

    # Requests
    analytics = initialize_analyticsreporting()
    create_dict(get_no_votes(analytics), no_votes)
    create_dict(get_yes_votes(analytics), yes_votes)
    create_dict(get_pageviews(analytics), pageviews)

    # Overall CSAT
    print()
    print(
        'Docs CSAT (basic, weighted):',
        calculate_csat(no_votes, yes_votes, pageviews)
    )
    print()

    # for k in pageviews:
    #     print('Page:', k)
    #     print('Unique Pageviews:', pageviews[k])
    #     print('No Votes:', no_votes[k])
    #     print('Yes Votes:', yes_votes[k])
    #     print()

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
        hovertemplate=
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
        title="Docs CSAT",
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
