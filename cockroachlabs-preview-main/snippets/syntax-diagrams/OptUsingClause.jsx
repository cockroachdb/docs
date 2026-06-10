export const OptUsingClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="57" width="259" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">USING</text><a xlink:href="#from_list" xlink:title="from_list">
<rect height="32" width="76" x="135" y="23"></rect>
<rect class="nonterminal" height="32" width="76" x="133" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="52" font-size="10" class="nonterminal" x="145" y="41">from_list</text></a><path class="line" d="m17 5 h2 m20 0 h10 m0 0 h170 m-200 0 h20 m180 0 h20 m-220 0 q10 0 10 10 m200 0 q0 -10 10 -10 m-210 10 v12 m200 0 v-12 m-200 12 q0 10 10 10 m180 0 q10 0 10 -10 m-190 10 h10 m64 0 h10 m0 0 h10 m76 0 h10 m23 -32 h-3"></path>
<polygon points="249 5 257 1 257 9"></polygon>
<polygon points="249 5 241 1 241 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
