export const DropFunction4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="255" width="651" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="58" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">DROP</text>
<rect height="32" rx="10" width="92" x="111" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="109" y="1"></rect>
<text class="terminal" x="119" y="21">FUNCTION</text>
<rect height="32" rx="10" width="34" x="243" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="241" y="33"></rect>
<text class="terminal" x="251" y="53">IF</text>
<rect height="32" rx="10" width="70" x="297" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="295" y="33"></rect>
<text class="terminal" x="305" y="53">EXISTS</text>
<rect height="32" width="90" x="45" y="145"></rect>
<rect class="nonterminal" height="32" width="90" x="43" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="11" class="nonterminal" x="55" y="163">func_name</text><rect height="32" rx="10" width="26" x="175" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="173" y="175"></rect>
<text class="terminal" x="183" y="195">(</text><a xlink:href="/docs/v24.3/sql-grammar#func_params_list" xlink:title="func_params_list">
<rect height="32" width="128" x="241" y="209"></rect>
<rect class="nonterminal" height="32" width="128" x="239" y="207"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="251" y="227">func_params_list</text></a><rect height="32" rx="10" width="26" x="409" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="407" y="175"></rect>
<text class="terminal" x="417" y="195">)</text>
<rect height="32" rx="10" width="24" x="45" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="43" y="99"></rect>
<text class="terminal" x="53" y="119">,</text>
<rect height="32" rx="10" width="84" x="515" y="177"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="513" y="175"></rect>
<text class="terminal" x="523" y="195">CASCADE</text>
<rect height="32" rx="10" width="88" x="515" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="513" y="219"></rect>
<text class="terminal" x="523" y="239">RESTRICT</text>
<path class="line" d="m19 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-406 142 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m90 0 h10 m20 0 h10 m0 0 h270 m-300 0 h20 m280 0 h20 m-320 0 q10 0 10 10 m300 0 q0 -10 10 -10 m-310 10 v12 m300 0 v-12 m-300 12 q0 10 10 10 m280 0 q10 0 10 -10 m-290 10 h10 m26 0 h10 m20 0 h10 m0 0 h138 m-168 0 h20 m148 0 h20 m-188 0 q10 0 10 10 m168 0 q0 -10 10 -10 m-178 10 v12 m168 0 v-12 m-168 12 q0 10 10 10 m148 0 q10 0 10 -10 m-158 10 h10 m128 0 h10 m20 -32 h10 m26 0 h10 m-430 -32 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m430 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-430 0 h10 m24 0 h10 m0 0 h386 m40 44 h10 m0 0 h98 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v12 m128 0 v-12 m-128 12 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m84 0 h10 m0 0 h4 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m23 -76 h-3"></path>
<polygon points="641 159 649 155 649 163"></polygon>
<polygon points="641 159 633 155 633 163"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
