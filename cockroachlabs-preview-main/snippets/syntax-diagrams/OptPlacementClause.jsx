export const OptPlacementClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="233" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 5 1 1 1 9"></polygon>
<polygon points="17 5 9 1 9 9"></polygon><a xlink:href="#placement_clause" xlink:title="placement_clause">
<rect height="32" width="134" x="51" y="23"></rect>
<rect class="nonterminal" height="32" width="134" x="49" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="61" y="41">placement_clause</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h144 m-174 0 h20 m154 0 h20 m-194 0 q10 0 10 10 m174 0 q0 -10 10 -10 m-184 10 v12 m174 0 v-12 m-174 12 q0 10 10 10 m154 0 q10 0 10 -10 m-164 10 h10 m134 0 h10 m23 -32 h-3"></path>
<polygon points="223 5 231 1 231 9"></polygon>
<polygon points="223 5 215 1 215 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
