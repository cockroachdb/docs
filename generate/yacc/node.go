// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Parse nodes.

package yacc

import "fmt"

var textFormat = "%s" // Changed to "%q" in tests for better error messages.

// A Node is an element in the parse tree. The interface is trivial.
// The interface contains an unexported method so that only
// types local to this package can satisfy it.
type Node interface {
	Type() NodeType
	String() string
	Position() Pos // byte position of start of node in full original input string
	// Make sure only functions in this package can create Nodes.
	unexported()
}

// NodeType identifies the type of a parse tree node.
type NodeType int

// Pos represents a byte position in the original input text from which
// this template was parsed.
type Pos int

func (p Pos) Position() Pos {
	return p
}

// unexported keeps Node implementations local to the package.
// All implementations embed Pos, so this takes care of it.
func (Pos) unexported() {
}

// Type returns itself and provides an easy default implementation
// for embedding in a Node. Embedded in all non-trivial Nodes.
func (t NodeType) Type() NodeType {
	return t
}

const (
	NodeProduction NodeType = iota
	NodeExpression
)

// Nodes.

type ProductionNode struct {
	NodeType
	Pos
	Name        string
	Expressions []*ExpressionNode
}

func newProduction(pos Pos, name string) *ProductionNode {
	return &ProductionNode{NodeType: NodeProduction, Pos: pos, Name: name}
}

func (p *ProductionNode) String() string {
	return fmt.Sprintf("production: %s", p.Name)
}

type ExpressionNode struct {
	NodeType
	Pos
	Items   []Item
	Command string
}

func newExpression(pos Pos) *ExpressionNode {
	return &ExpressionNode{NodeType: NodeExpression, Pos: pos}
}

func (e *ExpressionNode) String() string {
	return fmt.Sprintf("expression: %q", e.Items)
}

type Item struct {
	Value string
	Typ   ItemTyp
}

type ItemTyp int

const (
	TypToken = iota
	TypLiteral
)
