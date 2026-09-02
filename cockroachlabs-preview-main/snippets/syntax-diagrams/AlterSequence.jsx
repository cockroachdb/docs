export const AlterSequence = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1021" width="611" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="62" x="33" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="31" y="1"></rect>
<text class="terminal" x="41" y="21">ALTER</text>
<rect height="32" rx="10" width="92" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">SEQUENCE</text>
<rect height="32" rx="10" width="34" x="247" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="245" y="33"></rect>
<text class="terminal" x="255" y="53">IF</text>
<rect height="32" rx="10" width="70" x="301" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="299" y="33"></rect>
<text class="terminal" x="309" y="53">EXISTS</text>
<rect height="32" width="124" x="411" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="409" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="421" y="21">sequence_name</text><rect height="32" rx="10" width="76" x="45" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="43" y="99"></rect>
<text class="terminal" x="53" y="119">RENAME</text>
<rect height="32" rx="10" width="38" x="141" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="139" y="99"></rect>
<text class="terminal" x="149" y="119">TO</text>
<rect height="32" width="124" x="199" y="101"></rect>
<rect class="nonterminal" height="32" width="124" x="197" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="209" y="119">sequence_name</text><rect height="32" rx="10" width="38" x="85" y="167"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="83" y="165"></rect>
<text class="terminal" x="93" y="185">AS</text><a xlink:href="/docs/stable/sql-grammar#typename" xlink:title="typename">
<rect height="32" width="84" x="143" y="167"></rect>
<rect class="nonterminal" height="32" width="84" x="141" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="153" y="185">typename</text></a><rect height="32" rx="10" width="40" x="85" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="83" y="209"></rect>
<text class="terminal" x="93" y="229">NO</text>
<rect height="32" rx="10" width="62" x="165" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="163" y="209"></rect>
<text class="terminal" x="173" y="229">CYCLE</text>
<rect height="32" rx="10" width="92" x="165" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="163" y="253"></rect>
<text class="terminal" x="173" y="273">MINVALUE</text>
<rect height="32" rx="10" width="94" x="165" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="163" y="297"></rect>
<text class="terminal" x="173" y="317">MAXVALUE</text>
<rect height="32" rx="10" width="72" x="85" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="83" y="341"></rect>
<text class="terminal" x="93" y="361">OWNED</text>
<rect height="32" rx="10" width="38" x="177" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="175" y="341"></rect>
<text class="terminal" x="185" y="361">BY</text>
<rect height="32" rx="10" width="58" x="255" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="253" y="341"></rect>
<text class="terminal" x="263" y="361">NONE</text><a xlink:href="/docs/stable/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="255" y="387"></rect>
<rect class="nonterminal" height="32" width="108" x="253" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="265" y="405">column_name</text></a><rect height="32" rx="10" width="46" x="125" y="463"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="123" y="461"></rect>
<text class="terminal" x="133" y="481">PER</text>
<rect height="32" rx="10" width="58" x="211" y="463"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="209" y="461"></rect>
<text class="terminal" x="219" y="481">NODE</text>
<rect height="32" rx="10" width="82" x="211" y="507"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="209" y="505"></rect>
<text class="terminal" x="219" y="525">SESSION</text>
<rect height="32" rx="10" width="66" x="353" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="351" y="429"></rect>
<text class="terminal" x="361" y="449">CACHE</text>
<rect height="32" rx="10" width="92" x="105" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="103" y="549"></rect>
<text class="terminal" x="113" y="569">MINVALUE</text>
<rect height="32" rx="10" width="94" x="105" y="595"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="103" y="593"></rect>
<text class="terminal" x="113" y="613">MAXVALUE</text>
<rect height="32" rx="10" width="100" x="105" y="639"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="103" y="637"></rect>
<text class="terminal" x="113" y="657">INCREMENT</text>
<rect height="32" rx="10" width="38" x="245" y="671"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="243" y="669"></rect>
<text class="terminal" x="253" y="689">BY</text>
<rect height="32" rx="10" width="64" x="105" y="715"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="103" y="713"></rect>
<text class="terminal" x="113" y="733">START</text>
<rect height="32" rx="10" width="58" x="209" y="747"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="207" y="745"></rect>
<text class="terminal" x="217" y="765">WITH</text>
<rect height="32" width="64" x="459" y="431"></rect>
<rect class="nonterminal" height="32" width="64" x="457" y="429"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="469" y="449">integer</text><rect height="32" rx="10" width="82" x="85" y="791"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="83" y="789"></rect>
<text class="terminal" x="93" y="809">RESTART</text>
<rect height="32" rx="10" width="58" x="227" y="855"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="225" y="853"></rect>
<text class="terminal" x="235" y="873">WITH</text>
<rect height="32" width="64" x="325" y="823"></rect>
<rect class="nonterminal" height="32" width="64" x="323" y="821"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="335" y="841">integer</text><rect height="32" rx="10" width="80" x="85" y="899"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="83" y="897"></rect>
<text class="terminal" x="93" y="917">VIRTUAL</text>
<rect height="32" rx="10" width="44" x="45" y="943"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="941"></rect>
<text class="terminal" x="53" y="961">SET</text>
<rect height="32" rx="10" width="76" x="109" y="943"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="107" y="941"></rect>
<text class="terminal" x="117" y="961">SCHEMA</text><a xlink:href="/docs/stable/sql-grammar#schema_name" xlink:title="schema_name">
<rect height="32" width="112" x="205" y="943"></rect>
<rect class="nonterminal" height="32" width="112" x="203" y="941"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="12" class="nonterminal" x="215" y="961">schema_name</text></a><rect height="32" rx="10" width="72" x="45" y="987"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="43" y="985"></rect>
<text class="terminal" x="53" y="1005">OWNER</text>
<rect height="32" rx="10" width="38" x="137" y="987"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="135" y="985"></rect>
<text class="terminal" x="145" y="1005">TO</text><a xlink:href="/docs/stable/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="195" y="987"></rect>
<rect class="nonterminal" height="32" width="82" x="193" y="985"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="205" y="1005">role_spec</text></a><path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m124 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-554 98 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m124 0 h10 m0 0 h240 m-558 0 h20 m538 0 h20 m-578 0 q10 0 10 10 m558 0 q0 -10 10 -10 m-568 10 v46 m558 0 v-46 m-558 46 q0 10 10 10 m538 0 q10 0 10 -10 m-508 10 h10 m38 0 h10 m0 0 h10 m84 0 h10 m0 0 h296 m-478 0 h20 m458 0 h20 m-498 0 q10 0 10 10 m478 0 q0 -10 10 -10 m-488 10 v24 m478 0 v-24 m-478 24 q0 10 10 10 m458 0 q10 0 10 -10 m-468 10 h10 m40 0 h10 m20 0 h10 m62 0 h10 m0 0 h32 m-134 0 h20 m114 0 h20 m-154 0 q10 0 10 10 m134 0 q0 -10 10 -10 m-144 10 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m92 0 h10 m0 0 h2 m-124 -10 v20 m134 0 v-20 m-134 20 v24 m134 0 v-24 m-134 24 q0 10 10 10 m114 0 q10 0 10 -10 m-124 10 h10 m94 0 h10 m20 -88 h244 m-468 -10 v20 m478 0 v-20 m-478 20 v112 m478 0 v-112 m-478 112 q0 10 10 10 m458 0 q10 0 10 -10 m-468 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m58 0 h10 m0 0 h50 m-148 0 h20 m128 0 h20 m-168 0 q10 0 10 10 m148 0 q0 -10 10 -10 m-158 10 v24 m148 0 v-24 m-148 24 q0 10 10 10 m128 0 q10 0 10 -10 m-138 10 h10 m108 0 h10 m20 -44 h140 m-468 -10 v20 m478 0 v-20 m-478 20 v68 m478 0 v-68 m-478 68 q0 10 10 10 m458 0 q10 0 10 -10 m-428 10 h10 m0 0 h198 m-228 0 h20 m208 0 h20 m-248 0 q10 0 10 10 m228 0 q0 -10 10 -10 m-238 10 v12 m228 0 v-12 m-228 12 q0 10 10 10 m208 0 q10 0 10 -10 m-218 10 h10 m46 0 h10 m20 0 h10 m58 0 h10 m0 0 h24 m-122 0 h20 m102 0 h20 m-142 0 q10 0 10 10 m122 0 q0 -10 10 -10 m-132 10 v24 m122 0 v-24 m-122 24 q0 10 10 10 m102 0 q10 0 10 -10 m-112 10 h10 m82 0 h10 m40 -76 h10 m66 0 h10 m-354 0 h20 m334 0 h20 m-374 0 q10 0 10 10 m354 0 q0 -10 10 -10 m-364 10 v100 m354 0 v-100 m-354 100 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m92 0 h10 m0 0 h222 m-344 -10 v20 m354 0 v-20 m-354 20 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m94 0 h10 m0 0 h220 m-344 -10 v20 m354 0 v-20 m-354 20 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m100 0 h10 m20 0 h10 m0 0 h48 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v12 m78 0 v-12 m-78 12 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m20 -32 h116 m-344 -10 v20 m354 0 v-20 m-354 20 v56 m354 0 v-56 m-354 56 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m64 0 h10 m20 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h132 m20 -284 h10 m64 0 h10 m-468 -10 v20 m478 0 v-20 m-478 20 v340 m478 0 v-340 m-478 340 q0 10 10 10 m458 0 q10 0 10 -10 m-468 10 h10 m82 0 h10 m20 0 h10 m0 0 h192 m-222 0 h20 m202 0 h20 m-242 0 q10 0 10 10 m222 0 q0 -10 10 -10 m-232 10 v12 m222 0 v-12 m-222 12 q0 10 10 10 m202 0 q10 0 10 -10 m-192 10 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m20 -32 h10 m64 0 h10 m20 -32 h114 m-468 -10 v20 m478 0 v-20 m-478 20 v88 m478 0 v-88 m-478 88 q0 10 10 10 m458 0 q10 0 10 -10 m-468 10 h10 m80 0 h10 m0 0 h358 m-498 -732 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m498 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-498 0 h10 m0 0 h488 m-528 22 v20 m558 0 v-20 m-558 20 v756 m558 0 v-756 m-558 756 q0 10 10 10 m538 0 q10 0 10 -10 m-548 10 h10 m44 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m112 0 h10 m0 0 h246 m-548 -10 v20 m558 0 v-20 m-558 20 v24 m558 0 v-24 m-558 24 q0 10 10 10 m538 0 q10 0 10 -10 m-548 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h286 m23 -886 h-3"></path>
<polygon points="601 115 609 111 609 119"></polygon>
<polygon points="601 115 593 111 593 119"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
