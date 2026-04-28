export const ArraySubscript = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="81" width="503" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon>
<rect height="32" rx="10" width="26" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">[</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="97" y="3"></rect>
<rect class="nonterminal" height="32" width="64" x="95" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="107" y="21">a_expr</text></a><a xlink:href="#opt_slice_bound" xlink:title="opt_slice_bound">
<rect height="32" width="124" x="97" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="95" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="107" y="65">opt_slice_bound</text></a><rect height="32" rx="10" width="24" x="241" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="239" y="45"></rect>
<text class="terminal" x="249" y="65">:</text><a xlink:href="#opt_slice_bound" xlink:title="opt_slice_bound">
<rect height="32" width="124" x="285" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="283" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="295" y="65">opt_slice_bound</text></a><rect height="32" rx="10" width="26" x="449" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="447" y="1"></rect>
<text class="terminal" x="457" y="21">]</text>
<path class="line" d="m17 17 h2 m0 0 h10 m26 0 h10 m20 0 h10 m64 0 h10 m0 0 h248 m-352 0 h20 m332 0 h20 m-372 0 q10 0 10 10 m352 0 q0 -10 10 -10 m-362 10 v24 m352 0 v-24 m-352 24 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m124 0 h10 m0 0 h10 m24 0 h10 m0 0 h10 m124 0 h10 m20 -44 h10 m26 0 h10 m3 0 h-3"></path>
<polygon points="493 17 501 13 501 21"></polygon>
<polygon points="493 17 485 13 485 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
