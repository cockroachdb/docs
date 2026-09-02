export const SchemaNameList = () => {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon><a xlink:href="#qualifiable_schema_name" xlink:title="qualifiable_schema_name">
<rect height="32" width="186" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="186" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="162" font-size="11" class="nonterminal" x="61" y="65">qualifiable_schema_name</text></a><rect height="32" rx="10" width="24" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">,</text>
<path class="line" d="m17 61 h2 m20 0 h10 m186 0 h10 m-226 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m206 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-206 0 h10 m24 0 h10 m0 0 h162 m23 44 h-3"></path>
<polygon points="275 61 283 57 283 65"></polygon>
<polygon points="275 61 267 57 267 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
