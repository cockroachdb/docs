// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// Package parse builds parse trees for configurations as defined by conf.
// Clients should use that package to construct configurations rather than this
// one, which provides shared internal data structures not intended for general
// use.
package yacc

import (
	"fmt"
	"runtime"
	"strings"
)

// Tree is the representation of a single parsed configuration.
type Tree struct {
	Name        string // name of the template represented by the tree.
	Productions []*ProductionNode
	text        string // text parsed to create the template (or its parent)
	// Parsing only; cleared after parse.
	lex       *lexer
	token     [2]item // two-token lookahead for parser.
	peekCount int
}

func Parse(name, text string) (t *Tree, err error) {
	t = New(name)
	t.text = text
	err = t.Parse(text)
	return
}

// next returns the next token.
func (t *Tree) next() item {
	if t.peekCount > 0 {
		t.peekCount--
	} else {
		t.token[0] = t.lex.nextItem()
	}
	return t.token[t.peekCount]
}

// backup backs the input stream up one token.
func (t *Tree) backup() {
	t.peekCount++
}

// backup2 backs the input stream up two tokens.
// The zeroth token is already there.
func (t *Tree) backup2(t1 item) {
	t.token[1] = t1
	t.peekCount = 2
}

// peek returns but does not consume the next token.
func (t *Tree) peek() item {
	if t.peekCount > 0 {
		return t.token[t.peekCount-1]
	}
	t.peekCount = 1
	t.token[0] = t.lex.nextItem()
	return t.token[0]
}

// Parsing.

// New allocates a new parse tree with the given name.
func New(name string) *Tree {
	return &Tree{
		Name: name,
	}
}

// ErrorContext returns a textual representation of the location of the node in the input text.
func (t *Tree) ErrorContext(n Node) (location, context string) {
	pos := int(n.Position())
	text := t.text[:pos]
	byteNum := strings.LastIndex(text, "\n")
	if byteNum == -1 {
		byteNum = pos // On first line.
	} else {
		byteNum++ // After the newline.
		byteNum = pos - byteNum
	}
	lineNum := 1 + strings.Count(text, "\n")
	context = n.String()
	context = strings.TrimSpace(context)
	context = strings.Replace(context, "\n", "\\n", -1)
	if len(context) > 20 {
		context = fmt.Sprintf("%.20s...", context)
	}
	return fmt.Sprintf("%s:%d:%d", t.Name, lineNum, byteNum), context
}

// errorf formats the error and terminates processing.
func (t *Tree) errorf(format string, args ...interface{}) {
	format = fmt.Sprintf("parse: %s:%d: %s", t.Name, t.lex.lineNumber(), format)
	panic(fmt.Errorf(format, args...))
}

// error terminates processing.
func (t *Tree) error(err error) {
	t.errorf("%s", err)
}

// expect consumes the next token and guarantees it has the required type.
func (t *Tree) expect(expected itemType, context string) item {
	token := t.next()
	if token.typ != expected {
		t.unexpected(token, context)
	}
	return token
}

// expectOneOf consumes the next token and guarantees it has one of the required types.
func (t *Tree) expectOneOf(expected1, expected2 itemType, context string) item {
	token := t.next()
	if token.typ != expected1 && token.typ != expected2 {
		t.unexpected(token, context)
	}
	return token
}

// unexpected complains about the token and terminates processing.
func (t *Tree) unexpected(token item, context string) {
	t.errorf("unexpected %s in %s", token, context)
}

// recover is the handler that turns panics into returns from the top level of Parse.
func (t *Tree) recover(errp *error) {
	e := recover()
	if e != nil {
		if _, ok := e.(runtime.Error); ok {
			panic(e)
		}
		if t != nil {
			t.stopParse()
		}
		*errp = e.(error)
	}
	return
}

// startParse initializes the parser, using the lexer.
func (t *Tree) startParse(lex *lexer) {
	t.lex = lex
}

// stopParse terminates parsing.
func (t *Tree) stopParse() {
	t.lex = nil
}

// Parse parses the template definition string to construct a representation of
// the template for execution. If either action delimiter string is empty, the
// default ("{{" or "}}") is used. Embedded template definitions are added to
// the treeSet map.
func (t *Tree) Parse(text string) (err error) {
	defer t.recover(&err)
	t.startParse(lex(t.Name, text))
	t.text = text
	t.parse()
	t.stopParse()
	return nil
}

// parse is the top-level parser for a conf.
// It runs to EOF.
func (t *Tree) parse() {
	for {
		switch token := t.next(); token.typ {
		case itemIdent:
			p := newProduction(token.pos, token.val)
			t.parseProduction(p)
			t.Productions = append(t.Productions, p)
		case itemEOF:
			return
		}
	}
}

func (t *Tree) parseProduction(p *ProductionNode) {
	const context = "production"
	t.expect(itemColon, context)
	t.expect(itemNL, context)
	expectExpr := true
	for {
		switch token := t.next(); token.typ {
		case itemComment:
			if t.peek().typ == itemNL {
				t.next()
			}
		case itemNL:
			if !expectExpr {
				return
			}
		case itemPipe:
			if expectExpr {
				t.unexpected(token, context)
			}
			expectExpr = true
		default:
			if !expectExpr {
				t.unexpected(token, context)
			}
			t.backup()
			e := newExpression(token.pos)
			t.parseExpression(e)
			p.Expressions = append(p.Expressions, e)
			expectExpr = false
		}
	}
}

func (t *Tree) parseExpression(e *ExpressionNode) {
	const context = "expression"
	for {
		switch token := t.next(); token.typ {
		case itemNL:
			peek := t.peek().typ
			if peek == itemPipe || peek == itemNL {
				return
			}
		case itemIdent:
			e.Items = append(e.Items, Item{token.val, TypToken})
		case itemLiteral:
			e.Items = append(e.Items, Item{token.val, TypLiteral})
		case itemExpr:
			e.Command = token.val
			t.expect(itemNL, context)
			return
		case itemPct, itemComment:
			// ignore
		default:
			t.unexpected(token, context)
		}
	}
}
