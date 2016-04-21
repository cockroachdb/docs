# Copyright 2016 The Cockroach Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied. See the License for the specific language governing
# permissions and limitations under the License.

.PHONY: all
all: generate

# The generate target regenerates the SQL diagrams and function lists.
# It assumes that the docs repo is checked out in a $GOPATH/src directory,
# next to an up-to-date copy of the main cockroach repo.
.PHONY: generate
generate:
	cd generate && go run *.go
	cd generate && go run *.go funcs
