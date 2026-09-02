export const AlterTypeStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="355" width="767" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="54" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">TYPE</text><a xlink:href="#type_name" xlink:title="type_name">
<rect height="32" width="92" x="189" y="3"></rect>
<rect class="nonterminal" height="32" width="92" x="187" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="12" class="nonterminal" x="199" y="21">type_name</text></a><rect height="32" rx="10" width="48" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">ADD</text>
<rect height="32" rx="10" width="64" x="113" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="111" y="67"></rect>
<text class="terminal" x="121" y="87">VALUE</text>
<rect height="32" rx="10" width="34" x="217" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="215" y="99"></rect>
<text class="terminal" x="225" y="119">IF</text>
<rect height="32" rx="10" width="48" x="271" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="269" y="99"></rect>
<text class="terminal" x="279" y="119">NOT</text>
<rect height="32" rx="10" width="70" x="339" y="101"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="337" y="99"></rect>
<text class="terminal" x="347" y="119">EXISTS</text>
<rect height="32" rx="10" width="76" x="449" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="447" y="67"></rect>
<text class="terminal" x="457" y="87">SCONST</text><a xlink:href="#opt_add_val_placement" xlink:title="opt_add_val_placement">
<rect height="32" width="174" x="545" y="69"></rect>
<rect class="nonterminal" height="32" width="174" x="543" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="11" class="nonterminal" x="555" y="87">opt_add_val_placement</text></a><rect height="32" rx="10" width="58" x="45" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="43" y="143"></rect>
<text class="terminal" x="53" y="163">DROP</text>
<rect height="32" rx="10" width="64" x="123" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="121" y="143"></rect>
<text class="terminal" x="131" y="163">VALUE</text>
<rect height="32" rx="10" width="76" x="207" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="205" y="143"></rect>
<text class="terminal" x="215" y="163">SCONST</text>
<rect height="32" rx="10" width="76" x="45" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="43" y="187"></rect>
<text class="terminal" x="53" y="207">RENAME</text>
<rect height="32" rx="10" width="64" x="161" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="159" y="187"></rect>
<text class="terminal" x="169" y="207">VALUE</text>
<rect height="32" rx="10" width="76" x="245" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="243" y="187"></rect>
<text class="terminal" x="253" y="207">SCONST</text>
<rect height="32" rx="10" width="38" x="341" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="339" y="187"></rect>
<text class="terminal" x="349" y="207">TO</text>
<rect height="32" rx="10" width="76" x="399" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="397" y="187"></rect>
<text class="terminal" x="407" y="207">SCONST</text>
<rect height="32" rx="10" width="38" x="161" y="233"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="159" y="231"></rect>
<text class="terminal" x="169" y="251">TO</text><a xlink:href="#name" xlink:title="name">
<rect height="32" width="56" x="219" y="233"></rect>
<rect class="nonterminal" height="32" width="56" x="217" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="32" font-size="12" class="nonterminal" x="229" y="251">name</text></a><rect height="32" rx="10" width="44" x="45" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="275"></rect>
<text class="terminal" x="53" y="295">SET</text>
<rect height="32" rx="10" width="76" x="109" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="107" y="275"></rect>
<text class="terminal" x="117" y="295">SCHEMA</text><a xlink:href="#schema_name" xlink:title="schema_name">
<rect height="32" width="112" x="205" y="277"></rect>
<rect class="nonterminal" height="32" width="112" x="203" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="88" font-size="12" class="nonterminal" x="215" y="295">schema_name</text></a><rect height="32" rx="10" width="72" x="45" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="43" y="319"></rect>
<text class="terminal" x="53" y="339">OWNER</text>
<rect height="32" rx="10" width="38" x="137" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="135" y="319"></rect>
<text class="terminal" x="145" y="339">TO</text><a xlink:href="#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="195" y="321"></rect>
<rect class="nonterminal" height="32" width="82" x="193" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="205" y="339">role_spec</text></a><path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m92 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-300 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m48 0 h10 m0 0 h10 m64 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m76 0 h10 m0 0 h10 m174 0 h10 m-714 0 h20 m694 0 h20 m-734 0 q10 0 10 10 m714 0 q0 -10 10 -10 m-724 10 v56 m714 0 v-56 m-714 56 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m58 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m76 0 h10 m0 0 h436 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m76 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m76 0 h10 m-354 0 h20 m334 0 h20 m-374 0 q10 0 10 10 m354 0 q0 -10 10 -10 m-364 10 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m38 0 h10 m0 0 h10 m56 0 h10 m0 0 h200 m20 -44 h224 m-704 -10 v20 m714 0 v-20 m-714 20 v68 m714 0 v-68 m-714 68 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m44 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m112 0 h10 m0 0 h402 m-704 -10 v20 m714 0 v-20 m-714 20 v24 m714 0 v-24 m-714 24 q0 10 10 10 m694 0 q10 0 10 -10 m-704 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h442 m23 -252 h-3"></path>
<polygon points="757 83 765 79 765 87"></polygon>
<polygon points="757 83 749 79 749 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
