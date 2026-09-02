export const ForGranteeClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="275" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 5 9 1 9 9"></polygon>
<rect height="32" rx="10" width="48" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">FOR</text><a xlink:href="#role_spec_list" xlink:title="role_spec_list">
<rect height="32" width="108" x="119" y="23"></rect>
<rect class="nonterminal" height="32" width="108" x="117" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="10" class="nonterminal" x="129" y="41">role_spec_list</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h186 m-216 0 h20 m196 0 h20 m-236 0 q10 0 10 10 m216 0 q0 -10 10 -10 m-226 10 v12 m216 0 v-12 m-216 12 q0 10 10 10 m196 0 q10 0 10 -10 m-206 10 h10 m48 0 h10 m0 0 h10 m108 0 h10 m23 -32 h-3"></path>
<polygon points="265 5 273 1 273 9"></polygon>
<polygon points="265 5 257 1 257 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
