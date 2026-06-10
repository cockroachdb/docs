export const OptOnly = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="145" width="455" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="32" x="51" y="23"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="49" y="21"></rect>
<text class="terminal" x="59" y="41">@</text><a xlink:href="#index_name" xlink:title="index_name">
<rect height="32" width="98" x="123" y="23"></rect>
<rect class="nonterminal" height="32" width="98" x="121" y="21"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="133" y="41">index_name</text></a><rect height="32" rx="10" width="26" x="123" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="121" y="65"></rect>
<text class="terminal" x="131" y="85">[</text>
<rect height="32" rx="10" width="74" x="169" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="167" y="65"></rect>
<text class="terminal" x="177" y="85">ICONST</text>
<rect height="32" rx="10" width="26" x="263" y="67"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="261" y="65"></rect>
<text class="terminal" x="271" y="85">]</text>
<rect height="32" rx="10" width="28" x="123" y="111"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="121" y="109"></rect>
<text class="terminal" x="131" y="129">{</text><a xlink:href="#index_flags_param_list" xlink:title="index_flags_param_list">
<rect height="32" width="168" x="171" y="111"></rect>
<rect class="nonterminal" height="32" width="168" x="169" y="109"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="10" class="nonterminal" x="181" y="129">index_flags_param_list</text></a><rect height="32" rx="10" width="28" x="359" y="111"></rect>
<rect class="terminal" height="32" rx="10" width="28" x="357" y="109"></rect>
<text class="terminal" x="367" y="129">}</text>
<path class="line" d="m17 5 h2 m20 0 h10 m0 0 h366 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v12 m396 0 v-12 m-396 12 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m32 0 h10 m20 0 h10 m98 0 h10 m0 0 h166 m-304 0 h20 m284 0 h20 m-324 0 q10 0 10 10 m304 0 q0 -10 10 -10 m-314 10 v24 m304 0 v-24 m-304 24 q0 10 10 10 m284 0 q10 0 10 -10 m-294 10 h10 m26 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m26 0 h10 m0 0 h98 m-294 -10 v20 m304 0 v-20 m-304 20 v24 m304 0 v-24 m-304 24 q0 10 10 10 m284 0 q10 0 10 -10 m-294 10 h10 m28 0 h10 m0 0 h10 m168 0 h10 m0 0 h10 m28 0 h10 m43 -120 h-3"></path>
<polygon points="445 5 453 1 453 9"></polygon>
<polygon points="445 5 437 1 437 9"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
