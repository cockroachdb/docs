export const CreateTable44 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="805" width="1351" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="110" x="71" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="69" y="33"></rect>
<text class="terminal" x="79" y="53">CONSTRAINT</text><a xlink:href="/docs/v25.4/sql-grammar#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="201" y="35"></rect>
<rect class="nonterminal" height="32" width="126" x="199" y="33"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="211" y="53">constraint_name</text></a><rect height="32" rx="10" width="48" x="387" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="385" y="1"></rect>
<text class="terminal" x="395" y="21">NOT</text>
<rect height="32" rx="10" width="56" x="475" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="473" y="1"></rect>
<text class="terminal" x="483" y="21">NULL</text>
<rect height="32" rx="10" width="76" x="475" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="473" y="45"></rect>
<text class="terminal" x="483" y="65">VISIBLE</text>
<rect height="32" rx="10" width="56" x="387" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="385" y="89"></rect>
<text class="terminal" x="395" y="109">NULL</text>
<rect height="32" rx="10" width="74" x="387" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="385" y="133"></rect>
<text class="terminal" x="395" y="153">UNIQUE</text>
<rect height="32" rx="10" width="84" x="387" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="385" y="177"></rect>
<text class="terminal" x="395" y="197">PRIMARY</text>
<rect height="32" rx="10" width="46" x="491" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="489" y="177"></rect>
<text class="terminal" x="499" y="197">KEY</text>
<rect height="32" rx="10" width="64" x="577" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="575" y="209"></rect>
<text class="terminal" x="585" y="229">USING</text>
<rect height="32" rx="10" width="58" x="661" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="659" y="209"></rect>
<text class="terminal" x="669" y="229">HASH</text><a xlink:href="/docs/v25.4/sql-grammar#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="759" y="179"></rect>
<rect class="nonterminal" height="32" width="234" x="757" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="769" y="197">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="64" x="387" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="385" y="253"></rect>
<text class="terminal" x="395" y="273">CHECK</text>
<rect height="32" rx="10" width="26" x="471" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="469" y="253"></rect>
<text class="terminal" x="479" y="273">(</text><a xlink:href="/docs/v25.4/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="517" y="255"></rect>
<rect class="nonterminal" height="32" width="64" x="515" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="527" y="273">a_expr</text></a><rect height="32" rx="10" width="26" x="601" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="599" y="253"></rect>
<text class="terminal" x="609" y="273">)</text>
<rect height="32" rx="10" width="80" x="407" y="299"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="405" y="297"></rect>
<text class="terminal" x="415" y="317">DEFAULT</text>
<rect height="32" rx="10" width="40" x="407" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="405" y="341"></rect>
<text class="terminal" x="415" y="361">ON</text>
<rect height="32" rx="10" width="74" x="467" y="343"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="465" y="341"></rect>
<text class="terminal" x="475" y="361">UPDATE</text><a xlink:href="/docs/v25.4/sql-grammar#b_expr" xlink:title="b_expr">
<rect height="32" width="64" x="581" y="299"></rect>
<rect class="nonterminal" height="32" width="64" x="579" y="297"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="591" y="317">b_expr</text></a><rect height="32" rx="10" width="108" x="387" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="108" x="385" y="385"></rect>
<text class="terminal" x="395" y="405">REFERENCES</text><a xlink:href="/docs/v25.4/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="515" y="387"></rect>
<rect class="nonterminal" height="32" width="96" x="513" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="525" y="405">table_name</text></a><a xlink:href="/docs/v25.4/sql-grammar#opt_name_parens" xlink:title="opt_name_parens">
<rect height="32" width="136" x="631" y="387"></rect>
<rect class="nonterminal" height="32" width="136" x="629" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="12" class="nonterminal" x="641" y="405">opt_name_parens</text></a><a xlink:href="/docs/v25.4/sql-grammar#key_match" xlink:title="key_match">
<rect height="32" width="88" x="787" y="387"></rect>
<rect class="nonterminal" height="32" width="88" x="785" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="797" y="405">key_match</text></a><a xlink:href="/docs/v25.4/sql-grammar#reference_actions" xlink:title="reference_actions">
<rect height="32" width="134" x="895" y="387"></rect>
<rect class="nonterminal" height="32" width="134" x="893" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="10" class="nonterminal" x="905" y="405">reference_actions</text></a><a xlink:href="/docs/v25.4/sql-grammar#generated_as" xlink:title="generated_as">
<rect height="32" width="108" x="387" y="431"></rect>
<rect class="nonterminal" height="32" width="108" x="385" y="429"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="11" class="nonterminal" x="397" y="449">generated_as</text></a><rect height="32" rx="10" width="26" x="515" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="513" y="429"></rect>
<text class="terminal" x="523" y="449">(</text><a xlink:href="/docs/v25.4/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="561" y="431"></rect>
<rect class="nonterminal" height="32" width="64" x="559" y="429"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="571" y="449">a_expr</text></a><rect height="32" rx="10" width="26" x="645" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="643" y="429"></rect>
<text class="terminal" x="653" y="449">)</text>
<rect height="32" rx="10" width="76" x="711" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="709" y="429"></rect>
<text class="terminal" x="719" y="449">STORED</text>
<rect height="32" rx="10" width="80" x="711" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="709" y="473"></rect>
<text class="terminal" x="719" y="493">VIRTUAL</text>
<rect height="32" rx="10" width="168" x="407" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="168" x="405" y="517"></rect>
<text class="terminal" x="415" y="537">GENERATED_ALWAYS</text>
<rect height="32" rx="10" width="78" x="595" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="593" y="517"></rect>
<text class="terminal" x="603" y="537">ALWAYS</text>
<rect height="32" rx="10" width="198" x="407" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="198" x="405" y="561"></rect>
<text class="terminal" x="415" y="581">GENERATED_BY_DEFAULT</text>
<rect height="32" rx="10" width="38" x="625" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="623" y="561"></rect>
<text class="terminal" x="633" y="581">BY</text>
<rect height="32" rx="10" width="80" x="683" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="681" y="561"></rect>
<text class="terminal" x="691" y="581">DEFAULT</text>
<rect height="32" rx="10" width="38" x="803" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="801" y="517"></rect>
<text class="terminal" x="811" y="537">AS</text>
<rect height="32" rx="10" width="86" x="861" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="859" y="517"></rect>
<text class="terminal" x="869" y="537">IDENTITY</text>
<rect height="32" rx="10" width="26" x="987" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="985" y="549"></rect>
<text class="terminal" x="995" y="569">(</text><a xlink:href="/docs/v25.4/sql-grammar#opt_sequence_option_list" xlink:title="opt_sequence_option_list">
<rect height="32" width="184" x="1033" y="551"></rect>
<rect class="nonterminal" height="32" width="184" x="1031" y="549"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="160" font-size="10" class="nonterminal" x="1043" y="569">opt_sequence_option_list</text></a><rect height="32" rx="10" width="26" x="1237" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1235" y="549"></rect>
<text class="terminal" x="1245" y="569">)</text>
<rect height="32" rx="10" width="82" x="51" y="607"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="605"></rect>
<text class="terminal" x="59" y="625">COLLATE</text><a xlink:href="/docs/v25.4/sql-grammar#collation_name" xlink:title="collation_name">
<rect height="32" width="116" x="153" y="607"></rect>
<rect class="nonterminal" height="32" width="116" x="151" y="605"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="163" y="625">collation_name</text></a><rect height="32" rx="10" width="72" x="51" y="651"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="649"></rect>
<text class="terminal" x="59" y="669">FAMILY</text><a xlink:href="/docs/v25.4/sql-grammar#family_name" xlink:title="family_name">
<rect height="32" width="100" x="143" y="651"></rect>
<rect class="nonterminal" height="32" width="100" x="141" y="649"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="11" class="nonterminal" x="153" y="669">family_name</text></a><rect height="32" rx="10" width="72" x="51" y="695"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="49" y="693"></rect>
<text class="terminal" x="59" y="713">CREATE</text>
<rect height="32" rx="10" width="72" x="163" y="695"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="161" y="693"></rect>
<text class="terminal" x="171" y="713">FAMILY</text><a xlink:href="/docs/v25.4/sql-grammar#family_name" xlink:title="family_name">
<rect height="32" width="100" x="275" y="727"></rect>
<rect class="nonterminal" height="32" width="100" x="273" y="725"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="11" class="nonterminal" x="285" y="745">family_name</text></a><rect height="32" rx="10" width="34" x="163" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="161" y="769"></rect>
<text class="terminal" x="171" y="789">IF</text>
<rect height="32" rx="10" width="48" x="217" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="215" y="769"></rect>
<text class="terminal" x="225" y="789">NOT</text>
<rect height="32" rx="10" width="70" x="285" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="283" y="769"></rect>
<text class="terminal" x="293" y="789">EXISTS</text>
<rect height="32" rx="10" width="72" x="375" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="373" y="769"></rect>
<text class="terminal" x="383" y="789">FAMILY</text><a xlink:href="/docs/v25.4/sql-grammar#family_name" xlink:title="family_name">
<rect height="32" width="100" x="467" y="771"></rect>
<rect class="nonterminal" height="32" width="100" x="465" y="769"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="76" font-size="11" class="nonterminal" x="477" y="789">family_name</text></a><path class="line" d="m17 17 h2 m40 0 h10 m0 0 h266 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v12 m296 0 v-12 m-296 12 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m110 0 h10 m0 0 h10 m126 0 h10 m40 -32 h10 m48 0 h10 m20 0 h10 m56 0 h10 m0 0 h20 m-116 0 h20 m96 0 h20 m-136 0 q10 0 10 10 m116 0 q0 -10 10 -10 m-126 10 v24 m116 0 v-24 m-116 24 q0 10 10 10 m96 0 q10 0 10 -10 m-106 10 h10 m76 0 h10 m20 -44 h712 m-936 0 h20 m916 0 h20 m-956 0 q10 0 10 10 m936 0 q0 -10 10 -10 m-946 10 v68 m936 0 v-68 m-936 68 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m56 0 h10 m0 0 h840 m-926 -10 v20 m936 0 v-20 m-936 20 v24 m936 0 v-24 m-936 24 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m74 0 h10 m0 0 h822 m-926 -10 v20 m936 0 v-20 m-936 20 v24 m936 0 v-24 m-936 24 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m84 0 h10 m0 0 h10 m46 0 h10 m20 0 h10 m0 0 h152 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v12 m182 0 v-12 m-182 12 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m64 0 h10 m0 0 h10 m58 0 h10 m20 -32 h10 m234 0 h10 m0 0 h290 m-926 -10 v20 m936 0 v-20 m-936 20 v56 m936 0 v-56 m-936 56 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m0 0 h656 m-926 -10 v20 m936 0 v-20 m-936 20 v24 m936 0 v-24 m-936 24 q0 10 10 10 m916 0 q10 0 10 -10 m-906 10 h10 m80 0 h10 m0 0 h54 m-174 0 h20 m154 0 h20 m-194 0 q10 0 10 10 m174 0 q0 -10 10 -10 m-184 10 v24 m174 0 v-24 m-174 24 q0 10 10 10 m154 0 q10 0 10 -10 m-164 10 h10 m40 0 h10 m0 0 h10 m74 0 h10 m20 -44 h10 m64 0 h10 m0 0 h638 m-926 -10 v20 m936 0 v-20 m-936 20 v68 m936 0 v-68 m-936 68 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m108 0 h10 m0 0 h10 m96 0 h10 m0 0 h10 m136 0 h10 m0 0 h10 m88 0 h10 m0 0 h10 m134 0 h10 m0 0 h254 m-926 -10 v20 m936 0 v-20 m-936 20 v24 m936 0 v-24 m-936 24 q0 10 10 10 m916 0 q10 0 10 -10 m-926 10 h10 m108 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m76 0 h10 m0 0 h4 m-120 0 h20 m100 0 h20 m-140 0 q10 0 10 10 m120 0 q0 -10 10 -10 m-130 10 v24 m120 0 v-24 m-120 24 q0 10 10 10 m100 0 q10 0 10 -10 m-110 10 h10 m80 0 h10 m20 -44 h472 m-926 -10 v20 m936 0 v-20 m-936 20 v68 m936 0 v-68 m-936 68 q0 10 10 10 m916 0 q10 0 10 -10 m-906 10 h10 m168 0 h10 m0 0 h10 m78 0 h10 m0 0 h90 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v24 m396 0 v-24 m-396 24 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m198 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m80 0 h10 m20 -44 h10 m38 0 h10 m0 0 h10 m86 0 h10 m20 0 h10 m0 0 h286 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v12 m316 0 v-12 m-316 12 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m26 0 h10 m0 0 h10 m184 0 h10 m0 0 h10 m26 0 h10 m-1252 -548 h20 m1272 0 h20 m-1312 0 q10 0 10 10 m1292 0 q0 -10 10 -10 m-1302 10 v584 m1292 0 v-584 m-1292 584 q0 10 10 10 m1272 0 q10 0 10 -10 m-1282 10 h10 m82 0 h10 m0 0 h10 m116 0 h10 m0 0 h1034 m-1282 -10 v20 m1292 0 v-20 m-1292 20 v24 m1292 0 v-24 m-1292 24 q0 10 10 10 m1272 0 q10 0 10 -10 m-1282 10 h10 m72 0 h10 m0 0 h10 m100 0 h10 m0 0 h1060 m-1282 -10 v20 m1292 0 v-20 m-1292 20 v24 m1292 0 v-24 m-1292 24 q0 10 10 10 m1272 0 q10 0 10 -10 m-1282 10 h10 m72 0 h10 m20 0 h10 m72 0 h10 m20 0 h10 m0 0 h110 m-140 0 h20 m120 0 h20 m-160 0 q10 0 10 10 m140 0 q0 -10 10 -10 m-150 10 v12 m140 0 v-12 m-140 12 q0 10 10 10 m120 0 q10 0 10 -10 m-130 10 h10 m100 0 h10 m20 -32 h172 m-444 0 h20 m424 0 h20 m-464 0 q10 0 10 10 m444 0 q0 -10 10 -10 m-454 10 v56 m444 0 v-56 m-444 56 q0 10 10 10 m424 0 q10 0 10 -10 m-434 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m72 0 h10 m0 0 h10 m100 0 h10 m20 -76 h716 m23 -692 h-3"></path>
<polygon points="1341 17 1349 13 1349 21"></polygon>
<polygon points="1341 17 1333 13 1333 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
