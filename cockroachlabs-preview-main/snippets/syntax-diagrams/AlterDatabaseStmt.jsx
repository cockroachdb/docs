export const AlterDatabaseStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="697" width="435" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#alter_rename_database_stmt" xlink:title="alter_rename_database_stmt">
<rect height="32" width="210" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="210" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="186" font-size="11" class="nonterminal" x="61" y="21">alter_rename_database_stmt</text></a><a xlink:href="#alter_zone_database_stmt" xlink:title="alter_zone_database_stmt">
<rect height="32" width="192" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="192" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="168" font-size="11" class="nonterminal" x="61" y="65">alter_zone_database_stmt</text></a><a xlink:href="#alter_database_owner" xlink:title="alter_database_owner">
<rect height="32" width="164" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="164" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="11" class="nonterminal" x="61" y="109">alter_database_owner</text></a><a xlink:href="#alter_database_to_schema_stmt" xlink:title="alter_database_to_schema_stmt">
<rect height="32" width="232" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="232" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="208" font-size="11" class="nonterminal" x="61" y="153">alter_database_to_schema_stmt</text></a><a xlink:href="#alter_database_add_region_stmt" xlink:title="alter_database_add_region_stmt">
<rect height="32" width="234" x="51" y="179"></rect>
<rect class="nonterminal" height="32" width="234" x="49" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="11" class="nonterminal" x="61" y="197">alter_database_add_region_stmt</text></a><a xlink:href="#alter_database_drop_region_stmt" xlink:title="alter_database_drop_region_stmt">
<rect height="32" width="240" x="51" y="223"></rect>
<rect class="nonterminal" height="32" width="240" x="49" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="216" font-size="11" class="nonterminal" x="61" y="241">alter_database_drop_region_stmt</text></a><a xlink:href="#alter_database_survival_goal_stmt" xlink:title="alter_database_survival_goal_stmt">
<rect height="32" width="246" x="51" y="267"></rect>
<rect class="nonterminal" height="32" width="246" x="49" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="222" font-size="10" class="nonterminal" x="61" y="285">alter_database_survival_goal_stmt</text></a><a xlink:href="#alter_database_primary_region_stmt" xlink:title="alter_database_primary_region_stmt">
<rect height="32" width="258" x="51" y="311"></rect>
<rect class="nonterminal" height="32" width="258" x="49" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="234" font-size="11" class="nonterminal" x="61" y="329">alter_database_primary_region_stmt</text></a><a xlink:href="#alter_database_placement_stmt" xlink:title="alter_database_placement_stmt">
<rect height="32" width="228" x="51" y="355"></rect>
<rect class="nonterminal" height="32" width="228" x="49" y="353"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="204" font-size="11" class="nonterminal" x="61" y="373">alter_database_placement_stmt</text></a><a xlink:href="#alter_database_set_stmt" xlink:title="alter_database_set_stmt">
<rect height="32" width="182" x="51" y="399"></rect>
<rect class="nonterminal" height="32" width="182" x="49" y="397"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="158" font-size="11" class="nonterminal" x="61" y="417">alter_database_set_stmt</text></a><a xlink:href="#alter_database_add_super_region" xlink:title="alter_database_add_super_region">
<rect height="32" width="242" x="51" y="443"></rect>
<rect class="nonterminal" height="32" width="242" x="49" y="441"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="218" font-size="11" class="nonterminal" x="61" y="461">alter_database_add_super_region</text></a><a xlink:href="#alter_database_alter_super_region" xlink:title="alter_database_alter_super_region">
<rect height="32" width="246" x="51" y="487"></rect>
<rect class="nonterminal" height="32" width="246" x="49" y="485"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="222" font-size="10" class="nonterminal" x="61" y="505">alter_database_alter_super_region</text></a><a xlink:href="#alter_database_drop_super_region" xlink:title="alter_database_drop_super_region">
<rect height="32" width="246" x="51" y="531"></rect>
<rect class="nonterminal" height="32" width="246" x="49" y="529"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="222" font-size="11" class="nonterminal" x="61" y="549">alter_database_drop_super_region</text></a><a xlink:href="#alter_database_set_secondary_region_stmt" xlink:title="alter_database_set_secondary_region_stmt">
<rect height="32" width="304" x="51" y="575"></rect>
<rect class="nonterminal" height="32" width="304" x="49" y="573"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="280" font-size="11" class="nonterminal" x="61" y="593">alter_database_set_secondary_region_stmt</text></a><a xlink:href="#alter_database_drop_secondary_region" xlink:title="alter_database_drop_secondary_region">
<rect height="32" width="276" x="51" y="619"></rect>
<rect class="nonterminal" height="32" width="276" x="49" y="617"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="252" font-size="11" class="nonterminal" x="61" y="637">alter_database_drop_secondary_region</text></a><a xlink:href="#alter_database_set_zone_config_extension_stmt" xlink:title="alter_database_set_zone_config_extension_stmt">
<rect height="32" width="336" x="51" y="663"></rect>
<rect class="nonterminal" height="32" width="336" x="49" y="661"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="312" font-size="11" class="nonterminal" x="61" y="681">alter_database_set_zone_config_extension_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m210 0 h10 m0 0 h126 m-376 0 h20 m356 0 h20 m-396 0 q10 0 10 10 m376 0 q0 -10 10 -10 m-386 10 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m192 0 h10 m0 0 h144 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m164 0 h10 m0 0 h172 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m232 0 h10 m0 0 h104 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m234 0 h10 m0 0 h102 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m240 0 h10 m0 0 h96 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m246 0 h10 m0 0 h90 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m258 0 h10 m0 0 h78 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m228 0 h10 m0 0 h108 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m182 0 h10 m0 0 h154 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m242 0 h10 m0 0 h94 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m246 0 h10 m0 0 h90 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m246 0 h10 m0 0 h90 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m304 0 h10 m0 0 h32 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m276 0 h10 m0 0 h60 m-366 -10 v20 m376 0 v-20 m-376 20 v24 m376 0 v-24 m-376 24 q0 10 10 10 m356 0 q10 0 10 -10 m-366 10 h10 m336 0 h10 m23 -660 h-3"></path>
<polygon points="425 17 433 13 433 21"></polygon>
<polygon points="425 17 417 13 417 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
