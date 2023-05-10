// Copyright 2023 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// https://raw.githubusercontent.com/cockroachdb/cockroach/master/licenses/APL.txt

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"
)

type gqlDocsPrReviewers struct {
	Data struct {
		Repository struct {
			PullRequest struct {
				Reviews struct {
					Edges []struct {
						Node review `json:"node"`
					} `json:"edges"`
					PageInfo pageInfo `json:"pageInfo"`
				} `json:"reviews"`
			} `json:"pullRequest"`
		} `json:"repository"`
	} `json:"data"`
}

type review struct {
	State     string    `json:"state"`
	UpdatedAt time.Time `json:"updatedAt"`
	Author    struct {
		Login string `json:"login"`
	} `json:"author"`
}

type gqlDocsPrsTeamMembers struct {
	Data struct {
		Organization struct {
			Team struct {
				Members struct {
					Edges []struct {
						Node struct {
							Login string `json:"login"`
						} `json:"node"`
					} `json:"edges"`
					PageInfo pageInfo `json:"pageInfo"`
				} `json:"members"`
			} `json:"team"`
		} `json:"organization"`
	} `json:"data"`
}

// parameters stores the GitHub API token, a dry run flag to output the issues it would create, and the
// start and end times of the search.
type parameters struct {
	Token    string // GitHub API token
	PrNumber int
	PrAuthor string
	IsDraft  bool
}

// pageInfo contains pagination information for querying the GraphQL API.
type pageInfo struct {
	HasNextPage bool   `json:"hasNextPage"`
	EndCursor   string `json:"endCursor"`
}

type prReviewParse struct {
	Approved  bool
	UpdatedAt time.Time
}

const (
	docsOrganization = "cockroachdb"
	docsRepo         = "docs"
	docsPrsTeam      = "docs-prs"
)

func main() {
	params, err := defaultEnvParameters()
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("test 1")
	fmt.Println(params.IsDraft)
	fmt.Println("test 2")
	if params.IsDraft {
		fmt.Println("PR is currently in draft. Skipping check...")
		os.Exit(0)
	}
	docsPrsMembers, err := searchDocsPrsTeamMembers(params.Token)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	if stringInSlice(params.PrAuthor, docsPrsMembers) {
		fmt.Printf(`User "%s" is a member of docs-prs, so no docs-prs approval required.`, params.PrAuthor)
		os.Exit(0)
	}
	fmt.Printf(`User "%s" is not a member of docs-prs. Checking for docs-prs team approval...`, params.PrAuthor)
	fmt.Println()

	prReviews, err := searchDocsPrReviewers(params.Token, params.PrNumber)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	isReviewed := parseDocsPrReviewers(prReviews, docsPrsMembers)
	if isReviewed {
		fmt.Println("This PR has been approved by a member of docs-prs. You are ready to merge!")
		os.Exit(0)
	}
	fmt.Println("You need approval from a member of docs-prs to merge this PR. Please add the group or at least one member of the group as a reviewer to this PR.")
	os.Exit(1)

}

func defaultEnvParameters() (parameters, error) {
	const (
		githubTokenEnv = "GITHUB_TOKEN"
		prNumberEnv    = "PR_NUMBER"
		prAuthorEnv    = "PR_AUTHOR"
		isDraftEnv     = "IS_DRAFT"
	)
	prNumber, err := strconv.Atoi(maybeEnv(prNumberEnv, ""))
	if err != nil {
		fmt.Println(err)
		return parameters{}, err
	}
	return parameters{
		Token:    maybeEnv(githubTokenEnv, ""),
		PrNumber: prNumber,
		PrAuthor: maybeEnv(prAuthorEnv, ""),
		IsDraft:  maybeEnv(isDraftEnv, "") == "true",
	}, nil
}

func maybeEnv(envKey, defaultValue string) string {
	v := os.Getenv(envKey)
	if v == "" {
		return defaultValue
	}
	return v
}

func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

// searchDocsPrsTeamMembers passes in a GitHub API token and returns the list of docs-prs team members.
func searchDocsPrsTeamMembers(token string) ([]string, error) {
	var result []string
	members, hasNextPage, nextCursor, err := searchDocsPrsTeamMembersSingle("", token)
	if err != nil {
		fmt.Println(err)
		return []string{}, err
	}
	result = members
	for hasNextPage {
		members, hasNextPage, nextCursor, err = searchDocsPrsTeamMembersSingle(nextCursor, token)
		if err != nil {
			fmt.Println(err)
			return []string{}, err
		}
		result = append(result, members...)
	}
	return result, nil
}

