export const TableClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="37" width="219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">TABLE</text><a xlink:href="#table_ref" xlink:title="table_ref">
<rect height="32" width="78" x="113" y="3"></rect>
<rect class="nonterminal" height="32" width="78" x="111" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="123" y="21">table_ref</text></a><path class="line" d="m17 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m78 0 h10 m3 0 h-3"></path>
<polygon points="209 17 217 13 217 21"></polygon>
<polygon points="209 17 201 13 201 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
