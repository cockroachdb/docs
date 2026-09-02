export const AlterDatabase3 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1463" width="1987" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="92" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">DATABASE</text><a xlink:href="/docs/v24.1/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="227" y="3"></rect>
<rect class="nonterminal" height="32" width="124" x="225" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="237" y="21">database_name</text></a><rect height="32" rx="10" width="76" x="45" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="43" y="67"></rect>
<text class="terminal" x="53" y="87">RENAME</text>
<rect height="32" rx="10" width="38" x="141" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="139" y="67"></rect>
<text class="terminal" x="149" y="87">TO</text>
<rect height="32" width="156" x="199" y="69"></rect>
<rect class="nonterminal" height="32" width="156" x="197" y="67"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="132" font-size="12" class="nonterminal" x="209" y="87">database_new_name</text><rect height="32" rx="10" width="102" x="45" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="43" y="133"></rect>
<text class="terminal" x="53" y="153">CONFIGURE</text>
<rect height="32" rx="10" width="58" x="167" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="165" y="133"></rect>
<text class="terminal" x="175" y="153">ZONE</text>
<rect height="32" rx="10" width="64" x="265" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="263" y="133"></rect>
<text class="terminal" x="273" y="153">USING</text>
<rect height="32" width="70" x="349" y="135"></rect>
<rect class="nonterminal" height="32" width="70" x="347" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="359" y="153">variable</text><rect height="32" rx="10" width="30" x="439" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="437" y="133"></rect>
<text class="terminal" x="447" y="153">=</text>
<rect height="32" rx="10" width="58" x="509" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="507" y="133"></rect>
<text class="terminal" x="517" y="153">COPY</text>
<rect height="32" rx="10" width="60" x="587" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="585" y="133"></rect>
<text class="terminal" x="595" y="153">FROM</text>
<rect height="32" rx="10" width="74" x="667" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="665" y="133"></rect>
<text class="terminal" x="675" y="153">PARENT</text>
<rect height="32" width="54" x="509" y="179"></rect>
<rect class="nonterminal" height="32" width="54" x="507" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="519" y="197">value</text><rect height="32" rx="10" width="24" x="821" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="819" y="133"></rect>
<text class="terminal" x="829" y="153">,</text>
<rect height="32" width="70" x="865" y="135"></rect>
<rect class="nonterminal" height="32" width="70" x="863" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="875" y="153">variable</text><rect height="32" rx="10" width="30" x="955" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="953" y="133"></rect>
<text class="terminal" x="963" y="153">=</text>
<rect height="32" width="54" x="1025" y="135"></rect>
<rect class="nonterminal" height="32" width="54" x="1023" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1035" y="153">value</text><rect height="32" rx="10" width="58" x="1025" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1023" y="177"></rect>
<text class="terminal" x="1033" y="197">COPY</text>
<rect height="32" rx="10" width="60" x="1103" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="1101" y="177"></rect>
<text class="terminal" x="1111" y="197">FROM</text>
<rect height="32" rx="10" width="74" x="1183" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1181" y="177"></rect>
<text class="terminal" x="1191" y="197">PARENT</text>
<rect height="32" rx="10" width="82" x="265" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="263" y="243"></rect>
<text class="terminal" x="273" y="263">DISCARD</text>
<rect height="32" rx="10" width="72" x="45" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="43" y="287"></rect>
<text class="terminal" x="53" y="307">OWNER</text>
<rect height="32" rx="10" width="38" x="137" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="135" y="287"></rect>
<text class="terminal" x="145" y="307">TO</text><a xlink:href="/docs/v24.1/sql-grammar#role_spec" xlink:title="role_spec">
<rect height="32" width="82" x="195" y="289"></rect>
<rect class="nonterminal" height="32" width="82" x="193" y="287"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="205" y="307">role_spec</text></a><rect height="32" rx="10" width="84" x="45" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="43" y="331"></rect>
<text class="terminal" x="53" y="351">CONVERT</text>
<rect height="32" rx="10" width="38" x="149" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="147" y="331"></rect>
<text class="terminal" x="157" y="351">TO</text>
<rect height="32" rx="10" width="76" x="207" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="205" y="331"></rect>
<text class="terminal" x="215" y="351">SCHEMA</text>
<rect height="32" rx="10" width="58" x="303" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="301" y="331"></rect>
<text class="terminal" x="311" y="351">WITH</text>
<rect height="32" rx="10" width="74" x="381" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="379" y="331"></rect>
<text class="terminal" x="389" y="351">PARENT</text><a xlink:href="/docs/v24.1/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="475" y="333"></rect>
<rect class="nonterminal" height="32" width="124" x="473" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="485" y="351">database_name</text></a><rect height="32" rx="10" width="48" x="45" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="43" y="375"></rect>
<text class="terminal" x="53" y="395">ADD</text>
<rect height="32" rx="10" width="74" x="133" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="131" y="375"></rect>
<text class="terminal" x="141" y="395">REGION</text>
<rect height="32" rx="10" width="34" x="247" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="245" y="407"></rect>
<text class="terminal" x="255" y="427">IF</text>
<rect height="32" rx="10" width="48" x="301" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="299" y="407"></rect>
<text class="terminal" x="309" y="427">NOT</text>
<rect height="32" rx="10" width="70" x="369" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="367" y="407"></rect>
<text class="terminal" x="377" y="427">EXISTS</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="479" y="377"></rect>
<rect class="nonterminal" height="32" width="104" x="477" y="375"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="489" y="395">region_name</text></a><rect height="32" rx="10" width="64" x="133" y="453"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="131" y="451"></rect>
<text class="terminal" x="141" y="471">SUPER</text>
<rect height="32" rx="10" width="74" x="217" y="453"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="215" y="451"></rect>
<text class="terminal" x="225" y="471">REGION</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="311" y="453"></rect>
<rect class="nonterminal" height="32" width="104" x="309" y="451"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="321" y="471">region_name</text></a><rect height="32" rx="10" width="72" x="435" y="453"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="433" y="451"></rect>
<text class="terminal" x="443" y="471">VALUES</text>
<rect height="32" width="130" x="527" y="453"></rect>
<rect class="nonterminal" height="32" width="130" x="525" y="451"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="537" y="471">region_name_list</text><rect height="32" rx="10" width="58" x="45" y="497"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="43" y="495"></rect>
<text class="terminal" x="53" y="515">DROP</text>
<rect height="32" rx="10" width="74" x="163" y="497"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="161" y="495"></rect>
<text class="terminal" x="171" y="515">REGION</text>
<rect height="32" rx="10" width="34" x="277" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="275" y="527"></rect>
<text class="terminal" x="285" y="547">IF</text>
<rect height="32" rx="10" width="70" x="331" y="529"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="329" y="527"></rect>
<text class="terminal" x="339" y="547">EXISTS</text>
<rect height="32" rx="10" width="64" x="163" y="573"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="161" y="571"></rect>
<text class="terminal" x="171" y="591">SUPER</text>
<rect height="32" rx="10" width="74" x="247" y="573"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="245" y="571"></rect>
<text class="terminal" x="255" y="591">REGION</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="461" y="497"></rect>
<rect class="nonterminal" height="32" width="104" x="459" y="495"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="471" y="515">region_name</text></a><rect height="32" rx="10" width="104" x="143" y="617"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="141" y="615"></rect>
<text class="terminal" x="151" y="635">SECONDARY</text>
<rect height="32" rx="10" width="74" x="267" y="617"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="265" y="615"></rect>
<text class="terminal" x="275" y="635">REGION</text>
<rect height="32" rx="10" width="34" x="381" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="379" y="647"></rect>
<text class="terminal" x="389" y="667">IF</text>
<rect height="32" rx="10" width="70" x="435" y="649"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="433" y="647"></rect>
<text class="terminal" x="443" y="667">EXISTS</text>
<rect height="32" rx="10" width="80" x="45" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="43" y="691"></rect>
<text class="terminal" x="53" y="711">SURVIVE</text>
<rect height="32" rx="10" width="30" x="165" y="725"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="163" y="723"></rect>
<text class="terminal" x="173" y="743">=</text>
<rect height="32" rx="10" width="74" x="255" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="253" y="691"></rect>
<text class="terminal" x="263" y="711">REGION</text>
<rect height="32" rx="10" width="58" x="255" y="737"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="253" y="735"></rect>
<text class="terminal" x="263" y="755">ZONE</text>
<rect height="32" rx="10" width="78" x="369" y="693"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="367" y="691"></rect>
<text class="terminal" x="377" y="711">FAILURE</text>
<rect height="32" rx="10" width="84" x="45" y="781"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="43" y="779"></rect>
<text class="terminal" x="53" y="799">PRIMARY</text>
<rect height="32" rx="10" width="74" x="149" y="781"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="147" y="779"></rect>
<text class="terminal" x="157" y="799">REGION</text>
<rect height="32" rx="10" width="30" x="263" y="813"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="261" y="811"></rect>
<text class="terminal" x="271" y="831">=</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="333" y="781"></rect>
<rect class="nonterminal" height="32" width="104" x="331" y="779"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="343" y="799">region_name</text></a><rect height="32" rx="10" width="44" x="45" y="857"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="855"></rect>
<text class="terminal" x="53" y="875">SET</text>
<rect height="32" rx="10" width="84" x="149" y="857"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="147" y="855"></rect>
<text class="terminal" x="157" y="875">PRIMARY</text>
<rect height="32" rx="10" width="104" x="149" y="901"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="147" y="899"></rect>
<text class="terminal" x="157" y="919">SECONDARY</text>
<rect height="32" rx="10" width="74" x="293" y="857"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="291" y="855"></rect>
<text class="terminal" x="301" y="875">REGION</text>
<rect height="32" rx="10" width="30" x="407" y="889"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="405" y="887"></rect>
<text class="terminal" x="415" y="907">=</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="477" y="857"></rect>
<rect class="nonterminal" height="32" width="104" x="475" y="855"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="487" y="875">region_name</text></a>
<rect height="32" width="70" x="129" y="989"></rect>
<rect class="nonterminal" height="32" width="70" x="127" y="987"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="139" y="1007">variable</text><rect height="32" rx="10" width="30" x="239" y="989"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="237" y="987"></rect>
<text class="terminal" x="247" y="1007">=</text>
<rect height="32" rx="10" width="38" x="239" y="1033"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="237" y="1031"></rect>
<text class="terminal" x="247" y="1051">TO</text>
<rect height="32" width="54" x="337" y="989"></rect>
<rect class="nonterminal" height="32" width="54" x="335" y="987"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="347" y="1007">value</text><rect height="32" rx="10" width="24" x="337" y="945"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="335" y="943"></rect>
<text class="terminal" x="345" y="963">,</text>
<rect height="32" rx="10" width="100" x="45" y="1077"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="43" y="1075"></rect>
<text class="terminal" x="53" y="1095">PLACEMENT</text>
<rect height="32" rx="10" width="106" x="185" y="1077"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="183" y="1075"></rect>
<text class="terminal" x="193" y="1095">RESTRICTED</text>
<rect height="32" rx="10" width="80" x="185" y="1121"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="183" y="1119"></rect>
<text class="terminal" x="193" y="1139">DEFAULT</text>
<rect height="32" rx="10" width="96" x="45" y="1165"></rect>
<rect class="terminal" height="32" rx="10" width="96" x="43" y="1163"></rect>
<text class="terminal" x="53" y="1183">RESET_ALL</text>
<rect height="32" rx="10" width="44" x="161" y="1165"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="159" y="1163"></rect>
<text class="terminal" x="169" y="1183">ALL</text>
<rect height="32" rx="10" width="62" x="45" y="1209"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="43" y="1207"></rect>
<text class="terminal" x="53" y="1227">RESET</text><a xlink:href="/docs/v24.1/sql-grammar#session_var" xlink:title="session_var">
<rect height="32" width="96" x="127" y="1209"></rect>
<rect class="nonterminal" height="32" width="96" x="125" y="1207"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="10" class="nonterminal" x="137" y="1227">session_var</text></a><rect height="32" rx="10" width="62" x="45" y="1253"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="43" y="1251"></rect>
<text class="terminal" x="53" y="1271">ALTER</text>
<rect height="32" rx="10" width="64" x="147" y="1253"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="145" y="1251"></rect>
<text class="terminal" x="155" y="1271">SUPER</text>
<rect height="32" rx="10" width="74" x="231" y="1253"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="229" y="1251"></rect>
<text class="terminal" x="239" y="1271">REGION</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="325" y="1253"></rect>
<rect class="nonterminal" height="32" width="104" x="323" y="1251"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="335" y="1271">region_name</text></a><rect height="32" rx="10" width="72" x="449" y="1253"></rect>
<rect class="terminal" height="32" rx="10" width="72" x="447" y="1251"></rect>
<text class="terminal" x="457" y="1271">VALUES</text>
<rect height="32" width="130" x="541" y="1253"></rect>
<rect class="nonterminal" height="32" width="130" x="539" y="1251"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="106" font-size="10" class="nonterminal" x="551" y="1271">region_name_list</text><rect height="32" rx="10" width="88" x="147" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="88" x="145" y="1317"></rect>
<text class="terminal" x="155" y="1337">LOCALITY</text>
<rect height="32" rx="10" width="74" x="275" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="273" y="1317"></rect>
<text class="terminal" x="283" y="1337">GLOBAL</text>
<rect height="32" rx="10" width="92" x="275" y="1363"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="273" y="1361"></rect>
<text class="terminal" x="283" y="1381">REGIONAL</text>
<rect height="32" rx="10" width="36" x="407" y="1395"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="405" y="1393"></rect>
<text class="terminal" x="415" y="1413">IN</text><a xlink:href="/docs/v24.1/sql-grammar#region_name" xlink:title="region_name">
<rect height="32" width="104" x="463" y="1395"></rect>
<rect class="nonterminal" height="32" width="104" x="461" y="1393"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="80" font-size="11" class="nonterminal" x="473" y="1413">region_name</text></a><rect height="32" rx="10" width="102" x="627" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="625" y="1317"></rect>
<text class="terminal" x="635" y="1337">CONFIGURE</text>
<rect height="32" rx="10" width="58" x="749" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="747" y="1317"></rect>
<text class="terminal" x="757" y="1337">ZONE</text>
<rect height="32" rx="10" width="64" x="847" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="845" y="1317"></rect>
<text class="terminal" x="855" y="1337">USING</text>
<rect height="32" width="70" x="931" y="1319"></rect>
<rect class="nonterminal" height="32" width="70" x="929" y="1317"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="941" y="1337">variable</text><rect height="32" rx="10" width="30" x="1021" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="1019" y="1317"></rect>
<text class="terminal" x="1029" y="1337">=</text>
<rect height="32" rx="10" width="58" x="1091" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1089" y="1317"></rect>
<text class="terminal" x="1099" y="1337">COPY</text>
<rect height="32" rx="10" width="60" x="1169" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="1167" y="1317"></rect>
<text class="terminal" x="1177" y="1337">FROM</text>
<rect height="32" rx="10" width="74" x="1249" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1247" y="1317"></rect>
<text class="terminal" x="1257" y="1337">PARENT</text>
<rect height="32" width="54" x="1091" y="1363"></rect>
<rect class="nonterminal" height="32" width="54" x="1089" y="1361"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1101" y="1381">value</text><rect height="32" rx="10" width="24" x="1403" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1401" y="1317"></rect>
<text class="terminal" x="1411" y="1337">,</text>
<rect height="32" width="70" x="1447" y="1319"></rect>
<rect class="nonterminal" height="32" width="70" x="1445" y="1317"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="1457" y="1337">variable</text><rect height="32" rx="10" width="30" x="1537" y="1319"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="1535" y="1317"></rect>
<text class="terminal" x="1545" y="1337">=</text>
<rect height="32" width="54" x="1607" y="1319"></rect>
<rect class="nonterminal" height="32" width="54" x="1605" y="1317"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1617" y="1337">value</text><rect height="32" rx="10" width="58" x="1607" y="1363"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1605" y="1361"></rect>
<text class="terminal" x="1615" y="1381">COPY</text>
<rect height="32" rx="10" width="60" x="1685" y="1363"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="1683" y="1361"></rect>
<text class="terminal" x="1693" y="1381">FROM</text>
<rect height="32" rx="10" width="74" x="1765" y="1363"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1763" y="1361"></rect>
<text class="terminal" x="1773" y="1381">PARENT</text>
<rect height="32" rx="10" width="82" x="847" y="1429"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="845" y="1427"></rect>
<text class="terminal" x="855" y="1447">DISCARD</text>
<path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-370 66 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m156 0 h10 m0 0 h1584 m-1934 0 h20 m1914 0 h20 m-1954 0 q10 0 10 10 m1934 0 q0 -10 10 -10 m-1944 10 v46 m1934 0 v-46 m-1934 46 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m102 0 h10 m0 0 h10 m58 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m54 0 h10 m0 0 h178 m60 -44 h10 m24 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m54 0 h10 m0 0 h178 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-476 -44 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m476 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-476 0 h10 m0 0 h466 m-516 32 h20 m516 0 h20 m-556 0 q10 0 10 10 m536 0 q0 -10 10 -10 m-546 10 v58 m536 0 v-58 m-536 58 q0 10 10 10 m516 0 q10 0 10 -10 m-526 10 h10 m0 0 h506 m-1072 -78 h20 m1072 0 h20 m-1112 0 q10 0 10 10 m1092 0 q0 -10 10 -10 m-1102 10 v90 m1092 0 v-90 m-1092 90 q0 10 10 10 m1072 0 q10 0 10 -10 m-1082 10 h10 m82 0 h10 m0 0 h970 m20 -110 h602 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v134 m1934 0 v-134 m-1934 134 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m72 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m82 0 h10 m0 0 h1662 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v24 m1934 0 v-24 m-1934 24 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m84 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m76 0 h10 m0 0 h10 m58 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m124 0 h10 m0 0 h1340 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v24 m1934 0 v-24 m-1934 24 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m48 0 h10 m20 0 h10 m74 0 h10 m20 0 h10 m0 0 h202 m-232 0 h20 m212 0 h20 m-252 0 q10 0 10 10 m232 0 q0 -10 10 -10 m-242 10 v12 m232 0 v-12 m-232 12 q0 10 10 10 m212 0 q10 0 10 -10 m-222 10 h10 m34 0 h10 m0 0 h10 m48 0 h10 m0 0 h10 m70 0 h10 m20 -32 h10 m104 0 h10 m0 0 h74 m-564 0 h20 m544 0 h20 m-584 0 q10 0 10 10 m564 0 q0 -10 10 -10 m-574 10 v56 m564 0 v-56 m-564 56 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m64 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m104 0 h10 m0 0 h10 m72 0 h10 m0 0 h10 m130 0 h10 m20 -76 h1262 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v100 m1934 0 v-100 m-1934 100 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m58 0 h10 m40 0 h10 m74 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m-278 -32 h20 m278 0 h20 m-318 0 q10 0 10 10 m298 0 q0 -10 10 -10 m-308 10 v56 m298 0 v-56 m-298 56 q0 10 10 10 m278 0 q10 0 10 -10 m-288 10 h10 m64 0 h10 m0 0 h10 m74 0 h10 m0 0 h100 m20 -76 h10 m104 0 h10 m-462 0 h20 m442 0 h20 m-482 0 q10 0 10 10 m462 0 q0 -10 10 -10 m-472 10 v100 m462 0 v-100 m-462 100 q0 10 10 10 m442 0 q10 0 10 -10 m-452 10 h10 m104 0 h10 m0 0 h10 m74 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 -32 h40 m20 -120 h1354 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v176 m1934 0 v-176 m-1934 176 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m80 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m40 -32 h10 m74 0 h10 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m58 0 h10 m0 0 h16 m20 -44 h10 m78 0 h10 m0 0 h1492 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v68 m1934 0 v-68 m-1934 68 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m84 0 h10 m0 0 h10 m74 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m104 0 h10 m0 0 h1502 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v56 m1934 0 v-56 m-1934 56 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m44 0 h10 m40 0 h10 m84 0 h10 m0 0 h20 m-144 0 h20 m124 0 h20 m-164 0 q10 0 10 10 m144 0 q0 -10 10 -10 m-154 10 v24 m144 0 v-24 m-144 24 q0 10 10 10 m124 0 q10 0 10 -10 m-134 10 h10 m104 0 h10 m20 -44 h10 m74 0 h10 m20 0 h10 m0 0 h40 m-70 0 h20 m50 0 h20 m-90 0 q10 0 10 10 m70 0 q0 -10 10 -10 m-80 10 v12 m70 0 v-12 m-70 12 q0 10 10 10 m50 0 q10 0 10 -10 m-60 10 h10 m30 0 h10 m20 -32 h10 m104 0 h10 m-492 0 h20 m472 0 h20 m-512 0 q10 0 10 10 m492 0 q0 -10 10 -10 m-502 10 v112 m492 0 v-112 m-492 112 q0 10 10 10 m472 0 q10 0 10 -10 m-482 10 h10 m70 0 h10 m20 0 h10 m30 0 h10 m0 0 h8 m-78 0 h20 m58 0 h20 m-98 0 q10 0 10 10 m78 0 q0 -10 10 -10 m-88 10 v24 m78 0 v-24 m-78 24 q0 10 10 10 m58 0 q10 0 10 -10 m-68 10 h10 m38 0 h10 m40 -44 h10 m54 0 h10 m-94 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m74 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-74 0 h10 m24 0 h10 m0 0 h30 m20 44 h170 m20 -132 h1338 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v200 m1934 0 v-200 m-1934 200 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m100 0 h10 m20 0 h10 m106 0 h10 m-146 0 h20 m126 0 h20 m-166 0 q10 0 10 10 m146 0 q0 -10 10 -10 m-156 10 v24 m146 0 v-24 m-146 24 q0 10 10 10 m126 0 q10 0 10 -10 m-136 10 h10 m80 0 h10 m0 0 h26 m20 -44 h1628 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v68 m1934 0 v-68 m-1934 68 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m96 0 h10 m0 0 h10 m44 0 h10 m0 0 h1734 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v24 m1934 0 v-24 m-1934 24 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m62 0 h10 m0 0 h10 m96 0 h10 m0 0 h1716 m-1924 -10 v20 m1934 0 v-20 m-1934 20 v24 m1934 0 v-24 m-1934 24 q0 10 10 10 m1914 0 q10 0 10 -10 m-1924 10 h10 m62 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m104 0 h10 m0 0 h10 m72 0 h10 m0 0 h10 m130 0 h10 m0 0 h1248 m-1812 0 h20 m1792 0 h20 m-1832 0 q10 0 10 10 m1812 0 q0 -10 10 -10 m-1822 10 v46 m1812 0 v-46 m-1812 46 q0 10 10 10 m1792 0 q10 0 10 -10 m-1802 10 h10 m88 0 h10 m20 0 h10 m74 0 h10 m0 0 h238 m-352 0 h20 m332 0 h20 m-372 0 q10 0 10 10 m352 0 q0 -10 10 -10 m-362 10 v24 m352 0 v-24 m-352 24 q0 10 10 10 m332 0 q10 0 10 -10 m-342 10 h10 m92 0 h10 m20 0 h10 m0 0 h170 m-200 0 h20 m180 0 h20 m-220 0 q10 0 10 10 m200 0 q0 -10 10 -10 m-210 10 v12 m200 0 v-12 m-200 12 q0 10 10 10 m180 0 q10 0 10 -10 m-190 10 h10 m36 0 h10 m0 0 h10 m104 0 h10 m40 -76 h10 m102 0 h10 m0 0 h10 m58 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m54 0 h10 m0 0 h178 m60 -44 h10 m24 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m54 0 h10 m0 0 h178 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-476 -44 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m476 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-476 0 h10 m0 0 h466 m-516 32 h20 m516 0 h20 m-556 0 q10 0 10 10 m536 0 q0 -10 10 -10 m-546 10 v58 m536 0 v-58 m-536 58 q0 10 10 10 m516 0 q10 0 10 -10 m-526 10 h10 m0 0 h506 m-1072 -78 h20 m1072 0 h20 m-1112 0 q10 0 10 10 m1092 0 q0 -10 10 -10 m-1102 10 v90 m1092 0 v-90 m-1092 90 q0 10 10 10 m1072 0 q10 0 10 -10 m-1082 10 h10 m82 0 h10 m0 0 h970 m63 -1360 h-3"></path>
<polygon points="1977 83 1985 79 1985 87"></polygon>
<polygon points="1977 83 1969 79 1969 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
