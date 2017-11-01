# Goals

Explore the Admin UI - https://www.cockroachlabs.com/docs/stable/explore-the-admin-ui.html

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- What is it?
- Access
- Summary Panel
- Navigation
- Useful Dashboards & Graphs

/----------------------------------------/

## What is it?

- Built-in, for-free monitoring
- Troubleshooting tool

/----------------------------------------/

## Access

- Symmetric from any node
- Port `8080` by default or `http-port`

/----------------------------------------/

## Summary Panel

- Unavailable Ranges
- Capacity used
	- Miscalculates if running multiple stores on same machine
- Node List
	- Dead and decomissioned nodes

/----------------------------------------/

## Navigation

- Per node or whole cluster
- Separate dashboards

/----------------------------------------/

## Useful Dashboards & Graphs

- Overview
- Runtime
	- Goroutines and GC info not very useful
- SQL
	- Distributed SQL graphs not very interesting
- Storage
	- Capacity and Live Bytes
	- File Descriptors on macOS
- Replication
	- Everything here is interesting

/----------------------------------------/

# Lab