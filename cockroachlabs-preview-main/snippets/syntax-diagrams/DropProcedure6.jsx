export const DropProcedure6 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="299" width="677" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="104" x="111" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="109" y="1"></rect>
<text class="terminal" x="119" y="21">PROCEDURE</text>
<rect height="32" rx="10" width="34" x="255" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="253" y="33"></rect>
<text class="terminal" x="263" y="53">IF</text>
<rect height="32" rx="10" width="70" x="309" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="307" y="33"></rect>
<text class="terminal" x="317" y="53">EXISTS</text>
<rect height="32" width="90" x="45" y="189"></rect>
<rect class="nonterminal" height="32" width="90" x="43" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="11" class="nonterminal" x="55" y="207">proc_name</text><rect height="32" rx="10" width="26" x="175" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="173" y="187"></rect>
<text class="terminal" x="183" y="207">(</text><a xlink:href="/docs/v25.4/sql-grammar#routine_param" xlink:title="routine_param">
<rect height="32" width="114" x="261" y="189"></rect>
<rect class="nonterminal" height="32" width="114" x="259" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="11" class="nonterminal" x="271" y="207">routine_param</text></a><rect height="32" rx="10" width="24" x="261" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="259" y="143"></rect>
<text class="terminal" x="269" y="163">,</text>
<rect height="32" rx="10" width="26" x="435" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="433" y="187"></rect>
<text class="terminal" x="443" y="207">)</text>
<rect height="32" rx="10" width="24" x="45" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="43" y="99"></rect>
<text class="terminal" x="53" y="119">,</text>
<rect height="32" rx="10" width="84" x="541" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="539" y="219"></rect>
<text class="terminal" x="549" y="239">CASCADE</text>
<rect height="32" rx="10" width="88" x="541" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="539" y="263"></rect>
<text class="terminal" x="549" y="283">RESTRICT</text>
<path class="line" d="m19 17 h2 m0 0 h10 m58 0 h10 m0 0 h10 m104 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-418 186 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m90 0 h10 m20 0 h10 m26 0 h10 m40 0 h10 m114 0 h10 m-154 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m134 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-134 0 h10 m24 0 h10 m0 0 h90 m-174 44 h20 m174 0 h20 m-214 0 q10 0 10 10 m194 0 q0 -10 10 -10 m-204 10 v14 m194 0 v-14 m-194 14 q0 10 10 10 m174 0 q10 0 10 -10 m-184 10 h10 m0 0 h164 m20 -34 h10 m26 0 h10 m-326 0 h20 m306 0 h20 m-346 0 q10 0 10 10 m326 0 q0 -10 10 -10 m-336 10 v30 m326 0 v-30 m-326 30 q0 10 10 10 m306 0 q10 0 10 -10 m-316 10 h10 m0 0 h296 m-456 -50 l20 0 m-1 0 q-9 0 -9 -10 l0 -68 q0 -10 10 -10 m456 88 l20 0 m-20 0 q10 0 10 -10 l0 -68 q0 -10 -10 -10 m-456 0 h10 m24 0 h10 m0 0 h412 m40 88 h10 m0 0 h98 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v12 m128 0 v-12 m-128 12 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m84 0 h10 m0 0 h4 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m23 -76 h-3"></path>
<polygon points="667 203 675 199 675 207"></polygon>
<polygon points="667 203 659 199 659 207"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
