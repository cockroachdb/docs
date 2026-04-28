export const ReturningClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="101" width="345" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="100" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">RETURNING</text><a xlink:href="#target_list" xlink:title="target_list">
<rect height="32" width="86" x="191" y="23"></rect>
<rect class="nonterminal" height="32" width="86" x="189" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="201" y="41">target_list</text></a><rect height="32" rx="10" width="86" x="191" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="189" y="65"></rect>
<text class="terminal" x="199" y="85">NOTHING</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h256 m-286 0 h20 m266 0 h20 m-306 0 q10 0 10 10 m286 0 q0 -10 10 -10 m-296 10 v12 m286 0 v-12 m-286 12 q0 10 10 10 m266 0 q10 0 10 -10 m-276 10 h10 m100 0 h10 m20 0 h10 m86 0 h10 m-126 0 h20 m106 0 h20 m-146 0 q10 0 10 10 m126 0 q0 -10 10 -10 m-136 10 v24 m126 0 v-24 m-126 24 q0 10 10 10 m106 0 q10 0 10 -10 m-116 10 h10 m86 0 h10 m43 -76 h-3"></path>
<polygon points="335 5 343 1 343 9"></polygon>
<polygon points="335 5 327 1 327 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
