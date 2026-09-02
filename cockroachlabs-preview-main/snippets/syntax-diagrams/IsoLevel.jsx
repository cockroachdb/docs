export const IsoLevel = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1309" width="1237" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="86" x="513" y="431"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="511" y="429"></rect>
<text class="terminal" x="521" y="449">IDENTITY</text>
<rect height="32" rx="10" width="34" x="639" y="463"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="637" y="461"></rect>
<text class="terminal" x="647" y="481">IF</text>
<rect height="32" rx="10" width="70" x="693" y="463"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="691" y="461"></rect>
<text class="terminal" x="701" y="481">EXISTS</text>
<rect height="32" rx="10" width="76" x="513" y="507"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="511" y="505"></rect>
<text class="terminal" x="521" y="525">STORED</text>
<rect height="32" rx="10" width="48" x="415" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="413" y="549"></rect>
<text class="terminal" x="423" y="569">ADD</text><a xlink:href="#generated_always_as" xlink:title="generated_always_as">
<rect height="32" width="160" x="503" y="551"></rect>
<rect class="nonterminal" height="32" width="160" x="501" y="549"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="136" font-size="11" class="nonterminal" x="513" y="569">generated_always_as</text></a><a xlink:href="#generated_by_default_as" xlink:title="generated_by_default_as">
<rect height="32" width="184" x="503" y="595"></rect>
<rect class="nonterminal" height="32" width="184" x="501" y="593"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="160" font-size="11" class="nonterminal" x="513" y="613">generated_by_default_as</text></a><rect height="32" rx="10" width="86" x="727" y="551"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="725" y="549"></rect>
<text class="terminal" x="735" y="569">IDENTITY</text>
<rect height="32" rx="10" width="26" x="853" y="583"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="851" y="581"></rect>
<text class="terminal" x="861" y="601">(</text><a xlink:href="#opt_sequence_option_list" xlink:title="opt_sequence_option_list">
<rect height="32" width="184" x="899" y="583"></rect>
<rect class="nonterminal" height="32" width="184" x="897" y="581"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="160" font-size="10" class="nonterminal" x="909" y="601">opt_sequence_option_list</text></a><rect height="32" rx="10" width="26" x="1103" y="583"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1101" y="581"></rect>
<text class="terminal" x="1111" y="601">)</text><a xlink:href="#set_generated_always" xlink:title="set_generated_always">
<rect height="32" width="164" x="415" y="639"></rect>
<rect class="nonterminal" height="32" width="164" x="413" y="637"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="140" font-size="11" class="nonterminal" x="425" y="657">set_generated_always</text></a><a xlink:href="#set_generated_default" xlink:title="set_generated_default">
<rect height="32" width="166" x="415" y="683"></rect>
<rect class="nonterminal" height="32" width="166" x="413" y="681"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="425" y="701">set_generated_default</text></a><a xlink:href="#identity_option_list" xlink:title="identity_option_list">
<rect height="32" width="142" x="415" y="727"></rect>
<rect class="nonterminal" height="32" width="142" x="413" y="725"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="425" y="745">identity_option_list</text></a><rect height="32" rx="10" width="44" x="415" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="413" y="769"></rect>
<text class="terminal" x="423" y="789">SET</text>
<rect height="32" rx="10" width="48" x="479" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="477" y="769"></rect>
<text class="terminal" x="487" y="789">NOT</text>
<rect height="32" rx="10" width="56" x="547" y="771"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="545" y="769"></rect>
<text class="terminal" x="555" y="789">NULL</text><a xlink:href="#opt_set_data" xlink:title="opt_set_data">
<rect height="32" width="106" x="415" y="815"></rect>
<rect class="nonterminal" height="32" width="106" x="413" y="813"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="11" class="nonterminal" x="425" y="833">opt_set_data</text></a><rect height="32" rx="10" width="54" x="541" y="815"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="539" y="813"></rect>
<text class="terminal" x="549" y="833">TYPE</text><a xlink:href="#typename" xlink:title="typename">
<rect height="32" width="84" x="615" y="815"></rect>
<rect class="nonterminal" height="32" width="84" x="613" y="813"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="625" y="833">typename</text></a><a xlink:href="#opt_collate" xlink:title="opt_collate">
<rect height="32" width="90" x="719" y="815"></rect>
<rect class="nonterminal" height="32" width="90" x="717" y="813"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="66" font-size="10" class="nonterminal" x="729" y="833">opt_collate</text></a><a xlink:href="#opt_alter_column_using" xlink:title="opt_alter_column_using">
<rect height="32" width="174" x="829" y="815"></rect>
<rect class="nonterminal" height="32" width="174" x="827" y="813"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="10" class="nonterminal" x="839" y="833">opt_alter_column_using</text></a><rect height="32" rx="10" width="84" x="153" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="151" y="857"></rect>
<text class="terminal" x="161" y="877">PRIMARY</text>
<rect height="32" rx="10" width="46" x="257" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="255" y="857"></rect>
<text class="terminal" x="265" y="877">KEY</text>
<rect height="32" rx="10" width="64" x="323" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="321" y="857"></rect>
<text class="terminal" x="331" y="877">USING</text>
<rect height="32" rx="10" width="88" x="407" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="405" y="857"></rect>
<text class="terminal" x="415" y="877">COLUMNS</text>
<rect height="32" rx="10" width="26" x="515" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="513" y="857"></rect>
<text class="terminal" x="523" y="877">(</text><a xlink:href="#index_params" xlink:title="index_params">
<rect height="32" width="110" x="561" y="859"></rect>
<rect class="nonterminal" height="32" width="110" x="559" y="857"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="571" y="877">index_params</text></a><rect height="32" rx="10" width="26" x="691" y="859"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="689" y="857"></rect>
<text class="terminal" x="699" y="877">)</text><a xlink:href="#opt_hash_sharded" xlink:title="opt_hash_sharded">
<rect height="32" width="140" x="737" y="859"></rect>
<rect class="nonterminal" height="32" width="140" x="735" y="857"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="116" font-size="11" class="nonterminal" x="747" y="877">opt_hash_sharded</text></a><a xlink:href="#opt_with_storage_parameter_list" xlink:title="opt_with_storage_parameter_list">
<rect height="32" width="234" x="897" y="859"></rect>
<rect class="nonterminal" height="32" width="234" x="895" y="857"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="907" y="877">opt_with_storage_parameter_list</text></a><rect height="32" rx="10" width="58" x="51" y="903"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="49" y="901"></rect>
<text class="terminal" x="59" y="921">DROP</text><a xlink:href="#opt_column" xlink:title="opt_column">
<rect height="32" width="94" x="149" y="903"></rect>
<rect class="nonterminal" height="32" width="94" x="147" y="901"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="11" class="nonterminal" x="159" y="921">opt_column</text></a><rect height="32" rx="10" width="34" x="283" y="935"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="281" y="933"></rect>
<text class="terminal" x="291" y="953">IF</text>
<rect height="32" rx="10" width="70" x="337" y="935"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="335" y="933"></rect>
<text class="terminal" x="345" y="953">EXISTS</text><a xlink:href="#column_name" xlink:title="column_name">
<rect height="32" width="108" x="447" y="903"></rect>
<rect class="nonterminal" height="32" width="108" x="445" y="901"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="457" y="921">column_name</text></a><rect height="32" rx="10" width="110" x="149" y="979"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="147" y="977"></rect>
<text class="terminal" x="157" y="997">CONSTRAINT</text>
<rect height="32" rx="10" width="34" x="299" y="1011"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="297" y="1009"></rect>
<text class="terminal" x="307" y="1029">IF</text>
<rect height="32" rx="10" width="70" x="353" y="1011"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="351" y="1009"></rect>
<text class="terminal" x="361" y="1029">EXISTS</text><a xlink:href="#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="463" y="979"></rect>
<rect class="nonterminal" height="32" width="126" x="461" y="977"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="473" y="997">constraint_name</text></a><a xlink:href="#opt_drop_behavior" xlink:title="opt_drop_behavior">
<rect height="32" width="142" x="629" y="903"></rect>
<rect class="nonterminal" height="32" width="142" x="627" y="901"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="639" y="921">opt_drop_behavior</text></a><rect height="32" rx="10" width="88" x="51" y="1055"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="49" y="1053"></rect>
<text class="terminal" x="59" y="1073">VALIDATE</text>
<rect height="32" rx="10" width="110" x="159" y="1055"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="157" y="1053"></rect>
<text class="terminal" x="167" y="1073">CONSTRAINT</text><a xlink:href="#constraint_name" xlink:title="constraint_name">
<rect height="32" width="126" x="289" y="1055"></rect>
<rect class="nonterminal" height="32" width="126" x="287" y="1053"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="299" y="1073">constraint_name</text></a><rect height="32" rx="10" width="178" x="51" y="1099"></rect>
<rect class="terminal" height="32" rx="10" width="178" x="49" y="1097"></rect>
<text class="terminal" x="59" y="1117">EXPERIMENTAL_AUDIT</text>
<rect height="32" rx="10" width="44" x="249" y="1099"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="247" y="1097"></rect>
<text class="terminal" x="257" y="1117">SET</text><a xlink:href="#audit_mode" xlink:title="audit_mode">
<rect height="32" width="96" x="313" y="1099"></rect>
<rect class="nonterminal" height="32" width="96" x="311" y="1097"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="323" y="1117">audit_mode</text></a><a xlink:href="#partition_by_table" xlink:title="partition_by_table">
<rect height="32" width="136" x="51" y="1143"></rect>
<rect class="nonterminal" height="32" width="136" x="49" y="1141"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="61" y="1161">partition_by_table</text></a><rect height="32" rx="10" width="44" x="71" y="1187"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="69" y="1185"></rect>
<text class="terminal" x="79" y="1205">SET</text>
<rect height="32" rx="10" width="26" x="135" y="1187"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="133" y="1185"></rect>
<text class="terminal" x="143" y="1205">(</text><a xlink:href="#storage_parameter_list" xlink:title="storage_parameter_list">
<rect height="32" width="170" x="181" y="1187"></rect>
<rect class="nonterminal" height="32" width="170" x="179" y="1185"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="146" font-size="10" class="nonterminal" x="191" y="1205">storage_parameter_list</text></a><rect height="32" rx="10" width="62" x="71" y="1231"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="1229"></rect>
<text class="terminal" x="79" y="1249">RESET</text>
<rect height="32" rx="10" width="26" x="153" y="1231"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="151" y="1229"></rect>
<text class="terminal" x="161" y="1249">(</text><a xlink:href="#storage_parameter_key_list" xlink:title="storage_parameter_key_list">
<rect height="32" width="200" x="199" y="1231"></rect>
<rect class="nonterminal" height="32" width="200" x="197" y="1229"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="176" font-size="10" class="nonterminal" x="209" y="1249">storage_parameter_key_list</text></a><rect height="32" rx="10" width="26" x="439" y="1187"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="437" y="1185"></rect>
<text class="terminal" x="447" y="1205">)</text><a xlink:href="#table_rls_mode" xlink:title="table_rls_mode">
<rect height="32" width="118" x="51" y="1275"></rect>
<rect class="nonterminal" height="32" width="118" x="49" y="1273"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="94" font-size="10" class="nonterminal" x="61" y="1293">table_rls_mode</text></a><rect height="32" rx="10" width="54" x="189" y="1275"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="187" y="1273"></rect>
<text class="terminal" x="197" y="1293">ROW</text>
<rect height="32" rx="10" width="62" x="263" y="1275"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="261" y="1273"></rect>
<text class="terminal" x="271" y="1293">LEVEL</text>
<rect height="32" rx="10" width="88" x="345" y="1275"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="343" y="1273"></rect>
<text class="terminal" x="353" y="1293">SECURITY</text>
<path class="line" d="m17 17 h2 m20 0 h10 m76 0 h10 m20 0 h10 m94 0 h10 m0 0 h16 m-150 0 h20 m130 0 h20 m-170 0 q10 0 10 10 m150 0 q0 -10 10 -10 m-160 10 v24 m150 0 v-24 m-150 24 q0 10 10 10 m130 0 q10 0 10 -10 m-140 10 h10 m110 0 h10 m20 -44 h10 m108 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m108 0 h10 m0 0 h578 m-1178 0 h20 m1158 0 h20 m-1198 0 q10 0 10 10 m1178 0 q0 -10 10 -10 m-1188 10 v68 m1178 0 v-68 m-1178 68 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m48 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m40 -32 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m134 0 h10 m0 0 h308 m-872 0 h20 m852 0 h20 m-892 0 q10 0 10 10 m872 0 q0 -10 10 -10 m-882 10 v56 m872 0 v-56 m-872 56 q0 10 10 10 m852 0 q10 0 10 -10 m-842 10 h10 m124 0 h10 m0 0 h486 m-650 0 h20 m630 0 h20 m-670 0 q10 0 10 10 m650 0 q0 -10 10 -10 m-660 10 v24 m650 0 v-24 m-650 24 q0 10 10 10 m630 0 q10 0 10 -10 m-640 10 h10 m110 0 h10 m0 0 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m126 0 h10 m0 0 h10 m122 0 h10 m20 -44 h10 m162 0 h10 m20 -76 h198 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v144 m1178 0 v-144 m-1178 144 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m62 0 h10 m20 0 h10 m94 0 h10 m0 0 h10 m108 0 h10 m20 0 h10 m154 0 h10 m0 0 h580 m-774 0 h20 m754 0 h20 m-794 0 q10 0 10 10 m774 0 q0 -10 10 -10 m-784 10 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m180 0 h10 m0 0 h554 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m150 0 h10 m0 0 h584 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m58 0 h10 m20 0 h10 m48 0 h10 m0 0 h10 m56 0 h10 m0 0 h146 m-310 0 h20 m290 0 h20 m-330 0 q10 0 10 10 m310 0 q0 -10 10 -10 m-320 10 v24 m310 0 v-24 m-310 24 q0 10 10 10 m290 0 q10 0 10 -10 m-300 10 h10 m86 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m-280 -42 v20 m310 0 v-20 m-310 20 v56 m310 0 v-56 m-310 56 q0 10 10 10 m290 0 q10 0 10 -10 m-300 10 h10 m76 0 h10 m0 0 h194 m20 -120 h346 m-764 -10 v20 m774 0 v-20 m-774 20 v144 m774 0 v-144 m-774 144 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m48 0 h10 m20 0 h10 m160 0 h10 m0 0 h24 m-224 0 h20 m204 0 h20 m-244 0 q10 0 10 10 m224 0 q0 -10 10 -10 m-234 10 v24 m224 0 v-24 m-224 24 q0 10 10 10 m204 0 q10 0 10 -10 m-214 10 h10 m184 0 h10 m20 -44 h10 m86 0 h10 m20 0 h10 m0 0 h286 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v12 m316 0 v-12 m-316 12 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m26 0 h10 m0 0 h10 m184 0 h10 m0 0 h10 m26 0 h10 m-744 -42 v20 m774 0 v-20 m-774 20 v68 m774 0 v-68 m-774 68 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m164 0 h10 m0 0 h570 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m166 0 h10 m0 0 h568 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m142 0 h10 m0 0 h592 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m44 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m56 0 h10 m0 0 h546 m-764 -10 v20 m774 0 v-20 m-774 20 v24 m774 0 v-24 m-774 24 q0 10 10 10 m754 0 q10 0 10 -10 m-764 10 h10 m106 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m90 0 h10 m0 0 h10 m174 0 h10 m0 0 h146 m-1036 -560 h20 m1036 0 h20 m-1076 0 q10 0 10 10 m1056 0 q0 -10 10 -10 m-1066 10 v584 m1056 0 v-584 m-1056 584 q0 10 10 10 m1036 0 q10 0 10 -10 m-1046 10 h10 m84 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m88 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m140 0 h10 m0 0 h10 m234 0 h10 m0 0 h38 m-1148 -614 v20 m1178 0 v-20 m-1178 20 v628 m1178 0 v-628 m-1178 628 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m58 0 h10 m20 0 h10 m94 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m108 0 h10 m0 0 h34 m-480 0 h20 m460 0 h20 m-500 0 q10 0 10 10 m480 0 q0 -10 10 -10 m-490 10 v56 m480 0 v-56 m-480 56 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m110 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m126 0 h10 m20 -76 h10 m142 0 h10 m0 0 h418 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v132 m1178 0 v-132 m-1178 132 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m88 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m126 0 h10 m0 0 h774 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v24 m1178 0 v-24 m-1178 24 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m178 0 h10 m0 0 h10 m44 0 h10 m0 0 h10 m96 0 h10 m0 0 h780 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v24 m1178 0 v-24 m-1178 24 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m136 0 h10 m0 0 h1002 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v24 m1178 0 v-24 m-1178 24 q0 10 10 10 m1158 0 q10 0 10 -10 m-1148 10 h10 m44 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m170 0 h10 m0 0 h48 m-368 0 h20 m348 0 h20 m-388 0 q10 0 10 10 m368 0 q0 -10 10 -10 m-378 10 v24 m368 0 v-24 m-368 24 q0 10 10 10 m348 0 q10 0 10 -10 m-358 10 h10 m62 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m200 0 h10 m20 -44 h10 m26 0 h10 m0 0 h724 m-1168 -10 v20 m1178 0 v-20 m-1178 20 v68 m1178 0 v-68 m-1178 68 q0 10 10 10 m1158 0 q10 0 10 -10 m-1168 10 h10 m118 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m62 0 h10 m0 0 h10 m88 0 h10 m0 0 h756 m23 -1272 h-3"></path>
<polygon points="1227 17 1235 13 1235 21"></polygon>
<polygon points="1227 17 1219 13 1219 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
