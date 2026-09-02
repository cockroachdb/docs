export const SortbyList = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="241" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 61 1 57 1 65"></polygon>
<polygon points="17 61 9 57 9 65"></polygon><a xlink:href="#sortby" xlink:title="sortby">
<rect height="32" width="60" x="71" y="47"></rect>
<rect class="nonterminal" height="32" width="60" x="69" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="36" font-size="10" class="nonterminal" x="81" y="65">sortby</text></a><a xlink:href="#sortby_index" xlink:title="sortby_index">
<rect height="32" width="102" x="71" y="91"></rect>
<rect class="nonterminal" height="32" width="102" x="69" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="81" y="109">sortby_index</text></a><rect height="32" rx="10" width="24" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">,</text>
<path class="line" d="m17 61 h2 m40 0 h10 m60 0 h10 m0 0 h42 m-142 0 h20 m122 0 h20 m-162 0 q10 0 10 10 m142 0 q0 -10 10 -10 m-152 10 v24 m142 0 v-24 m-142 24 q0 10 10 10 m122 0 q10 0 10 -10 m-132 10 h10 m102 0 h10 m-162 -44 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m162 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-162 0 h10 m24 0 h10 m0 0 h118 m23 44 h-3"></path>
<polygon points="231 61 239 57 239 65"></polygon>
<polygon points="231 61 223 57 223 65"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
