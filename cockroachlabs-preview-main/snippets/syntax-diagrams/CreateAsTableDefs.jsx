export const CreateAsTableDefs = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="223" width="515" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 17 3 13 3 21"></polygon>
<polygon points="19 17 11 13 11 21"></polygon><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="33" y="3"></rect>
<rect class="nonterminal" height="32" width="108" x="31" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="43" y="21">column_name</text></a><a xlink:href="#create_as_col_qual_list" xlink:title="create_as_col_qual_list">
<rect height="32" width="170" x="161" y="3"></rect>
<rect class="nonterminal" height="32" width="170" x="159" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="171" y="21">create_as_col_qual_list</text></a><rect height="32" rx="10" width="24" x="65" y="85"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="63" y="83"></rect>
<text class="terminal" x="73" y="103">,</text><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="129" y="85"></rect>
<rect class="nonterminal" height="32" width="108" x="127" y="83"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="139" y="103">column_name</text></a><a xlink:href="#create_as_col_qual_list" xlink:title="create_as_col_qual_list">
<rect height="32" width="170" x="257" y="85"></rect>
<rect class="nonterminal" height="32" width="170" x="255" y="83"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="267" y="103">create_as_col_qual_list</text></a><a xlink:href="#family_def" xlink:title="family_def">
<rect height="32" width="86" x="129" y="129"></rect>
<rect class="nonterminal" height="32" width="86" x="127" y="127"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="139" y="147">family_def</text></a><a xlink:href="#create_as_constraint_def" xlink:title="create_as_constraint_def">
<rect height="32" width="182" x="129" y="173"></rect>
<rect class="nonterminal" height="32" width="182" x="127" y="171"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="10" class="nonterminal" x="139" y="191">create_as_constraint_def</text></a><path class="line" d="m19 17 h2 m0 0 h10 m108 0 h10 m0 0 h10 m170 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-350 82 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m24 0 h10 m20 0 h10 m108 0 h10 m0 0 h10 m170 0 h10 m-338 0 h20 m318 0 h20 m-358 0 q10 0 10 10 m338 0 q0 -10 10 -10 m-348 10 v24 m338 0 v-24 m-338 24 q0 10 10 10 m318 0 q10 0 10 -10 m-328 10 h10 m86 0 h10 m0 0 h212 m-328 -10 v20 m338 0 v-20 m-338 20 v24 m338 0 v-24 m-338 24 q0 10 10 10 m318 0 q10 0 10 -10 m-328 10 h10 m182 0 h10 m0 0 h116 m-402 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m402 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-402 0 h10 m0 0 h392 m-442 32 h20 m442 0 h20 m-482 0 q10 0 10 10 m462 0 q0 -10 10 -10 m-472 10 v102 m462 0 v-102 m-462 102 q0 10 10 10 m442 0 q10 0 10 -10 m-452 10 h10 m0 0 h432 m23 -122 h-3"></path>
<polygon points="505 99 513 95 513 103"></polygon>
<polygon points="505 99 497 95 497 103"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
