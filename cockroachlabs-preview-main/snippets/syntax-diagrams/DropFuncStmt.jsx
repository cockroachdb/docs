export const DropFuncStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="135" width="641" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">DROP</text>
<rect height="32" rx="10" width="92" x="109" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="107" y="1"></rect>
<text class="terminal" x="117" y="21">FUNCTION</text>
<rect height="32" rx="10" width="34" x="241" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="239" y="33"></rect>
<text class="terminal" x="249" y="53">IF</text>
<rect height="32" rx="10" width="70" x="295" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="293" y="33"></rect>
<text class="terminal" x="303" y="53">EXISTS</text><a xlink:href="#function_with_paramtypes_list" xlink:title="function_with_paramtypes_list">
<rect height="32" width="214" x="405" y="3"></rect>
<rect class="nonterminal" height="32" width="214" x="403" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="415" y="21">function_with_paramtypes_list</text></a><a xlink:href="#opt_drop_behavior" xlink:title="opt_drop_behavior">
<rect height="32" width="142" x="471" y="101"></rect>
<rect class="nonterminal" height="32" width="142" x="469" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="481" y="119">opt_drop_behavior</text></a><path class="line" d="m17 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m214 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-192 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m142 0 h10 m3 0 h-3"></path>
<polygon points="631 115 639 111 639 119"></polygon>
<polygon points="631 115 623 111 623 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
