export const ColDef2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="69" width="259" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" width="56" x="31" y="3"></rect>
<rect class="nonterminal" height="32" width="56" x="29" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="41" y="21">name</text></a><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="127" y="35"></rect>
<rect class="nonterminal" height="32" width="84" x="125" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="137" y="53">typename</text></a><path class="line" d="m17 17 h2 m0 0 h10 m56 0 h10 m20 0 h10 m0 0 h94 m-124 0 h20 m104 0 h20 m-144 0 q10 0 10 10 m124 0 q0 -10 10 -10 m-134 10 v12 m124 0 v-12 m-124 12 q0 10 10 10 m104 0 q10 0 10 -10 m-114 10 h10 m84 0 h10 m23 -32 h-3"></path>
<polygon points="249 17 257 13 257 21"></polygon>
<polygon points="249 17 241 13 241 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
