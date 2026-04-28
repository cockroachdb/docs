export const ExecuteStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="481" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">EXECUTE</text><a xlink:href="#table_alias_name" xlink:title="table_alias_name">
<rect height="32" width="134" x="131" y="3"></rect>
<rect class="nonterminal" height="32" width="134" x="129" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="141" y="21">table_alias_name</text></a><a xlink:href="#execute_param_clause" xlink:title="execute_param_clause">
<rect height="32" width="168" x="285" y="3"></rect>
<rect class="nonterminal" height="32" width="168" x="283" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="295" y="21">execute_param_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m80 0 h10 m0 0 h10 m134 0 h10 m0 0 h10 m168 0 h10 m3 0 h-3"></path>
<polygon points="471 17 479 13 479 21"></polygon>
<polygon points="471 17 463 13 463 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
