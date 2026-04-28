export const CreateDatabaseStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="333" width="757" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="39" y="21">CREATE</text>
<rect height="32" rx="10" width="92" x="123" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="121" y="1"></rect>
<text class="terminal" x="131" y="21">DATABASE</text>
<rect height="32" rx="10" width="34" x="255" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="253" y="33"></rect>
<text class="terminal" x="263" y="53">IF</text>
<rect height="32" rx="10" width="48" x="309" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="307" y="33"></rect>
<text class="terminal" x="317" y="53">NOT</text>
<rect height="32" rx="10" width="70" x="377" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="375" y="33"></rect>
<text class="terminal" x="385" y="53">EXISTS</text><a xlink:href="#database_name" xlink:title="database_name">
<rect height="32" width="124" x="487" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="485" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="497" y="21">database_name</text></a><a xlink:href="#opt_with" xlink:title="opt_with">
<rect height="32" width="74" x="631" y="3"></rect>
<rect class="nonterminal" height="32" width="74" x="629" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="50" font-size="10" class="nonterminal" x="641" y="21">opt_with</text></a><a xlink:href="#opt_template_clause" xlink:title="opt_template_clause">
<rect height="32" width="154" x="44" y="101"></rect>
<rect class="nonterminal" height="32" width="154" x="42" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="54" y="119">opt_template_clause</text></a><a xlink:href="#opt_encoding_clause" xlink:title="opt_encoding_clause">
<rect height="32" width="154" x="218" y="101"></rect>
<rect class="nonterminal" height="32" width="154" x="216" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="228" y="119">opt_encoding_clause</text></a><a xlink:href="#opt_lc_collate_clause" xlink:title="opt_lc_collate_clause">
<rect height="32" width="156" x="392" y="101"></rect>
<rect class="nonterminal" height="32" width="156" x="390" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="10" class="nonterminal" x="402" y="119">opt_lc_collate_clause</text></a><a xlink:href="#opt_lc_ctype_clause" xlink:title="opt_lc_ctype_clause">
<rect height="32" width="148" x="568" y="101"></rect>
<rect class="nonterminal" height="32" width="148" x="566" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="578" y="119">opt_lc_ctype_clause</text></a><a xlink:href="#opt_connection_limit" xlink:title="opt_connection_limit">
<rect height="32" width="152" x="25" y="167"></rect>
<rect class="nonterminal" height="32" width="152" x="23" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="10" class="nonterminal" x="35" y="185">opt_connection_limit</text></a><a xlink:href="#opt_primary_region_clause" xlink:title="opt_primary_region_clause">
<rect height="32" width="194" x="197" y="167"></rect>
<rect class="nonterminal" height="32" width="194" x="195" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="170" font-size="10" class="nonterminal" x="207" y="185">opt_primary_region_clause</text></a><a xlink:href="#opt_regions_list" xlink:title="opt_regions_list">
<rect height="32" width="122" x="411" y="167"></rect>
<rect class="nonterminal" height="32" width="122" x="409" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="421" y="185">opt_regions_list</text></a><a xlink:href="#opt_survival_goal_clause" xlink:title="opt_survival_goal_clause">
<rect height="32" width="182" x="553" y="167"></rect>
<rect class="nonterminal" height="32" width="182" x="551" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="10" class="nonterminal" x="563" y="185">opt_survival_goal_clause</text></a><a xlink:href="#opt_placement_clause" xlink:title="opt_placement_clause">
<rect height="32" width="164" x="119" y="233"></rect>
<rect class="nonterminal" height="32" width="164" x="117" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="11" class="nonterminal" x="129" y="251">opt_placement_clause</text></a><a xlink:href="#opt_owner_clause" xlink:title="opt_owner_clause">
<rect height="32" width="136" x="303" y="233"></rect>
<rect class="nonterminal" height="32" width="136" x="301" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="313" y="251">opt_owner_clause</text></a><a xlink:href="#opt_super_region_clause" xlink:title="opt_super_region_clause">
<rect height="32" width="182" x="459" y="233"></rect>
<rect class="nonterminal" height="32" width="182" x="457" y="231"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="11" class="nonterminal" x="469" y="251">opt_super_region_clause</text></a><a xlink:href="#opt_secondary_region_clause" xlink:title="opt_secondary_region_clause">
<rect height="32" width="210" x="519" y="299"></rect>
<rect class="nonterminal" height="32" width="210" x="517" y="297"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="186" font-size="11" class="nonterminal" x="529" y="317">opt_secondary_region_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m124 0 h10 m0 0 h10 m74 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-705 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m154 0 h10 m0 0 h10 m154 0 h10 m0 0 h10 m156 0 h10 m0 0 h10 m148 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-735 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m152 0 h10 m0 0 h10 m194 0 h10 m0 0 h10 m122 0 h10 m0 0 h10 m182 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-660 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m164 0 h10 m0 0 h10 m136 0 h10 m0 0 h10 m182 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-166 66 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m210 0 h10 m3 0 h-3"></path>
<polygon points="747 313 755 309 755 317"></polygon>
<polygon points="747 313 739 309 739 317"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
