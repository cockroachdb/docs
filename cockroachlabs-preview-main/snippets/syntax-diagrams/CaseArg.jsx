export const CaseArg = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="163" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 5 9 1 9 9"></polygon><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="51" y="23"></rect>
<rect class="nonterminal" height="32" width="64" x="49" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="61" y="41">a_expr</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h74 m-104 0 h20 m84 0 h20 m-124 0 q10 0 10 10 m104 0 q0 -10 10 -10 m-114 10 v12 m104 0 v-12 m-104 12 q0 10 10 10 m84 0 q10 0 10 -10 m-94 10 h10 m64 0 h10 m23 -32 h-3"></path>
<polygon points="153 5 161 1 161 9"></polygon>
<polygon points="153 5 145 1 145 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
