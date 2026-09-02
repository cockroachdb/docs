export const CreateSequence3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="855" width="735" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="72" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">CREATE</text><a xlink:href="/docs/v24.1/sql-grammar#opt_temp" xlink:title="opt_temp">
<rect height="32" width="82" x="123" y="3"></rect>
<rect class="nonterminal" height="32" width="82" x="121" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="11" class="nonterminal" x="133" y="21">opt_temp</text></a><rect height="32" rx="10" width="92" x="225" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="223" y="1"></rect>
<text class="terminal" x="233" y="21">SEQUENCE</text>
<rect height="32" rx="10" width="34" x="357" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="355" y="33"></rect>
<text class="terminal" x="365" y="53">IF</text>
<rect height="32" rx="10" width="48" x="411" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="409" y="33"></rect>
<text class="terminal" x="419" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="479" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="477" y="33"></rect>
<text class="terminal" x="487" y="53">EXISTS</text>
<rect height="32" width="124" x="589" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="587" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="599" y="21">sequence_name</text><rect height="32" rx="10" width="38" x="273" y="117"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="271" y="115"></rect>
<text class="terminal" x="281" y="135">AS</text><a xlink:href="/docs/v24.1/sql-grammar#typename" xlink:title="typename">
<rect height="32" width="84" x="331" y="117"></rect>
<rect class="nonterminal" height="32" width="84" x="329" y="115"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="341" y="135">typename</text></a><rect height="32" rx="10" width="40" x="273" y="161"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="271" y="159"></rect>
<text class="terminal" x="281" y="179">NO</text>
<rect height="32" rx="10" width="62" x="353" y="161"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="351" y="159"></rect>
<text class="terminal" x="361" y="179">CYCLE</text>
<rect height="32" rx="10" width="92" x="353" y="205"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="351" y="203"></rect>
<text class="terminal" x="361" y="223">MINVALUE</text>
<rect height="32" rx="10" width="94" x="353" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="351" y="247"></rect>
<text class="terminal" x="361" y="267">MAXVALUE</text>
<rect height="32" rx="10" width="72" x="273" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="271" y="291"></rect>
<text class="terminal" x="281" y="311">OWNED</text>
<rect height="32" rx="10" width="38" x="365" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="363" y="291"></rect>
<text class="terminal" x="373" y="311">BY</text>
<rect height="32" rx="10" width="58" x="443" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="441" y="291"></rect>
<text class="terminal" x="451" y="311">NONE</text><a xlink:href="/docs/v24.1/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="443" y="337"></rect>
<rect class="nonterminal" height="32" width="108" x="441" y="335"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="453" y="355">column_name</text></a><rect height="32" rx="10" width="46" x="313" y="413"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="311" y="411"></rect>
<text class="terminal" x="321" y="431">PER</text>
<rect height="32" rx="10" width="58" x="379" y="413"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="377" y="411"></rect>
<text class="terminal" x="387" y="431">NODE</text>
<rect height="32" rx="10" width="66" x="477" y="381"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="475" y="379"></rect>
<text class="terminal" x="485" y="399">CACHE</text>
<rect height="32" rx="10" width="92" x="293" y="457"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="291" y="455"></rect>
<text class="terminal" x="301" y="475">MINVALUE</text>
<rect height="32" rx="10" width="94" x="293" y="501"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="291" y="499"></rect>
<text class="terminal" x="301" y="519">MAXVALUE</text>
<rect height="32" rx="10" width="100" x="293" y="545"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="291" y="543"></rect>
<text class="terminal" x="301" y="563">INCREMENT</text>
<rect height="32" rx="10" width="38" x="433" y="577"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="431" y="575"></rect>
<text class="terminal" x="441" y="595">BY</text>
<rect height="32" rx="10" width="64" x="293" y="621"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="291" y="619"></rect>
<text class="terminal" x="301" y="639">START</text>
<rect height="32" rx="10" width="58" x="397" y="653"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="395" y="651"></rect>
<text class="terminal" x="405" y="671">WITH</text>
<rect height="32" width="64" x="583" y="381"></rect>
<rect class="nonterminal" height="32" width="64" x="581" y="379"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="593" y="399">integer</text><rect height="32" rx="10" width="82" x="273" y="697"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="271" y="695"></rect>
<text class="terminal" x="281" y="715">RESTART</text>
<rect height="32" rx="10" width="58" x="415" y="761"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="413" y="759"></rect>
<text class="terminal" x="423" y="779">WITH</text>
<rect height="32" width="64" x="513" y="729"></rect>
<rect class="nonterminal" height="32" width="64" x="511" y="727"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="523" y="747">integer</text><rect height="32" rx="10" width="80" x="273" y="805"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="271" y="803"></rect>
<text class="terminal" x="281" y="823">VIRTUAL</text>
<path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m124 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-544 114 l2 0 m2 0 l2 0 m2 0 l2 0 m62 0 h10 m38 0 h10 m0 0 h10 m84 0 h10 m0 0 h232 m-414 0 h20 m394 0 h20 m-434 0 q10 0 10 10 m414 0 q0 -10 10 -10 m-424 10 v24 m414 0 v-24 m-414 24 q0 10 10 10 m394 0 q10 0 10 -10 m-404 10 h10 m40 0 h10 m20 0 h10 m62 0 h10 m0 0 h32 m-134 0 h20 m114 0 h20 m-154 0 q10 0 10 10 m134 0 q0 -10 10 -10 m-144 10 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m92 0 h10 m0 0 h2 m-124 -10 v20 m134 0 v-20 m-134 20 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m94 0 h10 m20 -88 h180 m-404 -10 v20 m414 0 v-20 m-414 20 v112 m414 0 v-112 m-414 112 q0 10 10 10 m394 0 q10 0 10 -10 m-404 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m58 0 h10 m0 0 h50 m-148 0 h20 m128 0 h20 m-168 0 q10 0 10 10 m148 0 q0 -10 10 -10 m-158 10 v24 m148 0 v-24 m-148 24 q0 10 10 10 m128 0 q10 0 10 -10 m-138 10 h10 m108 0 h10 m20 -44 h76 m-404 -10 v20 m414 0 v-20 m-414 20 v68 m414 0 v-68 m-414 68 q0 10 10 10 m394 0 q10 0 10 -10 m-364 10 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m46 0 h10 m0 0 h10 m58 0 h10 m20 -32 h10 m66 0 h10 m-290 0 h20 m270 0 h20 m-310 0 q10 0 10 10 m290 0 q0 -10 10 -10 m-300 10 v56 m290 0 v-56 m-290 56 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m92 0 h10 m0 0 h158 m-280 -10 v20 m290 0 v-20 m-290 20 v24 m290 0 v-24 m-290 24 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m94 0 h10 m0 0 h156 m-280 -10 v20 m290 0 v-20 m-290 20 v24 m290 0 v-24 m-290 24 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m100 0 h10 m20 0 h10 m0 0 h48 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v12 m78 0 v-12 m-78 12 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m20 -32 h52 m-280 -10 v20 m290 0 v-20 m-290 20 v56 m290 0 v-56 m-290 56 q0 10 10 10 m270 0 q10 0 10 -10 m-280 10 h10 m64 0 h10 m20 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h68 m20 -240 h10 m64 0 h10 m-404 -10 v20 m414 0 v-20 m-414 20 v296 m414 0 v-296 m-414 296 q0 10 10 10 m394 0 q10 0 10 -10 m-404 10 h10 m82 0 h10 m20 0 h10 m0 0 h192 m-222 0 h20 m202 0 h20 m-242 0 q10 0 10 10 m222 0 q0 -10 10 -10 m-232 10 v12 m222 0 v-12 m-222 12 q0 10 10 10 m202 0 q10 0 10 -10 m-192 10 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h10 m64 0 h10 m20 -32 h50 m-404 -10 v20 m414 0 v-20 m-414 20 v88 m414 0 v-88 m-414 88 q0 10 10 10 m394 0 q10 0 10 -10 m-404 10 h10 m80 0 h10 m0 0 h294 m-434 -688 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m434 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-434 0 h10 m0 0 h424 m-474 32 h20 m474 0 h20 m-514 0 q10 0 10 10 m494 0 q0 -10 10 -10 m-504 10 v702 m494 0 v-702 m-494 702 q0 10 10 10 m474 0 q10 0 10 -10 m-484 10 h10 m0 0 h464 m23 -722 h-3"></path>
<polygon points="725 131 733 127 733 135"></polygon>
<polygon points="725 131 717 127 717 135"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
