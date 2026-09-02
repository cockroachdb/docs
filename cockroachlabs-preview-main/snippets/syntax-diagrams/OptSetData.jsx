export const OptSetData = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="317" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">COLLATE</text><a xlink:href="#collation_name" xlink:title="collation_name">
<rect height="32" width="116" x="153" y="23"></rect>
<rect class="nonterminal" height="32" width="116" x="151" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="163" y="41">collation_name</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h228 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v12 m258 0 v-12 m-258 12 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m82 0 h10 m0 0 h10 m116 0 h10 m23 -32 h-3"></path>
<polygon points="307 5 315 1 315 9"></polygon>
<polygon points="307 5 299 1 299 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
