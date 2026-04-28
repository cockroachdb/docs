export const OptStatsColumns = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="241" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="40" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">ON</text><a xlink:href="#name_list" xlink:title="name_list">
<rect height="32" width="82" x="111" y="23"></rect>
<rect class="nonterminal" height="32" width="82" x="109" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="121" y="41">name_list</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h152 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v12 m182 0 v-12 m-182 12 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m40 0 h10 m0 0 h10 m82 0 h10 m23 -32 h-3"></path>
<polygon points="231 5 239 1 239 9"></polygon>
<polygon points="231 5 223 1 223 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
