export const PreparableStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1049" width="277" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#alter_stmt" xlink:title="alter_stmt">
<rect height="32" width="86" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="86" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="61" y="21">alter_stmt</text></a><a xlink:href="#backup_stmt" xlink:title="backup_stmt">
<rect height="32" width="102" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="61" y="65">backup_stmt</text></a><a xlink:href="#cancel_stmt" xlink:title="cancel_stmt">
<rect height="32" width="96" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="96" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="61" y="109">cancel_stmt</text></a><a xlink:href="#create_stmt" xlink:title="create_stmt">
<rect height="32" width="96" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="96" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="61" y="153">create_stmt</text></a><a xlink:href="#check_stmt" xlink:title="check_stmt">
<rect height="32" width="92" x="51" y="179"></rect>
<rect class="nonterminal" height="32" width="92" x="49" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="61" y="197">check_stmt</text></a><a xlink:href="#delete_stmt" xlink:title="delete_stmt">
<rect height="32" width="96" x="51" y="223"></rect>
<rect class="nonterminal" height="32" width="96" x="49" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="61" y="241">delete_stmt</text></a><a xlink:href="#drop_stmt" xlink:title="drop_stmt">
<rect height="32" width="86" x="51" y="267"></rect>
<rect class="nonterminal" height="32" width="86" x="49" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="11" class="nonterminal" x="61" y="285">drop_stmt</text></a><a xlink:href="#explain_stmt" xlink:title="explain_stmt">
<rect height="32" width="102" x="51" y="311"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="61" y="329">explain_stmt</text></a><a xlink:href="#import_stmt" xlink:title="import_stmt">
<rect height="32" width="98" x="51" y="355"></rect>
<rect class="nonterminal" height="32" width="98" x="49" y="353"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="61" y="373">import_stmt</text></a><a xlink:href="#execute_schedules_stmt" xlink:title="execute_schedules_stmt">
<rect height="32" width="178" x="51" y="399"></rect>
<rect class="nonterminal" height="32" width="178" x="49" y="397"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="154" font-size="11" class="nonterminal" x="61" y="417">execute_schedules_stmt</text></a><a xlink:href="#insert_stmt" xlink:title="insert_stmt">
<rect height="32" width="92" x="51" y="443"></rect>
<rect class="nonterminal" height="32" width="92" x="49" y="441"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="68" font-size="10" class="nonterminal" x="61" y="461">insert_stmt</text></a><a xlink:href="#inspect_stmt" xlink:title="inspect_stmt">
<rect height="32" width="102" x="51" y="487"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="485"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="61" y="505">inspect_stmt</text></a><a xlink:href="#pause_stmt" xlink:title="pause_stmt">
<rect height="32" width="96" x="51" y="531"></rect>
<rect class="nonterminal" height="32" width="96" x="49" y="529"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="61" y="549">pause_stmt</text></a><a xlink:href="#reset_stmt" xlink:title="reset_stmt">
<rect height="32" width="90" x="51" y="575"></rect>
<rect class="nonterminal" height="32" width="90" x="49" y="573"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="61" y="593">reset_stmt</text></a><a xlink:href="#restore_stmt" xlink:title="restore_stmt">
<rect height="32" width="102" x="51" y="619"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="617"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="61" y="637">restore_stmt</text></a><a xlink:href="#resume_stmt" xlink:title="resume_stmt">
<rect height="32" width="104" x="51" y="663"></rect>
<rect class="nonterminal" height="32" width="104" x="49" y="661"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="61" y="681">resume_stmt</text></a><a xlink:href="#export_stmt" xlink:title="export_stmt">
<rect height="32" width="98" x="51" y="707"></rect>
<rect class="nonterminal" height="32" width="98" x="49" y="705"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="61" y="725">export_stmt</text></a><a xlink:href="#scrub_stmt" xlink:title="scrub_stmt">
<rect height="32" width="90" x="51" y="751"></rect>
<rect class="nonterminal" height="32" width="90" x="49" y="749"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="61" y="769">scrub_stmt</text></a><a xlink:href="#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="51" y="795"></rect>
<rect class="nonterminal" height="32" width="94" x="49" y="793"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="61" y="813">select_stmt</text></a><a xlink:href="#preparable_set_stmt" xlink:title="preparable_set_stmt">
<rect height="32" width="154" x="51" y="839"></rect>
<rect class="nonterminal" height="32" width="154" x="49" y="837"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="11" class="nonterminal" x="61" y="857">preparable_set_stmt</text></a><a xlink:href="#show_stmt" xlink:title="show_stmt">
<rect height="32" width="88" x="51" y="883"></rect>
<rect class="nonterminal" height="32" width="88" x="49" y="881"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="61" y="901">show_stmt</text></a><a xlink:href="#truncate_stmt" xlink:title="truncate_stmt">
<rect height="32" width="110" x="51" y="927"></rect>
<rect class="nonterminal" height="32" width="110" x="49" y="925"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="61" y="945">truncate_stmt</text></a><a xlink:href="#update_stmt" xlink:title="update_stmt">
<rect height="32" width="102" x="51" y="971"></rect>
<rect class="nonterminal" height="32" width="102" x="49" y="969"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="11" class="nonterminal" x="61" y="989">update_stmt</text></a><a xlink:href="#upsert_stmt" xlink:title="upsert_stmt">
<rect height="32" width="98" x="51" y="1015"></rect>
<rect class="nonterminal" height="32" width="98" x="49" y="1013"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="61" y="1033">upsert_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m86 0 h10 m0 0 h92 m-218 0 h20 m198 0 h20 m-238 0 q10 0 10 10 m218 0 q0 -10 10 -10 m-228 10 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m102 0 h10 m0 0 h76 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m96 0 h10 m0 0 h82 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m96 0 h10 m0 0 h82 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m92 0 h10 m0 0 h86 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m96 0 h10 m0 0 h82 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m86 0 h10 m0 0 h92 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m102 0 h10 m0 0 h76 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m98 0 h10 m0 0 h80 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m178 0 h10 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m92 0 h10 m0 0 h86 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m102 0 h10 m0 0 h76 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m96 0 h10 m0 0 h82 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m90 0 h10 m0 0 h88 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m102 0 h10 m0 0 h76 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m104 0 h10 m0 0 h74 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m98 0 h10 m0 0 h80 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m90 0 h10 m0 0 h88 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m94 0 h10 m0 0 h84 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m154 0 h10 m0 0 h24 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m88 0 h10 m0 0 h90 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m110 0 h10 m0 0 h68 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m102 0 h10 m0 0 h76 m-208 -10 v20 m218 0 v-20 m-218 20 v24 m218 0 v-24 m-218 24 q0 10 10 10 m198 0 q10 0 10 -10 m-208 10 h10 m98 0 h10 m0 0 h80 m23 -1012 h-3"></path>
<polygon points="267 17 275 13 275 21"></polygon>
<polygon points="267 17 259 13 259 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
