export const OptScrubOptionsClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="409" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">WITH</text>
<rect height="32" rx="10" width="84" x="129" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="127" y="21"></rect>
<text class="terminal" x="137" y="41">OPTIONS</text><a xlink:href="#scrub_option_list" xlink:title="scrub_option_list">
<rect height="32" width="128" x="233" y="23"></rect>
<rect class="nonterminal" height="32" width="128" x="231" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="243" y="41">scrub_option_list</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h320 m-350 0 h20 m330 0 h20 m-370 0 q10 0 10 10 m350 0 q0 -10 10 -10 m-360 10 v12 m350 0 v-12 m-350 12 q0 10 10 10 m330 0 q10 0 10 -10 m-340 10 h10 m58 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m128 0 h10 m23 -32 h-3"></path>
<polygon points="399 5 407 1 407 9"></polygon>
<polygon points="399 5 391 1 391 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
