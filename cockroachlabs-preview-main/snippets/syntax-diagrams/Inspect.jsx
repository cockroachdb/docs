export const Inspect = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="707" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
text {
  fill: #2f3337;
  font-size: 14px;
}
rect {
  fill: #ffffff;
  stroke: #3a3d40;
  stroke-width: 2;
}
rect.terminal {
  fill: #ffffff;
}
rect.nonterminal {
  fill: #ffffff;
}
text.terminal {
  fill: #2f3337;
  font-weight: 600;
}
text.nonterminal {
  fill: #2563eb;
}
a text.nonterminal {
  text-decoration: underline;
}
path.line {
  fill: none;
  stroke: #3a3d40;
  stroke-width: 2;
}
polygon {
  fill: #2f3337;
  stroke: #2f3337;
}</style>
<polygon points="9 17 1 13 1 21"></polygon>
<polygon points="17 17 9 13 9 21"></polygon>
<rect height="32" rx="10" width="80" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">INSPECT</text>
<rect height="32" rx="10" width="62" x="131" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="129" y="1"></rect>
<text class="terminal" x="139" y="21">TABLE</text><a xlink:href="/docs/stable/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="213" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="211" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="223" y="21">table_name</text></a><a xlink:href="/docs/stable/sql-grammar#opt_as_of_clause" xlink:title="opt_as_of_clause">
<rect height="32" width="132" x="329" y="3"></rect>
<rect class="nonterminal" height="32" width="132" x="327" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="10" class="nonterminal" x="339" y="21">opt_as_of_clause</text></a><a xlink:href="/docs/stable/sql-grammar#opt_inspect_options_clause" xlink:title="opt_inspect_options_clause">
<rect height="32" width="198" x="481" y="3"></rect>
<rect class="nonterminal" height="32" width="198" x="479" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="174" font-size="10" class="nonterminal" x="491" y="21">opt_inspect_options_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m80 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m132 0 h10 m0 0 h10 m198 0 h10 m3 0 h-3"></path>
<polygon points="697 17 705 13 705 21"></polygon>
<polygon points="697 17 689 13 689 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
