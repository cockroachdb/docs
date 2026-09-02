export const ColumnPath = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="261" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="61" y="21">name</text></a><a xlink:href="#prefixed_column_path" xlink:title="prefixed_column_path">
<rect height="32" width="162" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="162" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="11" class="nonterminal" x="61" y="65">prefixed_column_path</text></a><path class="line" d="m17 17 h2 m20 0 h10 m56 0 h10 m0 0 h106 m-202 0 h20 m182 0 h20 m-222 0 q10 0 10 10 m202 0 q0 -10 10 -10 m-212 10 v24 m202 0 v-24 m-202 24 q0 10 10 10 m182 0 q10 0 10 -10 m-192 10 h10 m162 0 h10 m23 -44 h-3"></path>
<polygon points="251 17 259 13 259 21"></polygon>
<polygon points="251 17 243 13 243 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
