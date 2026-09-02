export const IsoLevel2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="969" width="1199" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="76" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">RENAME</text><a xlink:href="#opt_column" xlink:title="opt_column">
<rect height="32" width="94" x="167" y="3"></rect>
<rect class="nonterminal" height="32" width="94" x="165" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="11" class="nonterminal" x="177" y="21">opt_column</text></a><rect height="32" rx="10" width="110" x="167" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="165" y="45"></rect>
<text class="terminal" x="175" y="65">CONSTRAINT</text><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="317" y="3"></rect>
<rect class="nonterminal" height="32" width="108" x="315" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="327" y="21">column_name</text></a><rect height="32" rx="10" width="38" x="445" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="443" y="1"></rect>
<text class="terminal" x="453" y="21">TO</text><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="503" y="3"></rect>
<rect class="nonterminal" height="32" width="108" x="501" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="513" y="21">column_name</text></a><rect height="32" rx="10" width="48" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">ADD</text>
<rect height="32" rx="10" width="78" x="159" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="157" y="121"></rect>
<text class="terminal" x="167" y="141">COLUMN</text>
<rect height="32" rx="10" width="34" x="297" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="295" y="121"></rect>
<text class="terminal" x="305" y="141">IF</text>
<rect height="32" rx="10" width="48" x="351" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="349" y="121"></rect>
<text class="terminal" x="359" y="141">NOT</text>
<rect height="32" rx="10" width="70" x="419" y="123"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="417" y="121"></rect>
<text class="terminal" x="427" y="141">EXISTS</text><a xlink:href="#column_table_def" xlink:title="column_table_def">
<rect height="32" width="134" x="529" y="91"></rect>
<rect class="nonterminal" height="32" width="134" x="527" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="11" class="nonterminal" x="539" y="109">column_table_def</text></a><a xlink:href="#table_constraint" xlink:title="table_constraint">
<rect height="32" width="124" x="159" y="167"></rect>
<rect class="nonterminal" height="32" width="124" x="157" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="169" y="185">table_constraint</text></a><rect height="32" rx="10" width="110" x="159" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="157" y="209"></rect>
<text class="terminal" x="167" y="229">CONSTRAINT</text>
<rect height="32" rx="10" width="34" x="289" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="287" y="209"></rect>
<text class="terminal" x="297" y="229">IF</text>
<rect height="32" rx="10" width="48" x="343" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="341" y="209"></rect>
<text class="terminal" x="351" y="229">NOT</text>
<rect height="32" rx="10" width="70" x="411" y="211"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="409" y="209"></rect>
<text class="terminal" x="419" y="229">EXISTS</text><a xlink:href="#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="501" y="211"></rect>
<rect class="nonterminal" height="32" width="126" x="499" y="209"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="511" y="229">constraint_name</text></a><a xlink:href="#constraint_elem" xlink:title="constraint_elem">
<rect height="32" width="122" x="647" y="211"></rect>
<rect class="nonterminal" height="32" width="122" x="645" y="209"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="657" y="229">constraint_elem</text></a><a xlink:href="#opt_validate_behavior" xlink:title="opt_validate_behavior">
<rect height="32" width="162" x="809" y="167"></rect>
<rect class="nonterminal" height="32" width="162" x="807" y="165"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="138" font-size="10" class="nonterminal" x="819" y="185">opt_validate_behavior</text></a><rect height="32" rx="10" width="62" x="51" y="255"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="49" y="253"></rect>
<text class="terminal" x="59" y="273">ALTER</text><a xlink:href="#opt_column" xlink:title="opt_column">
<rect height="32" width="94" x="153" y="255"></rect>
<rect class="nonterminal" height="32" width="94" x="151" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="11" class="nonterminal" x="163" y="273">opt_column</text></a><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="267" y="255"></rect>
<rect class="nonterminal" height="32" width="108" x="265" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="277" y="273">column_name</text></a><a xlink:href="#alter_column_default" xlink:title="alter_column_default">
<rect height="32" width="154" x="415" y="255"></rect>
<rect class="nonterminal" height="32" width="154" x="413" y="253"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="130" font-size="10" class="nonterminal" x="425" y="273">alter_column_default</text></a><a xlink:href="#alter_column_on_update" xlink:title="alter_column_on_update">
<rect height="32" width="180" x="415" y="299"></rect>
<rect class="nonterminal" height="32" width="180" x="413" y="297"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="156" font-size="11" class="nonterminal" x="425" y="317">alter_column_on_update</text></a><a xlink:href="#alter_column_visible" xlink:title="alter_column_visible">
<rect height="32" width="150" x="415" y="343"></rect>
<rect class="nonterminal" height="32" width="150" x="413" y="341"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="126" font-size="10" class="nonterminal" x="425" y="361">alter_column_visible</text></a><rect height="32" rx="10" width="58" x="415" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="413" y="385"></rect>
<text class="terminal" x="423" y="405">DROP</text>
<rect height="32" rx="10" width="48" x="513" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="511" y="385"></rect>
<text class="terminal" x="521" y="405">NOT</text>
<rect height="32" rx="10" width="56" x="581" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="579" y="385"></rect>
<text class="terminal" x="589" y="405">NULL</text>
<rect height="32" rx="10" width="76" x="513" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="511" y="429"></rect>
<text class="terminal" x="521" y="449">STORED</text>
<rect height="32" rx="10" width="44" x="415" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="413" y="473"></rect>
<text class="terminal" x="423" y="493">SET</text>
<rect height="32" rx="10" width="48" x="479" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="477" y="473"></rect>
<text class="terminal" x="487" y="493">NOT</text>
<rect height="32" rx="10" width="56" x="547" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="545" y="473"></rect>
<text class="terminal" x="555" y="493">NULL</text><a xlink:href="#opt_set_data" xlink:title="opt_set_data">
<rect height="32" width="106" x="415" y="519"></rect>
<rect class="nonterminal" height="32" width="106" x="413" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="11" class="nonterminal" x="425" y="537">opt_set_data</text></a><rect height="32" rx="10" width="54" x="541" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="539" y="517"></rect>
<text class="terminal" x="549" y="537">TYPE</text><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="615" y="519"></rect>
<rect class="nonterminal" height="32" width="84" x="613" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="625" y="537">typename</text></a><a xlink:href="#opt_collate" xlink:title="opt_collate">
<rect height="32" width="90" x="719" y="519"></rect>
<rect class="nonterminal" height="32" width="90" x="717" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="729" y="537">opt_collate</text></a><a xlink:href="#opt_alter_column_using" xlink:title="opt_alter_column_using">
<rect height="32" width="174" x="829" y="519"></rect>
<rect class="nonterminal" height="32" width="174" x="827" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="10" class="nonterminal" x="839" y="537">opt_alter_column_using</text></a><rect height="32" rx="10" width="84" x="153" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="151" y="561"></rect>
<text class="terminal" x="161" y="581">PRIMARY</text>
<rect height="32" rx="10" width="46" x="257" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="255" y="561"></rect>
<text class="terminal" x="265" y="581">KEY</text>
<rect height="32" rx="10" width="64" x="323" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="321" y="561"></rect>
<text class="terminal" x="331" y="581">USING</text>
<rect height="32" rx="10" width="88" x="407" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="405" y="561"></rect>
<text class="terminal" x="415" y="581">COLUMNS</text>
<rect height="32" rx="10" width="26" x="515" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="513" y="561"></rect>
<text class="terminal" x="523" y="581">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="561" y="563"></rect>
<rect class="nonterminal" height="32" width="110" x="559" y="561"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="571" y="581">index_params</text></a><rect height="32" rx="10" width="26" x="691" y="563"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="689" y="561"></rect>
<text class="terminal" x="699" y="581">)</text><a xlink:href="#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="737" y="563"></rect>
<rect class="nonterminal" height="32" width="140" x="735" y="561"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="747" y="581">opt_hash_sharded</text></a><a xlink:href="#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="897" y="563"></rect>
<rect class="nonterminal" height="32" width="234" x="895" y="561"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="907" y="581">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="58" x="51" y="607"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="605"></rect>
<text class="terminal" x="59" y="625">DROP</text><a xlink:href="#opt_column" xlink:title="opt_column">
<rect height="32" width="94" x="149" y="607"></rect>
<rect class="nonterminal" height="32" width="94" x="147" y="605"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="11" class="nonterminal" x="159" y="625">opt_column</text></a><rect height="32" rx="10" width="34" x="283" y="639"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="281" y="637"></rect>
<text class="terminal" x="291" y="657">IF</text>
<rect height="32" rx="10" width="70" x="337" y="639"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="335" y="637"></rect>
<text class="terminal" x="345" y="657">EXISTS</text><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="447" y="607"></rect>
<rect class="nonterminal" height="32" width="108" x="445" y="605"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="457" y="625">column_name</text></a><rect height="32" rx="10" width="110" x="149" y="683"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="147" y="681"></rect>
<text class="terminal" x="157" y="701">CONSTRAINT</text>
<rect height="32" rx="10" width="34" x="299" y="715"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="297" y="713"></rect>
<text class="terminal" x="307" y="733">IF</text>
<rect height="32" rx="10" width="70" x="353" y="715"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="351" y="713"></rect>
<text class="terminal" x="361" y="733">EXISTS</text><a xlink:href="#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="463" y="683"></rect>
<rect class="nonterminal" height="32" width="126" x="461" y="681"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="473" y="701">constraint_name</text></a><a xlink:href="#opt_drop_behavior" xlink:title="opt_drop_behavior">
<rect height="32" width="142" x="629" y="607"></rect>
<rect class="nonterminal" height="32" width="142" x="627" y="605"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="639" y="625">opt_drop_behavior</text></a><rect height="32" rx="10" width="88" x="51" y="759"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="49" y="757"></rect>
<text class="terminal" x="59" y="777">VALIDATE</text>
<rect height="32" rx="10" width="110" x="159" y="759"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="157" y="757"></rect>
<text class="terminal" x="167" y="777">CONSTRAINT</text><a xlink:href="#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="289" y="759"></rect>
<rect class="nonterminal" height="32" width="126" x="287" y="757"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="299" y="777">constraint_name</text></a><rect height="32" rx="10" width="178" x="51" y="803"></rect>
<rect class="terminal" height="32" rx="10" width="178" x="49" y="801"></rect>
<text class="terminal" x="59" y="821">EXPERIMENTAL_AUDIT</text>
<rect height="32" rx="10" width="44" x="249" y="803"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="247" y="801"></rect>
<text class="terminal" x="257" y="821">SET</text><a xlink:href="#audit_mode" xlink:title="audit_mode">
<rect height="32" width="96" x="313" y="803"></rect>
<rect class="nonterminal" height="32" width="96" x="311" y="801"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="323" y="821">audit_mode</text></a><a xlink:href="#partition_by_table" xlink:title="partition_by_table">
<rect height="32" width="136" x="51" y="847"></rect>
<rect class="nonterminal" height="32" width="136" x="49" y="845"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="61" y="865">partition_by_table</text></a><rect height="32" rx="10" width="44" x="71" y="891"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="69" y="889"></rect>
<text class="terminal" x="79" y="909">SET</text>
<rect height="32" rx="10" width="26" x="135" y="891"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="133" y="889"></rect>
<text class="terminal" x="143" y="909">(</text><a xlink:href="#storage_parameter_list" xlink:title="storage_parameter_list">
<rect height="32" width="170" x="181" y="891"></rect>
<rect class="nonterminal" height="32" width="170" x="179" y="889"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="191" y="909">storage_parameter_list</text></a><rect height="32" rx="10" width="62" x="71" y="935"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="933"></rect>
<text class="terminal" x="79" y="953">RESET</text>
<rect height="32" rx="10" width="26" x="153" y="935"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="151" y="933"></rect>
<text class="terminal" x="161" y="953">(</text><a xlink:href="#storage_parameter_key_list" xlink:title="storage_parameter_key_list">
<rect height="32" width="200" x="199" y="935"></rect>
<rect class="nonterminal" height="32" width="200" x="197" y="933"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="176" font-size="10" class="nonterminal" x="209" y="953">storage_parameter_key_list</text></a><rect height="32" rx="10" width="26" x="439" y="891"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="437" y="889"></rect>
<text class="terminal" x="447" y="909">)</text>
<path class="line" d="m17 17 h2 m20 0 h10 m76 0 h10 m20 0 h10 m94 0 h10 m0 0 h16 m-150 0 h20 m130 0 h20 m-170 0 q10 0 10 10 m150 0 q0 -10 10 -10 m-160 10 v24 m150 0 v-24 m-150 24 q0 10 10 10 m130 0 q10 0 10 -10 m-140 10 h10 m110 0 h10 m20 -44 h10 m108 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m108 0 h10 m0 0 h540 m-1140 0 h20 m1120 0 h20 m-1160 0 q10 0 10 10 m1140 0 q0 -10 10 -10 m-1150 10 v68 m1140 0 v-68 m-1140 68 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m48 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m40 -32 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m134 0 h10 m0 0 h308 m-872 0 h20 m852 0 h20 m-892 0 q10 0 10 10 m872 0 q0 -10 10 -10 m-882 10 v56 m872 0 v-56 m-872 56 q0 10 10 10 m852 0 q10 0 10 -10 m-842 10 h10 m124 0 h10 m0 0 h486 m-650 0 h20 m630 0 h20 m-670 0 q10 0 10 10 m650 0 q0 -10 10 -10 m-660 10 v24 m650 0 v-24 m-650 24 q0 10 10 10 m630 0 q10 0 10 -10 m-640 10 h10 m110 0 h10 m0 0 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m126 0 h10 m0 0 h10 m122 0 h10 m20 -44 h10 m162 0 h10 m20 -76 h160 m-1130 -10 v20 m1140 0 v-20 m-1140 20 v144 m1140 0 v-144 m-1140 144 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m62 0 h10 m20 0 h10 m94 0 h10 m0 0 h10 m108 0 h10 m20 0 h10 m154 0 h10 m0 0 h434 m-628 0 h20 m608 0 h20 m-648 0 q10 0 10 10 m628 0 q0 -10 10 -10 m-638 10 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m180 0 h10 m0 0 h408 m-618 -10 v20 m628 0 v-20 m-628 20 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m150 0 h10 m0 0 h438 m-618 -10 v20 m628 0 v-20 m-628 20 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m58 0 h10 m20 0 h10 m48 0 h10 m0 0 h10 m56 0 h10 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v24 m164 0 v-24 m-164 24 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m76 0 h10 m0 0 h48 m20 -44 h346 m-618 -10 v20 m628 0 v-20 m-628 20 v68 m628 0 v-68 m-628 68 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m44 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m56 0 h10 m0 0 h400 m-618 -10 v20 m628 0 v-20 m-628 20 v24 m628 0 v-24 m-628 24 q0 10 10 10 m608 0 q10 0 10 -10 m-618 10 h10 m106 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m174 0 h10 m20 -264 h108 m-1018 0 h20 m998 0 h20 m-1038 0 q10 0 10 10 m1018 0 q0 -10 10 -10 m-1028 10 v288 m1018 0 v-288 m-1018 288 q0 10 10 10 m998 0 q10 0 10 -10 m-1008 10 h10 m84 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m88 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m140 0 h10 m0 0 h10 m234 0 h10 m-1110 -318 v20 m1140 0 v-20 m-1140 20 v332 m1140 0 v-332 m-1140 332 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m58 0 h10 m20 0 h10 m94 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m108 0 h10 m0 0 h34 m-480 0 h20 m460 0 h20 m-500 0 q10 0 10 10 m480 0 q0 -10 10 -10 m-490 10 v56 m480 0 v-56 m-480 56 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m110 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m126 0 h10 m20 -76 h10 m142 0 h10 m0 0 h380 m-1130 -10 v20 m1140 0 v-20 m-1140 20 v132 m1140 0 v-132 m-1140 132 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m88 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m126 0 h10 m0 0 h736 m-1130 -10 v20 m1140 0 v-20 m-1140 20 v24 m1140 0 v-24 m-1140 24 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m178 0 h10 m0 0 h10 m44 0 h10 m0 0 h10 m96 0 h10 m0 0 h742 m-1130 -10 v20 m1140 0 v-20 m-1140 20 v24 m1140 0 v-24 m-1140 24 q0 10 10 10 m1120 0 q10 0 10 -10 m-1130 10 h10 m136 0 h10 m0 0 h964 m-1130 -10 v20 m1140 0 v-20 m-1140 20 v24 m1140 0 v-24 m-1140 24 q0 10 10 10 m1120 0 q10 0 10 -10 m-1110 10 h10 m44 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m170 0 h10 m0 0 h48 m-368 0 h20 m348 0 h20 m-388 0 q10 0 10 10 m368 0 q0 -10 10 -10 m-378 10 v24 m368 0 v-24 m-368 24 q0 10 10 10 m348 0 q10 0 10 -10 m-358 10 h10 m62 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m200 0 h10 m20 -44 h10 m26 0 h10 m0 0 h686 m23 -888 h-3"></path>
<polygon points="1189 17 1197 13 1197 21"></polygon>
<polygon points="1189 17 1181 13 1181 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
