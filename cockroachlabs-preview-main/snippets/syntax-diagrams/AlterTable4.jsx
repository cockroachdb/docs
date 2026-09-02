export const AlterTable4 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1559" width="1555" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="9 95 1 91 1 99"></polygon>
<polygon points="17 95 9 91 9 99"></polygon>
<rect height="32" rx="10" width="48" x="71" y="81"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="69" y="79"></rect>
<text class="terminal" x="79" y="99">ADD</text>
<rect height="32" rx="10" width="78" x="179" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="177" y="111"></rect>
<text class="terminal" x="187" y="131">COLUMN</text>
<rect height="32" rx="10" width="34" x="317" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="315" y="111"></rect>
<text class="terminal" x="325" y="131">IF</text>
<rect height="32" rx="10" width="48" x="371" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="369" y="111"></rect>
<text class="terminal" x="379" y="131">NOT</text>
<rect height="32" rx="10" width="70" x="439" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="437" y="111"></rect>
<text class="terminal" x="447" y="131">EXISTS</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="549" y="81"></rect>
<rect class="nonterminal" height="32" width="108" x="547" y="79"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="559" y="99">column_name</text></a><a xlink:href="/docs/v23.2/sql-grammar#typename" xlink:title="typename">
<rect height="32" width="84" x="677" y="81"></rect>
<rect class="nonterminal" height="32" width="84" x="675" y="79"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="687" y="99">typename</text></a><a xlink:href="/docs/v23.2/sql-grammar#col_qualification" xlink:title="col_qualification">
<rect height="32" width="122" x="801" y="47"></rect>
<rect class="nonterminal" height="32" width="122" x="799" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="811" y="65">col_qualification</text></a><rect height="32" rx="10" width="110" x="179" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="177" y="187"></rect>
<text class="terminal" x="187" y="207">CONSTRAINT</text>
<rect height="32" rx="10" width="34" x="329" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="327" y="219"></rect>
<text class="terminal" x="337" y="239">IF</text>
<rect height="32" rx="10" width="48" x="383" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="381" y="219"></rect>
<text class="terminal" x="391" y="239">NOT</text>
<rect height="32" rx="10" width="70" x="451" y="221"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="449" y="219"></rect>
<text class="terminal" x="459" y="239">EXISTS</text>
<rect height="32" width="126" x="561" y="189"></rect>
<rect class="nonterminal" height="32" width="126" x="559" y="187"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="571" y="207">constraint_name</text><a xlink:href="/docs/v23.2/sql-grammar#constraint_elem" xlink:title="constraint_elem">
<rect height="32" width="122" x="727" y="157"></rect>
<rect class="nonterminal" height="32" width="122" x="725" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="737" y="175">constraint_elem</text></a><rect height="32" rx="10" width="48" x="889" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="887" y="187"></rect>
<text class="terminal" x="897" y="207">NOT</text>
<rect height="32" rx="10" width="62" x="957" y="189"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="955" y="187"></rect>
<text class="terminal" x="965" y="207">VALID</text>
<rect height="32" rx="10" width="76" x="71" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="69" y="263"></rect>
<text class="terminal" x="79" y="283">RENAME</text>
<rect height="32" rx="10" width="78" x="207" y="297"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="205" y="295"></rect>
<text class="terminal" x="215" y="315">COLUMN</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="325" y="265"></rect>
<rect class="nonterminal" height="32" width="108" x="323" y="263"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="335" y="283">column_name</text></a><rect height="32" rx="10" width="38" x="453" y="265"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="451" y="263"></rect>
<text class="terminal" x="461" y="283">TO</text>
<rect height="32" width="142" x="511" y="265"></rect>
<rect class="nonterminal" height="32" width="142" x="509" y="263"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="12" class="nonterminal" x="521" y="283">column_new_name</text><rect height="32" rx="10" width="110" x="187" y="341"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="185" y="339"></rect>
<text class="terminal" x="195" y="359">CONSTRAINT</text>
<rect height="32" width="126" x="317" y="341"></rect>
<rect class="nonterminal" height="32" width="126" x="315" y="339"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="327" y="359">constraint_name</text><rect height="32" rx="10" width="38" x="463" y="341"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="461" y="339"></rect>
<text class="terminal" x="471" y="359">TO</text>
<rect height="32" width="160" x="521" y="341"></rect>
<rect class="nonterminal" height="32" width="160" x="519" y="339"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="136" font-size="11" class="nonterminal" x="531" y="359">constraint_new_name</text><rect height="32" rx="10" width="62" x="71" y="385"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="69" y="383"></rect>
<text class="terminal" x="79" y="403">ALTER</text>
<rect height="32" rx="10" width="78" x="193" y="417"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="191" y="415"></rect>
<text class="terminal" x="201" y="435">COLUMN</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="311" y="385"></rect>
<rect class="nonterminal" height="32" width="108" x="309" y="383"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="321" y="403">column_name</text></a><rect height="32" rx="10" width="44" x="459" y="385"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="457" y="383"></rect>
<text class="terminal" x="467" y="403">SET</text>
<rect height="32" rx="10" width="80" x="543" y="385"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="541" y="383"></rect>
<text class="terminal" x="551" y="403">DEFAULT</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="643" y="385"></rect>
<rect class="nonterminal" height="32" width="64" x="641" y="383"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="653" y="403">a_expr</text></a><rect height="32" rx="10" width="40" x="543" y="429"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="541" y="427"></rect>
<text class="terminal" x="551" y="447">ON</text>
<rect height="32" rx="10" width="74" x="603" y="429"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="601" y="427"></rect>
<text class="terminal" x="611" y="447">UPDATE</text><a xlink:href="/docs/v23.2/sql-grammar#b_expr" xlink:title="b_expr">
<rect height="32" width="64" x="697" y="429"></rect>
<rect class="nonterminal" height="32" width="64" x="695" y="427"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="707" y="447">b_expr</text></a><rect height="32" rx="10" width="76" x="543" y="473"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="541" y="471"></rect>
<text class="terminal" x="551" y="491">VISIBLE</text>
<rect height="32" rx="10" width="48" x="543" y="517"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="541" y="515"></rect>
<text class="terminal" x="551" y="535">NOT</text>
<rect height="32" rx="10" width="76" x="631" y="517"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="629" y="515"></rect>
<text class="terminal" x="639" y="535">VISIBLE</text>
<rect height="32" rx="10" width="56" x="631" y="561"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="629" y="559"></rect>
<text class="terminal" x="639" y="579">NULL</text>
<rect height="32" rx="10" width="58" x="459" y="605"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="457" y="603"></rect>
<text class="terminal" x="467" y="623">DROP</text>
<rect height="32" rx="10" width="80" x="557" y="605"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="555" y="603"></rect>
<text class="terminal" x="565" y="623">DEFAULT</text>
<rect height="32" rx="10" width="40" x="557" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="555" y="647"></rect>
<text class="terminal" x="565" y="667">ON</text>
<rect height="32" rx="10" width="74" x="617" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="615" y="647"></rect>
<text class="terminal" x="625" y="667">UPDATE</text>
<rect height="32" rx="10" width="48" x="557" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="555" y="691"></rect>
<text class="terminal" x="565" y="711">NOT</text>
<rect height="32" rx="10" width="56" x="625" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="623" y="691"></rect>
<text class="terminal" x="633" y="711">NULL</text>
<rect height="32" rx="10" width="76" x="557" y="737"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="555" y="735"></rect>
<text class="terminal" x="565" y="755">STORED</text>
<rect height="32" rx="10" width="44" x="479" y="813"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="477" y="811"></rect>
<text class="terminal" x="487" y="831">SET</text>
<rect height="32" rx="10" width="56" x="543" y="813"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="541" y="811"></rect>
<text class="terminal" x="551" y="831">DATA</text>
<rect height="32" rx="10" width="54" x="639" y="781"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="637" y="779"></rect>
<text class="terminal" x="647" y="799">TYPE</text><a xlink:href="/docs/v23.2/sql-grammar#typename" xlink:title="typename">
<rect height="32" width="84" x="713" y="781"></rect>
<rect class="nonterminal" height="32" width="84" x="711" y="779"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="60" font-size="12" class="nonterminal" x="723" y="799">typename</text></a><rect height="32" rx="10" width="82" x="837" y="813"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="835" y="811"></rect>
<text class="terminal" x="845" y="831">COLLATE</text><a xlink:href="/docs/v23.2/sql-grammar#collation_name" xlink:title="collation_name">
<rect height="32" width="116" x="939" y="813"></rect>
<rect class="nonterminal" height="32" width="116" x="937" y="811"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="92" font-size="10" class="nonterminal" x="949" y="831">collation_name</text></a><rect height="32" rx="10" width="64" x="1115" y="813"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="1113" y="811"></rect>
<text class="terminal" x="1123" y="831">USING</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="1199" y="813"></rect>
<rect class="nonterminal" height="32" width="64" x="1197" y="811"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="1209" y="831">a_expr</text></a><rect height="32" rx="10" width="84" x="173" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="171" y="899"></rect>
<text class="terminal" x="181" y="919">PRIMARY</text>
<rect height="32" rx="10" width="46" x="277" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="275" y="899"></rect>
<text class="terminal" x="285" y="919">KEY</text>
<rect height="32" rx="10" width="64" x="343" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="341" y="899"></rect>
<text class="terminal" x="351" y="919">USING</text>
<rect height="32" rx="10" width="88" x="427" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="425" y="899"></rect>
<text class="terminal" x="435" y="919">COLUMNS</text>
<rect height="32" rx="10" width="26" x="535" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="533" y="899"></rect>
<text class="terminal" x="543" y="919">(</text><a xlink:href="/docs/v23.2/sql-grammar#index_params" xlink:title="index_params">
<rect height="32" width="110" x="581" y="901"></rect>
<rect class="nonterminal" height="32" width="110" x="579" y="899"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="11" class="nonterminal" x="591" y="919">index_params</text></a><rect height="32" rx="10" width="26" x="711" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="709" y="899"></rect>
<text class="terminal" x="719" y="919">)</text>
<rect height="32" rx="10" width="64" x="777" y="933"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="775" y="931"></rect>
<text class="terminal" x="785" y="951">USING</text>
<rect height="32" rx="10" width="58" x="861" y="933"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="859" y="931"></rect>
<text class="terminal" x="869" y="951">HASH</text>
<rect height="32" rx="10" width="58" x="959" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="957" y="899"></rect>
<text class="terminal" x="967" y="919">WITH</text>
<rect height="32" rx="10" width="26" x="1037" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1035" y="899"></rect>
<text class="terminal" x="1045" y="919">(</text><a xlink:href="/docs/v23.2/sql-grammar#storage_parameter_key" xlink:title="storage_parameter_key">
<rect height="32" width="174" x="1103" y="901"></rect>
<rect class="nonterminal" height="32" width="174" x="1101" y="899"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="11" class="nonterminal" x="1113" y="919">storage_parameter_key</text></a><rect height="32" rx="10" width="30" x="1297" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="1295" y="899"></rect>
<text class="terminal" x="1305" y="919">=</text>
<rect height="32" width="54" x="1347" y="901"></rect>
<rect class="nonterminal" height="32" width="54" x="1345" y="899"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1357" y="919">value</text><rect height="32" rx="10" width="24" x="1103" y="857"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1101" y="855"></rect>
<text class="terminal" x="1111" y="875">,</text>
<rect height="32" rx="10" width="26" x="1441" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1439" y="899"></rect>
<text class="terminal" x="1449" y="919">)</text>
<rect height="32" rx="10" width="58" x="71" y="977"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="69" y="975"></rect>
<text class="terminal" x="79" y="995">DROP</text>
<rect height="32" rx="10" width="78" x="189" y="1009"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="187" y="1007"></rect>
<text class="terminal" x="197" y="1027">COLUMN</text>
<rect height="32" rx="10" width="34" x="327" y="1009"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="325" y="1007"></rect>
<text class="terminal" x="335" y="1027">IF</text>
<rect height="32" rx="10" width="70" x="381" y="1009"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="379" y="1007"></rect>
<text class="terminal" x="389" y="1027">EXISTS</text><a xlink:href="/docs/v23.2/sql-grammar#column_name" xlink:title="column_name">
<rect height="32" width="108" x="491" y="977"></rect>
<rect class="nonterminal" height="32" width="108" x="489" y="975"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="84" font-size="12" class="nonterminal" x="501" y="995">column_name</text></a><rect height="32" rx="10" width="110" x="169" y="1053"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="167" y="1051"></rect>
<text class="terminal" x="177" y="1071">CONSTRAINT</text>
<rect height="32" rx="10" width="34" x="319" y="1085"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="317" y="1083"></rect>
<text class="terminal" x="327" y="1103">IF</text>
<rect height="32" rx="10" width="70" x="373" y="1085"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="371" y="1083"></rect>
<text class="terminal" x="381" y="1103">EXISTS</text>
<rect height="32" width="126" x="483" y="1053"></rect>
<rect class="nonterminal" height="32" width="126" x="481" y="1051"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="493" y="1071">constraint_name</text><rect height="32" rx="10" width="84" x="669" y="1009"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="667" y="1007"></rect>
<text class="terminal" x="677" y="1027">CASCADE</text>
<rect height="32" rx="10" width="88" x="669" y="1053"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="667" y="1051"></rect>
<text class="terminal" x="677" y="1071">RESTRICT</text>
<rect height="32" rx="10" width="88" x="71" y="1129"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="69" y="1127"></rect>
<text class="terminal" x="79" y="1147">VALIDATE</text>
<rect height="32" rx="10" width="110" x="179" y="1129"></rect>
<rect class="terminal" height="32" rx="10" width="110" x="177" y="1127"></rect>
<text class="terminal" x="187" y="1147">CONSTRAINT</text>
<rect height="32" width="126" x="309" y="1129"></rect>
<rect class="nonterminal" height="32" width="126" x="307" y="1127"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="319" y="1147">constraint_name</text><rect height="32" rx="10" width="178" x="71" y="1173"></rect>
<rect class="terminal" height="32" rx="10" width="178" x="69" y="1171"></rect>
<text class="terminal" x="79" y="1191">EXPERIMENTAL_AUDIT</text>
<rect height="32" rx="10" width="44" x="269" y="1173"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="267" y="1171"></rect>
<text class="terminal" x="277" y="1191">SET</text>
<rect height="32" rx="10" width="56" x="353" y="1173"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="351" y="1171"></rect>
<text class="terminal" x="361" y="1191">READ</text>
<rect height="32" rx="10" width="66" x="429" y="1173"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="427" y="1171"></rect>
<text class="terminal" x="437" y="1191">WRITE</text>
<rect height="32" rx="10" width="46" x="353" y="1217"></rect>
<rect class="terminal" height="32" rx="10" width="46" x="351" y="1215"></rect>
<text class="terminal" x="361" y="1235">OFF</text>
<rect height="32" rx="10" width="98" x="71" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="69" y="1259"></rect>
<text class="terminal" x="79" y="1279">PARTITION</text>
<rect height="32" rx="10" width="44" x="209" y="1293"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="207" y="1291"></rect>
<text class="terminal" x="217" y="1311">ALL</text>
<rect height="32" rx="10" width="38" x="293" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="291" y="1259"></rect>
<text class="terminal" x="301" y="1279">BY</text>
<rect height="32" rx="10" width="52" x="391" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="389" y="1259"></rect>
<text class="terminal" x="399" y="1279">LIST</text>
<rect height="32" rx="10" width="26" x="463" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="461" y="1259"></rect>
<text class="terminal" x="471" y="1279">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="509" y="1261"></rect>
<rect class="nonterminal" height="32" width="82" x="507" y="1259"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="519" y="1279">name_list</text></a><rect height="32" rx="10" width="26" x="611" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="609" y="1259"></rect>
<text class="terminal" x="619" y="1279">)</text>
<rect height="32" rx="10" width="26" x="657" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="655" y="1259"></rect>
<text class="terminal" x="665" y="1279">(</text><a xlink:href="/docs/v23.2/sql-grammar#list_partitions" xlink:title="list_partitions">
<rect height="32" width="106" x="703" y="1261"></rect>
<rect class="nonterminal" height="32" width="106" x="701" y="1259"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="713" y="1279">list_partitions</text></a><rect height="32" rx="10" width="66" x="391" y="1305"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="389" y="1303"></rect>
<text class="terminal" x="399" y="1323">RANGE</text>
<rect height="32" rx="10" width="26" x="477" y="1305"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="475" y="1303"></rect>
<text class="terminal" x="485" y="1323">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="523" y="1305"></rect>
<rect class="nonterminal" height="32" width="82" x="521" y="1303"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="533" y="1323">name_list</text></a><rect height="32" rx="10" width="26" x="625" y="1305"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="623" y="1303"></rect>
<text class="terminal" x="633" y="1323">)</text>
<rect height="32" rx="10" width="26" x="671" y="1305"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="669" y="1303"></rect>
<text class="terminal" x="679" y="1323">(</text><a xlink:href="/docs/v23.2/sql-grammar#range_partitions" xlink:title="range_partitions">
<rect height="32" width="126" x="717" y="1305"></rect>
<rect class="nonterminal" height="32" width="126" x="715" y="1303"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="727" y="1323">range_partitions</text></a><rect height="32" rx="10" width="26" x="883" y="1261"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="881" y="1259"></rect>
<text class="terminal" x="891" y="1279">)</text>
<rect height="32" rx="10" width="86" x="371" y="1349"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="369" y="1347"></rect>
<text class="terminal" x="379" y="1367">NOTHING</text>
<rect height="32" rx="10" width="44" x="91" y="1437"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="89" y="1435"></rect>
<text class="terminal" x="99" y="1455">SET</text>
<rect height="32" rx="10" width="26" x="155" y="1437"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="153" y="1435"></rect>
<text class="terminal" x="163" y="1455">(</text><a xlink:href="/docs/v23.2/sql-grammar#storage_parameter_key" xlink:title="storage_parameter_key">
<rect height="32" width="174" x="221" y="1437"></rect>
<rect class="nonterminal" height="32" width="174" x="219" y="1435"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="11" class="nonterminal" x="231" y="1455">storage_parameter_key</text></a><rect height="32" rx="10" width="30" x="415" y="1437"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="413" y="1435"></rect>
<text class="terminal" x="423" y="1455">=</text>
<rect height="32" width="54" x="465" y="1437"></rect>
<rect class="nonterminal" height="32" width="54" x="463" y="1435"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="475" y="1455">value</text><rect height="32" rx="10" width="24" x="221" y="1393"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="219" y="1391"></rect>
<text class="terminal" x="229" y="1411">,</text>
<rect height="32" rx="10" width="62" x="91" y="1525"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="89" y="1523"></rect>
<text class="terminal" x="99" y="1543">RESET</text>
<rect height="32" rx="10" width="26" x="173" y="1525"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="171" y="1523"></rect>
<text class="terminal" x="181" y="1543">(</text><a xlink:href="/docs/v23.2/sql-grammar#storage_parameter_key" xlink:title="storage_parameter_key">
<rect height="32" width="174" x="239" y="1525"></rect>
<rect class="nonterminal" height="32" width="174" x="237" y="1523"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="150" font-size="11" class="nonterminal" x="249" y="1543">storage_parameter_key</text></a><rect height="32" rx="10" width="24" x="239" y="1481"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="237" y="1479"></rect>
<text class="terminal" x="247" y="1499">,</text>
<rect height="32" rx="10" width="26" x="579" y="1437"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="577" y="1435"></rect>
<text class="terminal" x="587" y="1455">)</text>
<rect height="32" rx="10" width="24" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">,</text>
<path class="line" d="m17 95 h2 m40 0 h10 m48 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m40 -32 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m108 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m0 0 h132 m-162 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -14 q0 -10 10 -10 m142 34 l20 0 m-20 0 q10 0 10 -10 l0 -14 q0 -10 -10 -10 m-142 0 h10 m122 0 h10 m20 34 h96 m-920 0 h20 m900 0 h20 m-940 0 q10 0 10 10 m920 0 q0 -10 10 -10 m-930 10 v56 m920 0 v-56 m-920 56 q0 10 10 10 m900 0 q10 0 10 -10 m-890 10 h10 m0 0 h518 m-548 0 h20 m528 0 h20 m-568 0 q10 0 10 10 m548 0 q0 -10 10 -10 m-558 10 v12 m548 0 v-12 m-548 12 q0 10 10 10 m528 0 q10 0 10 -10 m-538 10 h10 m110 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m126 0 h10 m20 -32 h10 m122 0 h10 m20 0 h10 m0 0 h140 m-170 0 h20 m150 0 h20 m-190 0 q10 0 10 10 m170 0 q0 -10 10 -10 m-180 10 v12 m170 0 v-12 m-170 12 q0 10 10 10 m150 0 q10 0 10 -10 m-160 10 h10 m48 0 h10 m0 0 h10 m62 0 h10 m40 -108 h428 m-1456 0 h20 m1436 0 h20 m-1476 0 q10 0 10 10 m1456 0 q0 -10 10 -10 m-1466 10 v164 m1456 0 v-164 m-1456 164 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m76 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m20 -32 h10 m108 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m142 0 h10 m0 0 h28 m-534 0 h20 m514 0 h20 m-554 0 q10 0 10 10 m534 0 q0 -10 10 -10 m-544 10 v56 m534 0 v-56 m-534 56 q0 10 10 10 m514 0 q10 0 10 -10 m-524 10 h10 m110 0 h10 m0 0 h10 m126 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m160 0 h10 m20 -76 h786 m-1446 -10 v20 m1456 0 v-20 m-1456 20 v100 m1456 0 v-100 m-1456 100 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m62 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m20 -32 h10 m108 0 h10 m20 0 h10 m44 0 h10 m20 0 h10 m80 0 h10 m0 0 h10 m64 0 h10 m0 0 h54 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m40 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m64 0 h10 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m76 0 h10 m0 0 h142 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m48 0 h10 m20 0 h10 m76 0 h10 m-116 0 h20 m96 0 h20 m-136 0 q10 0 10 10 m116 0 q0 -10 10 -10 m-126 10 v24 m116 0 v-24 m-116 24 q0 10 10 10 m96 0 q10 0 10 -10 m-106 10 h10 m56 0 h10 m0 0 h20 m20 -44 h34 m20 -132 h502 m-864 0 h20 m844 0 h20 m-884 0 q10 0 10 10 m864 0 q0 -10 10 -10 m-874 10 v200 m864 0 v-200 m-864 200 q0 10 10 10 m844 0 q10 0 10 -10 m-854 10 h10 m58 0 h10 m20 0 h10 m80 0 h10 m0 0 h54 m-174 0 h20 m154 0 h20 m-194 0 q10 0 10 10 m174 0 q0 -10 10 -10 m-184 10 v24 m174 0 v-24 m-174 24 q0 10 10 10 m154 0 q10 0 10 -10 m-164 10 h10 m40 0 h10 m0 0 h10 m74 0 h10 m-164 -10 v20 m174 0 v-20 m-174 20 v24 m174 0 v-24 m-174 24 q0 10 10 10 m154 0 q10 0 10 -10 m-164 10 h10 m48 0 h10 m0 0 h10 m56 0 h10 m0 0 h10 m-164 -10 v20 m174 0 v-20 m-174 20 v24 m174 0 v-24 m-174 24 q0 10 10 10 m154 0 q10 0 10 -10 m-164 10 h10 m76 0 h10 m0 0 h58 m20 -132 h572 m-854 -10 v20 m864 0 v-20 m-864 20 v156 m864 0 v-156 m-864 156 q0 10 10 10 m844 0 q10 0 10 -10 m-834 10 h10 m0 0 h130 m-160 0 h20 m140 0 h20 m-180 0 q10 0 10 10 m160 0 q0 -10 10 -10 m-170 10 v12 m160 0 v-12 m-160 12 q0 10 10 10 m140 0 q10 0 10 -10 m-150 10 h10 m44 0 h10 m0 0 h10 m56 0 h10 m20 -32 h10 m54 0 h10 m0 0 h10 m84 0 h10 m20 0 h10 m0 0 h228 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v12 m258 0 v-12 m-258 12 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m82 0 h10 m0 0 h10 m116 0 h10 m40 -32 h10 m0 0 h158 m-188 0 h20 m168 0 h20 m-208 0 q10 0 10 10 m188 0 q0 -10 10 -10 m-198 10 v12 m188 0 v-12 m-188 12 q0 10 10 10 m168 0 q10 0 10 -10 m-178 10 h10 m64 0 h10 m0 0 h10 m64 0 h10 m40 -428 h164 m-1334 0 h20 m1314 0 h20 m-1354 0 q10 0 10 10 m1334 0 q0 -10 10 -10 m-1344 10 v496 m1334 0 v-496 m-1334 496 q0 10 10 10 m1314 0 q10 0 10 -10 m-1324 10 h10 m84 0 h10 m0 0 h10 m46 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m88 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m0 0 h152 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v12 m182 0 v-12 m-182 12 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m64 0 h10 m0 0 h10 m58 0 h10 m20 -32 h10 m58 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m174 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m54 0 h10 m-338 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m318 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-318 0 h10 m24 0 h10 m0 0 h274 m20 44 h10 m26 0 h10 m-1426 -526 v20 m1456 0 v-20 m-1456 20 v572 m1456 0 v-572 m-1456 572 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m58 0 h10 m40 0 h10 m0 0 h88 m-118 0 h20 m98 0 h20 m-138 0 q10 0 10 10 m118 0 q0 -10 10 -10 m-128 10 v12 m118 0 v-12 m-118 12 q0 10 10 10 m98 0 q10 0 10 -10 m-108 10 h10 m78 0 h10 m40 -32 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m108 0 h10 m0 0 h10 m-480 0 h20 m460 0 h20 m-500 0 q10 0 10 10 m480 0 q0 -10 10 -10 m-490 10 v56 m480 0 v-56 m-480 56 q0 10 10 10 m460 0 q10 0 10 -10 m-470 10 h10 m110 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m126 0 h10 m40 -76 h10 m0 0 h98 m-128 0 h20 m108 0 h20 m-148 0 q10 0 10 10 m128 0 q0 -10 10 -10 m-138 10 v12 m128 0 v-12 m-128 12 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m84 0 h10 m0 0 h4 m-118 -10 v20 m128 0 v-20 m-128 20 v24 m128 0 v-24 m-128 24 q0 10 10 10 m108 0 q10 0 10 -10 m-118 10 h10 m88 0 h10 m20 -76 h710 m-1446 -10 v20 m1456 0 v-20 m-1456 20 v132 m1456 0 v-132 m-1456 132 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m88 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m126 0 h10 m0 0 h1052 m-1446 -10 v20 m1456 0 v-20 m-1456 20 v24 m1456 0 v-24 m-1456 24 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m178 0 h10 m0 0 h10 m44 0 h10 m20 0 h10 m56 0 h10 m0 0 h10 m66 0 h10 m-182 0 h20 m162 0 h20 m-202 0 q10 0 10 10 m182 0 q0 -10 10 -10 m-192 10 v24 m182 0 v-24 m-182 24 q0 10 10 10 m162 0 q10 0 10 -10 m-172 10 h10 m46 0 h10 m0 0 h96 m20 -44 h972 m-1446 -10 v20 m1456 0 v-20 m-1456 20 v68 m1456 0 v-68 m-1456 68 q0 10 10 10 m1436 0 q10 0 10 -10 m-1446 10 h10 m98 0 h10 m20 0 h10 m0 0 h54 m-84 0 h20 m64 0 h20 m-104 0 q10 0 10 10 m84 0 q0 -10 10 -10 m-94 10 v12 m84 0 v-12 m-84 12 q0 10 10 10 m64 0 q10 0 10 -10 m-74 10 h10 m44 0 h10 m20 -32 h10 m38 0 h10 m40 0 h10 m52 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m106 0 h10 m0 0 h34 m-492 0 h20 m472 0 h20 m-512 0 q10 0 10 10 m492 0 q0 -10 10 -10 m-502 10 v24 m492 0 v-24 m-492 24 q0 10 10 10 m472 0 q10 0 10 -10 m-482 10 h10 m66 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m126 0 h10 m20 -44 h10 m26 0 h10 m-578 0 h20 m558 0 h20 m-598 0 q10 0 10 10 m578 0 q0 -10 10 -10 m-588 10 v68 m578 0 v-68 m-578 68 q0 10 10 10 m558 0 q10 0 10 -10 m-568 10 h10 m86 0 h10 m0 0 h452 m20 -88 h558 m-1446 -10 v20 m1456 0 v-20 m-1456 20 v156 m1456 0 v-156 m-1456 156 q0 10 10 10 m1436 0 q10 0 10 -10 m-1426 10 h10 m44 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m174 0 h10 m0 0 h10 m30 0 h10 m0 0 h10 m54 0 h10 m-338 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m318 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-318 0 h10 m24 0 h10 m0 0 h274 m-468 44 h20 m468 0 h20 m-508 0 q10 0 10 10 m488 0 q0 -10 10 -10 m-498 10 v68 m488 0 v-68 m-488 68 q0 10 10 10 m468 0 q10 0 10 -10 m-478 10 h10 m62 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m174 0 h10 m-214 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m194 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-194 0 h10 m24 0 h10 m0 0 h150 m20 44 h106 m20 -88 h10 m26 0 h10 m0 0 h882 m-1476 -1356 l20 0 m-1 0 q-9 0 -9 -10 l0 -58 q0 -10 10 -10 m1476 78 l20 0 m-20 0 q10 0 10 -10 l0 -58 q0 -10 -10 -10 m-1476 0 h10 m24 0 h10 m0 0 h1432 m23 78 h-3"></path>
<polygon points="1545 95 1553 91 1553 99"></polygon>
<polygon points="1545 95 1537 91 1537 99"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