// searchDocsPrsTeamMembersSingle runs once per page of 100 users within GitHub. It returns the batch of users,
// whether or not there is another page after the one that just ran, the next cursor value used to query the next
// page, and any error.
func searchDocsPrsTeamMembersSingle(
	cursor string, token string,
) ([]string, bool, string, error) {
	var result []string
	docsPrsTeamMembersGQLQuery := `query ($org: String!, $team: String!, $cursor: String) {
	  organization(login: $org) {
		team(slug: $team) {
		  members (first: 100, after: $cursor) {
			edges {
			  node {
				login
			  }
			}
			pageInfo {
			  hasNextPage
			  endCursor
			}
		  }
		}
	  }
	}`
	var search gqlDocsPrsTeamMembers
	queryVariables := map[string]interface{}{
		"org":  docsOrganization,
		"team": docsPrsTeam,
	}
	if cursor != "" {
		queryVariables["cursor"] = cursor
	}
	err := queryGraphQL(docsPrsTeamMembersGQLQuery, queryVariables, token, &search)
	if err != nil {
		fmt.Println(err)
		return []string{}, false, "", err
	}

	for _, x := range search.Data.Organization.Team.Members.Edges {
		result = append(result, x.Node.Login)
	}

	pageInfo := search.Data.Organization.Team.Members.PageInfo
	return result, pageInfo.HasNextPage, pageInfo.EndCursor, nil
}

// queryGraphQL is the function that interfaces directly with the GitHub GraphQL API. Given a query, variables, and
// token, it will return a struct containing the requested data or an error if one exists.
func queryGraphQL(
	query string, queryVariables map[string]interface{}, token string, out interface{},
) error {
	const graphQLURL = "https://api.github.com/graphql"
	client := &http.Client{}
	bodyInt := map[string]interface{}{
		"query": query,
	}
	if queryVariables != nil {
		bodyInt["variables"] = queryVariables
	}
	requestBody, err := json.Marshal(bodyInt)
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", graphQLURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "token "+token)
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	bs, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}
	// unmarshal (convert) the byte slice into an interface
	var tmp interface{}
	err = json.Unmarshal(bs, &tmp)
	if err != nil {
		fmt.Println("Error: unable to unmarshal JSON into an empty interface")
		fmt.Println(string(bs[:]))
		return err
	}
	err = json.Unmarshal(bs, out)
	if err != nil {
		return err
	}
	return nil
}

func searchDocsPrReviewers(token string, prNumber int) ([]review, error) {
	var result []review
	batch, hasNextPage, nextCursor, err := searchDocsPrReviewersSingle("", token, prNumber)
	if err != nil {
		fmt.Println(err)
		return []review{}, err
	}
	result = batch
	for hasNextPage {
		batch, hasNextPage, nextCursor, err = searchDocsPrReviewersSingle(nextCursor, token, prNumber)
		if err != nil {
			fmt.Println(err)
			return []review{}, err
		}
		result = append(result, batch...)
	}
	return result, nil
}

// searchDocsPrReviewersSingle runs once per page of 100 users within GitHub. It returns the batch of users,
// whether there is another page after the one that just ran, the next cursor value used to query the next
// page, and any error.
func searchDocsPrReviewersSingle(
	cursor string, token string, prNumber int,
) ([]review, bool, string, error) {
	var result []review
	docsPrReviewersGQLQuery := `query ($org: String!, $repoName: String!, $prNumber: Int!, $cursor: String) {
	  repository(owner: $org, name: $repoName) {
		pullRequest(number: $prNumber) {
		  reviews(first: 100, after: $cursor) {
			edges {
			  node {
				state
				updatedAt
				author {
				  login
				}
			  }
			}
			pageInfo {
			  hasNextPage
			  endCursor
			}
		  }
		}
	  }
	}`
	var search gqlDocsPrReviewers
	queryVariables := map[string]interface{}{
		"org":      docsOrganization,
		"repoName": docsRepo,
		"prNumber": prNumber,
	}
	if cursor != "" {
		queryVariables["cursor"] = cursor
	}
	err := queryGraphQL(docsPrReviewersGQLQuery, queryVariables, token, &search)
	if err != nil {
		fmt.Println(err)
		return []review{}, false, "", err
	}
	for _, x := range search.Data.Repository.PullRequest.Reviews.Edges {
		r := x.Node
		result = append(result, r)
	}
	pageInfo := search.Data.Repository.PullRequest.Reviews.PageInfo
	return result, pageInfo.HasNextPage, pageInfo.EndCursor, nil
}

// parseDocsPrReviewers takes a full list of reviews on a PR, takes only the PR reviews from members of docs-prs, and
// checks if an approval has been made. Review comments (state = COMMENTED) have no effect on the review status.
func parseDocsPrReviewers(reviews []review, docsPrsMembers []string) bool {
	docsReviewers := make(map[string]prReviewParse)
	for _, x := range reviews {
		if stringInSlice(x.Author.Login, docsPrsMembers) {
			approved := false
			_, found := docsReviewers[x.Author.Login]
			if x.State == "APPROVED" &&
				(found && x.UpdatedAt.After(docsReviewers[x.Author.Login].UpdatedAt) || !found) ||
				(x.State == "COMMENTED" && docsReviewers[x.Author.Login].Approved) {
				approved = true
			}
			docsReviewers[x.Author.Login] = prReviewParse{
				Approved:  approved,
				UpdatedAt: x.UpdatedAt,
			}
		}
	}
	for _, y := range docsReviewers {
		if y.Approved {
			return true
		}
	}
	return false
}
