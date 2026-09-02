export const DbObjectName = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="285" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#simple_db_object_name" xlink:title="simple_db_object_name">
<rect height="32" width="176" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="176" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="152" font-size="11" class="nonterminal" x="61" y="21">simple_db_object_name</text></a><a xlink:href="#complex_db_object_name" xlink:title="complex_db_object_name">
<rect height="32" width="186" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="186" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="11" class="nonterminal" x="61" y="65">complex_db_object_name</text></a><path class="line" d="m17 17 h2 m20 0 h10 m176 0 h10 m0 0 h10 m-226 0 h20 m206 0 h20 m-246 0 q10 0 10 10 m226 0 q0 -10 10 -10 m-236 10 v24 m226 0 v-24 m-226 24 q0 10 10 10 m206 0 q10 0 10 -10 m-216 10 h10 m186 0 h10 m23 -44 h-3"></path>
<polygon points="275 17 283 13 283 21"></polygon>
<polygon points="275 17 267 13 267 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
