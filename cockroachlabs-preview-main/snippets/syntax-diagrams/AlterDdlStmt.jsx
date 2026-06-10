export const AlterDdlStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="741" width="307" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#alter_table_stmt" xlink:title="alter_table_stmt">
<rect height="32" width="126" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="126" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="61" y="21">alter_table_stmt</text></a><a xlink:href="#alter_index_stmt" xlink:title="alter_index_stmt">
<rect height="32" width="128" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="128" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="61" y="65">alter_index_stmt</text></a><a xlink:href="#alter_view_stmt" xlink:title="alter_view_stmt">
<rect height="32" width="122" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="122" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="61" y="109">alter_view_stmt</text></a><a xlink:href="#alter_sequence_stmt" xlink:title="alter_sequence_stmt">
<rect height="32" width="154" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="61" y="153">alter_sequence_stmt</text></a><a xlink:href="#alter_database_stmt" xlink:title="alter_database_stmt">
<rect height="32" width="154" x="51" y="179"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="61" y="197">alter_database_stmt</text></a><a xlink:href="#alter_range_stmt" xlink:title="alter_range_stmt">
<rect height="32" width="130" x="51" y="223"></rect>
<rect class="nonterminal" height="32" width="130" x="49" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="61" y="241">alter_range_stmt</text></a><a xlink:href="#alter_partition_stmt" xlink:title="alter_partition_stmt">
<rect height="32" width="148" x="51" y="267"></rect>
<rect class="nonterminal" height="32" width="148" x="49" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="61" y="285">alter_partition_stmt</text></a><a xlink:href="#alter_schema_stmt" xlink:title="alter_schema_stmt">
<rect height="32" width="142" x="51" y="311"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="61" y="329">alter_schema_stmt</text></a><a xlink:href="#alter_type_stmt" xlink:title="alter_type_stmt">
<rect height="32" width="122" x="51" y="355"></rect>
<rect class="nonterminal" height="32" width="122" x="49" y="353"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="61" y="373">alter_type_stmt</text></a><a xlink:href="#alter_default_privileges_stmt" xlink:title="alter_default_privileges_stmt">
<rect height="32" width="208" x="51" y="399"></rect>
<rect class="nonterminal" height="32" width="208" x="49" y="397"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="184" font-size="10" class="nonterminal" x="61" y="417">alter_default_privileges_stmt</text></a><a xlink:href="#alter_changefeed_stmt" xlink:title="alter_changefeed_stmt">
<rect height="32" width="168" x="51" y="443"></rect>
<rect class="nonterminal" height="32" width="168" x="49" y="441"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="11" class="nonterminal" x="61" y="461">alter_changefeed_stmt</text></a><a xlink:href="#alter_backup_stmt" xlink:title="alter_backup_stmt">
<rect height="32" width="138" x="51" y="487"></rect>
<rect class="nonterminal" height="32" width="138" x="49" y="485"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="114" font-size="10" class="nonterminal" x="61" y="505">alter_backup_stmt</text></a><a xlink:href="#alter_func_stmt" xlink:title="alter_func_stmt">
<rect height="32" width="120" x="51" y="531"></rect>
<rect class="nonterminal" height="32" width="120" x="49" y="529"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="10" class="nonterminal" x="61" y="549">alter_func_stmt</text></a><a xlink:href="#alter_proc_stmt" xlink:title="alter_proc_stmt">
<rect height="32" width="120" x="51" y="575"></rect>
<rect class="nonterminal" height="32" width="120" x="49" y="573"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="10" class="nonterminal" x="61" y="593">alter_proc_stmt</text></a><a xlink:href="#alter_backup_schedule" xlink:title="alter_backup_schedule">
<rect height="32" width="166" x="51" y="619"></rect>
<rect class="nonterminal" height="32" width="166" x="49" y="617"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="61" y="637">alter_backup_schedule</text></a><a xlink:href="#alter_policy_stmt" xlink:title="alter_policy_stmt">
<rect height="32" width="130" x="51" y="663"></rect>
<rect class="nonterminal" height="32" width="130" x="49" y="661"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="61" y="681">alter_policy_stmt</text></a><a xlink:href="#alter_job_stmt" xlink:title="alter_job_stmt">
<rect height="32" width="114" x="51" y="707"></rect>
<rect class="nonterminal" height="32" width="114" x="49" y="705"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="61" y="725">alter_job_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m126 0 h10 m0 0 h82 m-248 0 h20 m228 0 h20 m-268 0 q10 0 10 10 m248 0 q0 -10 10 -10 m-258 10 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m128 0 h10 m0 0 h80 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m122 0 h10 m0 0 h86 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m154 0 h10 m0 0 h54 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m154 0 h10 m0 0 h54 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m130 0 h10 m0 0 h78 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m148 0 h10 m0 0 h60 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m142 0 h10 m0 0 h66 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m122 0 h10 m0 0 h86 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m208 0 h10 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m168 0 h10 m0 0 h40 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m138 0 h10 m0 0 h70 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m120 0 h10 m0 0 h88 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m120 0 h10 m0 0 h88 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m166 0 h10 m0 0 h42 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m130 0 h10 m0 0 h78 m-238 -10 v20 m248 0 v-20 m-248 20 v24 m248 0 v-24 m-248 24 q0 10 10 10 m228 0 q10 0 10 -10 m-238 10 h10 m114 0 h10 m0 0 h94 m23 -704 h-3"></path>
<polygon points="297 17 305 13 305 21"></polygon>
<polygon points="297 17 289 13 289 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
