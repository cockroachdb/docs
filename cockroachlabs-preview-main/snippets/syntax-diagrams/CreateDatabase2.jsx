export const CreateDatabase2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="765" width="751" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="385" y="53">EXISTS</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="487" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="485" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="497" y="21">database_name</text></a><rect height="32" rx="10" width="58" x="651" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="649" y="33"></rect>
<text class="terminal" x="659" y="53">WITH</text><a xlink:href="/docs/v23.2/sql-grammar#opt_template_clause" xlink:title="opt_template_clause">
<rect height="32" width="154" x="41" y="101"></rect>
<rect class="nonterminal" height="32" width="154" x="39" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="51" y="119">opt_template_clause</text></a><rect height="32" rx="10" width="94" x="235" y="133"></rect>
<rect class="terminal" height="32" rx="10" width="94" x="233" y="131"></rect>
<text class="terminal" x="243" y="151">ENCODING</text>
<rect height="32" rx="10" width="30" x="369" y="165"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="367" y="163"></rect>
<text class="terminal" x="377" y="183">=</text>
<rect height="32" width="78" x="439" y="133"></rect>
<rect class="nonterminal" height="32" width="78" x="437" y="131"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="54" font-size="10" class="nonterminal" x="449" y="151">encoding</text><a xlink:href="/docs/v23.2/sql-grammar#opt_lc_collate_clause" xlink:title="opt_lc_collate_clause">
<rect height="32" width="156" x="557" y="101"></rect>
<rect class="nonterminal" height="32" width="156" x="555" y="99"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="10" class="nonterminal" x="567" y="119">opt_lc_collate_clause</text></a><a xlink:href="/docs/v23.2/sql-grammar#opt_lc_ctype_clause" xlink:title="opt_lc_ctype_clause">
<rect height="32" width="148" x="99" y="231"></rect>
<rect class="nonterminal" height="32" width="148" x="97" y="229"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="109" y="249">opt_lc_ctype_clause</text></a><rect height="32" rx="10" width="112" x="287" y="263"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="285" y="261"></rect>
<text class="terminal" x="295" y="281">CONNECTION</text>
<rect height="32" rx="10" width="60" x="419" y="263"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="417" y="261"></rect>
<text class="terminal" x="427" y="281">LIMIT</text>
<rect height="32" rx="10" width="30" x="519" y="295"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="517" y="293"></rect>
<text class="terminal" x="527" y="313">=</text>
<rect height="32" width="46" x="589" y="263"></rect>
<rect class="nonterminal" height="32" width="46" x="587" y="261"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="22" font-size="10" class="nonterminal" x="599" y="281">limit</text><rect height="32" rx="10" width="84" x="181" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="179" y="375"></rect>
<text class="terminal" x="189" y="395">PRIMARY</text>
<rect height="32" rx="10" width="74" x="285" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="283" y="375"></rect>
<text class="terminal" x="293" y="395">REGION</text>
<rect height="32" rx="10" width="30" x="399" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="397" y="407"></rect>
<text class="terminal" x="407" y="427">=</text><a xlink:href="/docs/v23.2/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="469" y="377"></rect>
<rect class="nonterminal" height="32" width="104" x="467" y="375"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="479" y="395">region_name</text></a><rect height="32" rx="10" width="84" x="215" y="491"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="213" y="489"></rect>
<text class="terminal" x="223" y="509">REGIONS</text>
<rect height="32" rx="10" width="30" x="339" y="523"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="337" y="521"></rect>
<text class="terminal" x="347" y="541">=</text><a xlink:href="/docs/v23.2/sql-grammar#region_name_list" xlink:title="region_name_list">
<rect height="32" width="130" x="409" y="491"></rect>
<rect class="nonterminal" height="32" width="130" x="407" y="489"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="419" y="509">region_name_list</text></a><rect height="32" rx="10" width="80" x="84" y="621"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="82" y="619"></rect>
<text class="terminal" x="92" y="639">SURVIVE</text>
<rect height="32" rx="10" width="30" x="204" y="653"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="202" y="651"></rect>
<text class="terminal" x="212" y="671">=</text>
<rect height="32" rx="10" width="74" x="294" y="621"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="292" y="619"></rect>
<text class="terminal" x="302" y="639">REGION</text>
<rect height="32" rx="10" width="58" x="294" y="665"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="292" y="663"></rect>
<text class="terminal" x="302" y="683">ZONE</text>
<rect height="32" rx="10" width="78" x="408" y="621"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="406" y="619"></rect>
<text class="terminal" x="416" y="639">FAILURE</text><a xlink:href="/docs/v23.2/sql-grammar#opt_placement_clause" xlink:title="opt_placement_clause">
<rect height="32" width="164" x="526" y="589"></rect>
<rect class="nonterminal" height="32" width="164" x="524" y="587"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="11" class="nonterminal" x="536" y="607">opt_placement_clause</text></a><a xlink:href="/docs/v23.2/sql-grammar#opt_owner_clause" xlink:title="opt_owner_clause">
<rect height="32" width="136" x="155" y="731"></rect>
<rect class="nonterminal" height="32" width="136" x="153" y="729"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="11" class="nonterminal" x="165" y="749">opt_owner_clause</text></a><a xlink:href="/docs/v23.2/sql-grammar#opt_super_region_clause" xlink:title="opt_super_region_clause">
<rect height="32" width="182" x="311" y="731"></rect>
<rect class="nonterminal" height="32" width="182" x="309" y="729"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="11" class="nonterminal" x="321" y="749">opt_super_region_clause</text></a><a xlink:href="/docs/v23.2/sql-grammar#opt_secondary_region_clause" xlink:title="opt_secondary_region_clause">
<rect height="32" width="210" x="513" y="731"></rect>
<rect class="nonterminal" height="32" width="210" x="511" y="729"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="186" font-size="11" class="nonterminal" x="523" y="749">opt_secondary_region_clause</text></a><path class="line" d="m17 17 h2 m0 0 h10 m72 0 h10 m0 0 h10 m92 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m124 0 h10 m20 0 h10 m0 0 h68 m-98 0 h20 m78 0 h20 m-118 0 q10 0 10 10 m98 0 q0 -10 10 -10 m-108 10 v12 m98 0 v-12 m-98 12 q0 10 10 10 m78 0 q10 0 10 -10 m-88 10 h10 m58 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-732 98 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m154 0 h10 m20 0 h10 m0 0 h292 m-322 0 h20 m302 0 h20 m-342 0 q10 0 10 10 m322 0 q0 -10 10 -10 m-332 10 v12 m322 0 v-12 m-322 12 q0 10 10 10 m302 0 q10 0 10 -10 m-312 10 h10 m94 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m78 0 h10 m20 -32 h10 m156 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-658 130 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m148 0 h10 m20 0 h10 m0 0 h358 m-388 0 h20 m368 0 h20 m-408 0 q10 0 10 10 m388 0 q0 -10 10 -10 m-398 10 v12 m388 0 v-12 m-388 12 q0 10 10 10 m368 0 q10 0 10 -10 m-378 10 h10 m112 0 h10 m0 0 h10 m60 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m46 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-538 114 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h402 m-432 0 h20 m412 0 h20 m-452 0 q10 0 10 10 m432 0 q0 -10 10 -10 m-442 10 v12 m432 0 v-12 m-432 12 q0 10 10 10 m412 0 q10 0 10 -10 m-422 10 h10 m84 0 h10 m0 0 h10 m74 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m104 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-442 114 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h334 m-364 0 h20 m344 0 h20 m-384 0 q10 0 10 10 m364 0 q0 -10 10 -10 m-374 10 v12 m364 0 v-12 m-364 12 q0 10 10 10 m344 0 q10 0 10 -10 m-354 10 h10 m84 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m130 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-539 130 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h412 m-442 0 h20 m422 0 h20 m-462 0 q10 0 10 10 m442 0 q0 -10 10 -10 m-452 10 v12 m442 0 v-12 m-442 12 q0 10 10 10 m422 0 q10 0 10 -10 m-432 10 h10 m80 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m40 -32 h10 m74 0 h10 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m58 0 h10 m0 0 h16 m20 -44 h10 m78 0 h10 m20 -32 h10 m164 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-579 142 l2 0 m2 0 l2 0 m2 0 l2 0 m2 0 h10 m136 0 h10 m0 0 h10 m182 0 h10 m0 0 h10 m210 0 h10 m3 0 h-3"></path>
<polygon points="741 745 749 741 749 749"></polygon>
<polygon points="741 745 733 741 733 749"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
