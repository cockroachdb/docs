export const SimpleSelectClause = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="191" width="739" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="70" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SELECT</text><a xlink:href="#opt_all_clause" xlink:title="opt_all_clause">
<rect height="32" width="112" x="141" y="3"></rect>
<rect class="nonterminal" height="32" width="112" x="139" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="10" class="nonterminal" x="151" y="21">opt_all_clause</text></a><a xlink:href="#opt_target_list" xlink:title="opt_target_list">
<rect height="32" width="114" x="273" y="3"></rect>
<rect class="nonterminal" height="32" width="114" x="271" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="283" y="21">opt_target_list</text></a><rect height="32" rx="10" width="86" x="161" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="159" y="45"></rect>
<text class="terminal" x="169" y="65">DISTINCT</text><a xlink:href="#distinct_on_clause" xlink:title="distinct_on_clause">
<rect height="32" width="138" x="161" y="91"></rect>
<rect class="nonterminal" height="32" width="138" x="159" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="10" class="nonterminal" x="171" y="109">distinct_on_clause</text></a><a xlink:href="#target_list" xlink:title="target_list">
<rect height="32" width="86" x="339" y="47"></rect>
<rect class="nonterminal" height="32" width="86" x="337" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="349" y="65">target_list</text></a><a xlink:href="#from_clause" xlink:title="from_clause">
<rect height="32" width="96" x="465" y="3"></rect>
<rect class="nonterminal" height="32" width="96" x="463" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="475" y="21">from_clause</text></a><a xlink:href="#opt_where_clause" xlink:title="opt_where_clause">
<rect height="32" width="136" x="581" y="3"></rect>
<rect class="nonterminal" height="32" width="136" x="579" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="591" y="21">opt_where_clause</text></a><a xlink:href="#group_clause" xlink:title="group_clause">
<rect height="32" width="106" x="341" y="157"></rect>
<rect class="nonterminal" height="32" width="106" x="339" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="11" class="nonterminal" x="351" y="175">group_clause</text></a><a xlink:href="#having_clause" xlink:title="having_clause">
<rect height="32" width="110" x="467" y="157"></rect>
<rect class="nonterminal" height="32" width="110" x="465" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="477" y="175">having_clause</text></a><a xlink:href="#window_clause" xlink:title="window_clause">
<rect height="32" width="114" x="597" y="157"></rect>
<rect class="nonterminal" height="32" width="114" x="595" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="11" class="nonterminal" x="607" y="175">window_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m70 0 h10 m20 0 h10 m112 0 h10 m0 0 h10 m114 0 h10 m0 0 h38 m-324 0 h20 m304 0 h20 m-344 0 q10 0 10 10 m324 0 q0 -10 10 -10 m-334 10 v24 m324 0 v-24 m-324 24 q0 10 10 10 m304 0 q10 0 10 -10 m-294 10 h10 m86 0 h10 m0 0 h52 m-178 0 h20 m158 0 h20 m-198 0 q10 0 10 10 m178 0 q0 -10 10 -10 m-188 10 v24 m178 0 v-24 m-178 24 q0 10 10 10 m158 0 q10 0 10 -10 m-168 10 h10 m138 0 h10 m20 -44 h10 m86 0 h10 m20 -44 h10 m96 0 h10 m0 0 h10 m136 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-420 154 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m106 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m114 0 h10 m3 0 h-3"></path>
<polygon points="729 171 737 167 737 175"></polygon>
<polygon points="729 171 721 167 721 175"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
