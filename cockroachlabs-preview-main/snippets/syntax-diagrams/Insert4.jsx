export const Insert4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="519" width="1561" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="19 17 11 13 11 21"></polygon>
<rect height="32" rx="10" width="40" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">ON</text>
<rect height="32" rx="10" width="90" x="93" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="91" y="1"></rect>
<text class="terminal" x="101" y="21">CONFLICT</text>
<rect height="32" rx="10" width="40" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">DO</text>
<rect height="32" rx="10" width="86" x="105" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="103" y="67"></rect>
<text class="terminal" x="113" y="87">NOTHING</text>
<rect height="32" rx="10" width="26" x="65" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="63" y="155"></rect>
<text class="terminal" x="73" y="175">(</text><a xlink:href="/docs/v23.2/sql-grammar#name" xlink:title="name">
<rect height="32" width="56" x="131" y="157"></rect>
<rect class="nonterminal" height="32" width="56" x="129" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="141" y="175">name</text></a><rect height="32" rx="10" width="24" x="131" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="129" y="111"></rect>
<text class="terminal" x="139" y="131">,</text>
<rect height="32" rx="10" width="26" x="227" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="225" y="155"></rect>
<text class="terminal" x="235" y="175">)</text>
<rect height="32" rx="10" width="40" x="65" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="63" y="199"></rect>
<text class="terminal" x="73" y="219">ON</text>
<rect height="32" rx="10" width="110" x="125" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="123" y="199"></rect>
<text class="terminal" x="133" y="219">CONSTRAINT</text><a xlink:href="/docs/v23.2/sql-grammar#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="255" y="201"></rect>
<rect class="nonterminal" height="32" width="126" x="253" y="199"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="265" y="219">constraint_name</text></a><rect height="32" rx="10" width="40" x="421" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="419" y="155"></rect>
<text class="terminal" x="429" y="175">DO</text>
<rect height="32" rx="10" width="86" x="501" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="499" y="155"></rect>
<text class="terminal" x="509" y="175">NOTHING</text>
<rect height="32" rx="10" width="74" x="501" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="499" y="243"></rect>
<text class="terminal" x="509" y="263">UPDATE</text>
<rect height="32" rx="10" width="44" x="595" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="593" y="243"></rect>
<text class="terminal" x="603" y="263">SET</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="699" y="245"></rect>
<rect class="nonterminal" height="32" width="108" x="697" y="243"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="709" y="263">column_name</text></a><rect height="32" rx="10" width="30" x="827" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="825" y="243"></rect>
<text class="terminal" x="835" y="263">=</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="877" y="245"></rect>
<rect class="nonterminal" height="32" width="64" x="875" y="243"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="887" y="263">a_expr</text></a><rect height="32" rx="10" width="26" x="699" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="697" y="331"></rect>
<text class="terminal" x="707" y="351">(</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="765" y="333"></rect>
<rect class="nonterminal" height="32" width="108" x="763" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="775" y="351">column_name</text></a><rect height="32" rx="10" width="24" x="765" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="763" y="287"></rect>
<text class="terminal" x="773" y="307">,</text>
<rect height="32" rx="10" width="26" x="913" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="911" y="331"></rect>
<text class="terminal" x="921" y="351">)</text>
<rect height="32" rx="10" width="30" x="959" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="957" y="331"></rect>
<text class="terminal" x="967" y="351">=</text>
<rect height="32" rx="10" width="26" x="1009" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1007" y="331"></rect>
<text class="terminal" x="1017" y="351">(</text><a xlink:href="/docs/v23.2/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="1075" y="365"></rect>
<rect class="nonterminal" height="32" width="94" x="1073" y="363"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="1085" y="383">select_stmt</text></a><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="1075" y="453"></rect>
<rect class="nonterminal" height="32" width="64" x="1073" y="451"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="1085" y="471">a_expr</text></a><rect height="32" rx="10" width="24" x="1179" y="453"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1177" y="451"></rect>
<text class="terminal" x="1187" y="471">,</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="1263" y="453"></rect>
<rect class="nonterminal" height="32" width="64" x="1261" y="451"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="1273" y="471">a_expr</text></a><rect height="32" rx="10" width="24" x="1263" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1261" y="407"></rect>
<text class="terminal" x="1271" y="427">,</text>
<rect height="32" rx="10" width="26" x="1427" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1425" y="331"></rect>
<text class="terminal" x="1435" y="351">)</text>
<rect height="32" rx="10" width="24" x="679" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="677" y="199"></rect>
<text class="terminal" x="687" y="219">,</text>
<path class="line" d="m19 17 h2 m0 0 h10 m40 0 h10 m0 0 h10 m90 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-202 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m40 0 h10 m0 0 h10 m86 0 h10 m0 0 h1322 m-1508 0 h20 m1488 0 h20 m-1528 0 q10 0 10 10 m1508 0 q0 -10 10 -10 m-1518 10 v68 m1508 0 v-68 m-1508 68 q0 10 10 10 m1488 0 q10 0 10 -10 m-1478 10 h10 m26 0 h10 m20 0 h10 m56 0 h10 m-96 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m76 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-76 0 h10 m24 0 h10 m0 0 h32 m20 44 h10 m26 0 h10 m0 0 h128 m-356 0 h20 m336 0 h20 m-376 0 q10 0 10 10 m356 0 q0 -10 10 -10 m-366 10 v24 m356 0 v-24 m-356 24 q0 10 10 10 m336 0 q10 0 10 -10 m-346 10 h10 m40 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m126 0 h10 m20 -44 h10 m40 0 h10 m20 0 h10 m86 0 h10 m0 0 h906 m-1032 0 h20 m1012 0 h20 m-1052 0 q10 0 10 10 m1032 0 q0 -10 10 -10 m-1042 10 v68 m1032 0 v-68 m-1032 68 q0 10 10 10 m1012 0 q10 0 10 -10 m-1022 10 h10 m74 0 h10 m0 0 h10 m44 0 h10 m40 0 h10 m108 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m64 0 h10 m0 0 h512 m-794 0 h20 m774 0 h20 m-814 0 q10 0 10 10 m794 0 q0 -10 10 -10 m-804 10 v68 m794 0 v-68 m-794 68 q0 10 10 10 m774 0 q10 0 10 -10 m-784 10 h10 m26 0 h10 m20 0 h10 m108 0 h10 m-148 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m128 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-128 0 h10 m24 0 h10 m0 0 h84 m20 44 h10 m26 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h322 m-352 0 h20 m332 0 h20 m-372 0 q10 0 10 10 m352 0 q0 -10 10 -10 m-362 10 v12 m352 0 v-12 m-352 12 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m94 0 h10 m0 0 h218 m-342 -10 v20 m352 0 v-20 m-352 20 v68 m352 0 v-68 m-352 68 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m64 0 h10 m20 0 h10 m24 0 h10 m40 0 h10 m64 0 h10 m-104 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m84 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-84 0 h10 m24 0 h10 m0 0 h40 m-124 44 h20 m124 0 h20 m-164 0 q10 0 10 10 m144 0 q0 -10 10 -10 m-154 10 v14 m144 0 v-14 m-144 14 q0 10 10 10 m124 0 q10 0 10 -10 m-134 10 h10 m0 0 h114 m-208 -34 h20 m208 0 h20 m-248 0 q10 0 10 10 m228 0 q0 -10 10 -10 m-238 10 v30 m228 0 v-30 m-228 30 q0 10 10 10 m208 0 q10 0 10 -10 m-218 10 h10 m0 0 h198 m40 -170 h10 m26 0 h10 m-814 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m814 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-814 0 h10 m24 0 h10 m0 0 h770 m63 -132 h-3"></path>
<polygon points="1551 83 1559 79 1559 87"></polygon>
<polygon points="1551 83 1543 79 1543 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
