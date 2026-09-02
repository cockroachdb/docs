export const FrameBound = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="413" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="108" x="71" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="108" x="69" y="1"></rect>
<text class="terminal" x="79" y="21">UNBOUNDED</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="71" y="47"></rect>
<rect class="nonterminal" height="32" width="64" x="69" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="81" y="65">a_expr</text></a><rect height="32" rx="10" width="100" x="239" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="237" y="1"></rect>
<text class="terminal" x="247" y="21">PRECEDING</text>
<rect height="32" rx="10" width="106" x="239" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="237" y="45"></rect>
<text class="terminal" x="247" y="65">FOLLOWING</text>
<rect height="32" rx="10" width="84" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">CURRENT</text>
<rect height="32" rx="10" width="54" x="155" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="153" y="89"></rect>
<text class="terminal" x="163" y="109">ROW</text>
<path class="line" d="m17 17 h2 m40 0 h10 m108 0 h10 m-148 0 h20 m128 0 h20 m-168 0 q10 0 10 10 m148 0 q0 -10 10 -10 m-158 10 v24 m148 0 v-24 m-148 24 q0 10 10 10 m128 0 q10 0 10 -10 m-138 10 h10 m64 0 h10 m0 0 h44 m40 -44 h10 m100 0 h10 m0 0 h6 m-146 0 h20 m126 0 h20 m-166 0 q10 0 10 10 m146 0 q0 -10 10 -10 m-156 10 v24 m146 0 v-24 m-146 24 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m106 0 h10 m-334 -44 h20 m334 0 h20 m-374 0 q10 0 10 10 m354 0 q0 -10 10 -10 m-364 10 v68 m354 0 v-68 m-354 68 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m84 0 h10 m0 0 h10 m54 0 h10 m0 0 h156 m23 -88 h-3"></path>
<polygon points="403 17 411 13 411 21"></polygon>
<polygon points="403 17 395 13 395 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
