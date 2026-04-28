export const AlterIndex2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1167" width="1751" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">INDEX</text><a xlink:href="/docs/v23.2/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="65" y="145"></rect>
<rect class="nonterminal" height="32" width="96" x="63" y="143"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="75" y="163">table_name</text></a><rect height="32" rx="10" width="32" x="181" y="145"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="179" y="143"></rect>
<text class="terminal" x="189" y="163">@</text><a xlink:href="/docs/v23.2/sql-grammar#index_name" xlink:title="index_name">
<rect height="32" width="98" x="253" y="113"></rect>
<rect class="nonterminal" height="32" width="98" x="251" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="263" y="131">index_name</text></a><rect height="32" rx="10" width="98" x="411" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="409" y="111"></rect>
<text class="terminal" x="419" y="131">PARTITION</text>
<rect height="32" rx="10" width="38" x="529" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="527" y="111"></rect>
<text class="terminal" x="537" y="131">BY</text>
<rect height="32" rx="10" width="52" x="627" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="625" y="111"></rect>
<text class="terminal" x="635" y="131">LIST</text>
<rect height="32" rx="10" width="26" x="699" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="697" y="111"></rect>
<text class="terminal" x="707" y="131">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="745" y="113"></rect>
<rect class="nonterminal" height="32" width="82" x="743" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="755" y="131">name_list</text></a><rect height="32" rx="10" width="26" x="847" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="845" y="111"></rect>
<text class="terminal" x="855" y="131">)</text>
<rect height="32" rx="10" width="26" x="893" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="891" y="111"></rect>
<text class="terminal" x="901" y="131">(</text><a xlink:href="/docs/v23.2/sql-grammar#list_partitions" xlink:title="list_partitions">
<rect height="32" width="106" x="939" y="113"></rect>
<rect class="nonterminal" height="32" width="106" x="937" y="111"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="949" y="131">list_partitions</text></a><rect height="32" rx="10" width="66" x="627" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="625" y="155"></rect>
<text class="terminal" x="635" y="175">RANGE</text>
<rect height="32" rx="10" width="26" x="713" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="711" y="155"></rect>
<text class="terminal" x="721" y="175">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="759" y="157"></rect>
<rect class="nonterminal" height="32" width="82" x="757" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="769" y="175">name_list</text></a><rect height="32" rx="10" width="26" x="861" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="859" y="155"></rect>
<text class="terminal" x="869" y="175">)</text>
<rect height="32" rx="10" width="26" x="907" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="905" y="155"></rect>
<text class="terminal" x="915" y="175">(</text><a xlink:href="/docs/v23.2/sql-grammar#range_partitions" xlink:title="range_partitions">
<rect height="32" width="126" x="953" y="157"></rect>
<rect class="nonterminal" height="32" width="126" x="951" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="963" y="175">range_partitions</text></a><rect height="32" rx="10" width="26" x="1119" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1117" y="111"></rect>
<text class="terminal" x="1127" y="131">)</text>
<rect height="32" rx="10" width="86" x="607" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="605" y="199"></rect>
<text class="terminal" x="615" y="219">NOTHING</text>
<rect height="32" rx="10" width="24" x="411" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="409" y="67"></rect>
<text class="terminal" x="419" y="87">,</text>
<rect height="32" rx="10" width="60" x="391" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="389" y="243"></rect>
<text class="terminal" x="399" y="263">SPLIT</text>
<rect height="32" rx="10" width="38" x="471" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="469" y="243"></rect>
<text class="terminal" x="479" y="263">AT</text><a xlink:href="/docs/v23.2/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="529" y="245"></rect>
<rect class="nonterminal" height="32" width="94" x="527" y="243"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="539" y="263">select_stmt</text></a><rect height="32" rx="10" width="58" x="663" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="661" y="275"></rect>
<text class="terminal" x="671" y="295">WITH</text>
<rect height="32" rx="10" width="106" x="741" y="277"></rect>
<rect class="terminal" height="32" rx="10" width="106" x="739" y="275"></rect>
<text class="terminal" x="749" y="295">EXPIRATION</text><a xlink:href="/docs/v23.2/sql-grammar#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="867" y="277"></rect>
<rect class="nonterminal" height="32" width="64" x="865" y="275"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="877" y="295">a_expr</text></a><rect height="32" rx="10" width="80" x="391" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="389" y="319"></rect>
<text class="terminal" x="399" y="339">UNSPLIT</text>
<rect height="32" rx="10" width="38" x="511" y="321"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="509" y="319"></rect>
<text class="terminal" x="519" y="339">AT</text><a xlink:href="/docs/v23.2/sql-grammar#select_stmt" xlink:title="select_stmt">
<rect height="32" width="94" x="569" y="321"></rect>
<rect class="nonterminal" height="32" width="94" x="567" y="319"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="70" font-size="10" class="nonterminal" x="579" y="339">select_stmt</text></a><rect height="32" rx="10" width="44" x="511" y="365"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="509" y="363"></rect>
<text class="terminal" x="519" y="383">ALL</text>
<rect height="32" rx="10" width="76" x="391" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="389" y="407"></rect>
<text class="terminal" x="399" y="427">RENAME</text>
<rect height="32" rx="10" width="38" x="487" y="409"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="485" y="407"></rect>
<text class="terminal" x="495" y="427">TO</text>
<rect height="32" width="132" x="545" y="409"></rect>
<rect class="nonterminal" height="32" width="132" x="543" y="407"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="12" class="nonterminal" x="555" y="427">index_new_name</text><rect height="32" rx="10" width="102" x="391" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="102" x="389" y="473"></rect>
<text class="terminal" x="399" y="493">CONFIGURE</text>
<rect height="32" rx="10" width="58" x="513" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="511" y="473"></rect>
<text class="terminal" x="521" y="493">ZONE</text>
<rect height="32" rx="10" width="64" x="611" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="609" y="473"></rect>
<text class="terminal" x="619" y="493">USING</text>
<rect height="32" width="70" x="695" y="475"></rect>
<rect class="nonterminal" height="32" width="70" x="693" y="473"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="705" y="493">variable</text><rect height="32" rx="10" width="30" x="785" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="783" y="473"></rect>
<text class="terminal" x="793" y="493">=</text>
<rect height="32" rx="10" width="58" x="855" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="853" y="473"></rect>
<text class="terminal" x="863" y="493">COPY</text>
<rect height="32" rx="10" width="60" x="933" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="931" y="473"></rect>
<text class="terminal" x="941" y="493">FROM</text>
<rect height="32" rx="10" width="74" x="1013" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1011" y="473"></rect>
<text class="terminal" x="1021" y="493">PARENT</text>
<rect height="32" width="54" x="855" y="519"></rect>
<rect class="nonterminal" height="32" width="54" x="853" y="517"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="865" y="537">value</text><rect height="32" rx="10" width="24" x="1167" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="1165" y="473"></rect>
<text class="terminal" x="1175" y="493">,</text>
<rect height="32" width="70" x="1211" y="475"></rect>
<rect class="nonterminal" height="32" width="70" x="1209" y="473"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="46" font-size="10" class="nonterminal" x="1221" y="493">variable</text><rect height="32" rx="10" width="30" x="1301" y="475"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="1299" y="473"></rect>
<text class="terminal" x="1309" y="493">=</text>
<rect height="32" width="54" x="1371" y="475"></rect>
<rect class="nonterminal" height="32" width="54" x="1369" y="473"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="30" font-size="10" class="nonterminal" x="1381" y="493">value</text><rect height="32" rx="10" width="58" x="1371" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="1369" y="517"></rect>
<text class="terminal" x="1379" y="537">COPY</text>
<rect height="32" rx="10" width="60" x="1449" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="1447" y="517"></rect>
<text class="terminal" x="1457" y="537">FROM</text>
<rect height="32" rx="10" width="74" x="1529" y="519"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="1527" y="517"></rect>
<text class="terminal" x="1537" y="537">PARENT</text>
<rect height="32" rx="10" width="82" x="611" y="585"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="609" y="583"></rect>
<text class="terminal" x="619" y="603">DISCARD</text>
<rect height="32" rx="10" width="48" x="411" y="661"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="409" y="659"></rect>
<text class="terminal" x="419" y="679">NOT</text>
<rect height="32" rx="10" width="76" x="499" y="629"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="497" y="627"></rect>
<text class="terminal" x="507" y="647">VISIBLE</text>
<rect height="32" rx="10" width="92" x="391" y="705"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="389" y="703"></rect>
<text class="terminal" x="399" y="723">INVISIBLE</text>
<rect height="32" rx="10" width="98" x="391" y="749"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="389" y="747"></rect>
<text class="terminal" x="399" y="767">VISIBILITY</text>
<rect height="32" rx="10" width="74" x="509" y="749"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="507" y="747"></rect>
<text class="terminal" x="517" y="767">FCONST</text>
<rect height="32" rx="10" width="34" x="45" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="34" x="43" y="835"></rect>
<text class="terminal" x="53" y="855">IF</text>
<rect height="32" rx="10" width="70" x="99" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="97" y="835"></rect>
<text class="terminal" x="107" y="855">EXISTS</text><a xlink:href="/docs/v23.2/sql-grammar#table_name" xlink:title="table_name">
<rect height="32" width="96" x="209" y="869"></rect>
<rect class="nonterminal" height="32" width="96" x="207" y="867"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="72" font-size="11" class="nonterminal" x="219" y="887">table_name</text></a><rect height="32" rx="10" width="32" x="325" y="869"></rect>
<rect class="terminal" height="32" rx="10" width="32" x="323" y="867"></rect>
<text class="terminal" x="333" y="887">@</text><a xlink:href="/docs/v23.2/sql-grammar#index_name" xlink:title="index_name">
<rect height="32" width="98" x="397" y="837"></rect>
<rect class="nonterminal" height="32" width="98" x="395" y="835"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="11" class="nonterminal" x="407" y="855">index_name</text></a><rect height="32" rx="10" width="98" x="555" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="553" y="835"></rect>
<text class="terminal" x="563" y="855">PARTITION</text>
<rect height="32" rx="10" width="38" x="673" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="671" y="835"></rect>
<text class="terminal" x="681" y="855">BY</text>
<rect height="32" rx="10" width="52" x="771" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="769" y="835"></rect>
<text class="terminal" x="779" y="855">LIST</text>
<rect height="32" rx="10" width="26" x="843" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="841" y="835"></rect>
<text class="terminal" x="851" y="855">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="889" y="837"></rect>
<rect class="nonterminal" height="32" width="82" x="887" y="835"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="899" y="855">name_list</text></a><rect height="32" rx="10" width="26" x="991" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="989" y="835"></rect>
<text class="terminal" x="999" y="855">)</text>
<rect height="32" rx="10" width="26" x="1037" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1035" y="835"></rect>
<text class="terminal" x="1045" y="855">(</text><a xlink:href="/docs/v23.2/sql-grammar#list_partitions" xlink:title="list_partitions">
<rect height="32" width="106" x="1083" y="837"></rect>
<rect class="nonterminal" height="32" width="106" x="1081" y="835"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="1093" y="855">list_partitions</text></a><rect height="32" rx="10" width="66" x="771" y="881"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="769" y="879"></rect>
<text class="terminal" x="779" y="899">RANGE</text>
<rect height="32" rx="10" width="26" x="857" y="881"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="855" y="879"></rect>
<text class="terminal" x="865" y="899">(</text><a xlink:href="/docs/v23.2/sql-grammar#name_list" xlink:title="name_list">
<rect height="32" width="82" x="903" y="881"></rect>
<rect class="nonterminal" height="32" width="82" x="901" y="879"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="58" font-size="10" class="nonterminal" x="913" y="899">name_list</text></a><rect height="32" rx="10" width="26" x="1005" y="881"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1003" y="879"></rect>
<text class="terminal" x="1013" y="899">)</text>
<rect height="32" rx="10" width="26" x="1051" y="881"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1049" y="879"></rect>
<text class="terminal" x="1059" y="899">(</text><a xlink:href="/docs/v23.2/sql-grammar#range_partitions" xlink:title="range_partitions">
<rect height="32" width="126" x="1097" y="881"></rect>
<rect class="nonterminal" height="32" width="126" x="1095" y="879"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="102" font-size="10" class="nonterminal" x="1107" y="899">range_partitions</text></a><rect height="32" rx="10" width="26" x="1263" y="837"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="1261" y="835"></rect>
<text class="terminal" x="1271" y="855">)</text>
<rect height="32" rx="10" width="86" x="751" y="925"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="749" y="923"></rect>
<text class="terminal" x="759" y="943">NOTHING</text>
<rect height="32" rx="10" width="24" x="555" y="793"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="553" y="791"></rect>
<text class="terminal" x="563" y="811">,</text>
<rect height="32" rx="10" width="76" x="535" y="969"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="533" y="967"></rect>
<text class="terminal" x="543" y="987">RENAME</text>
<rect height="32" rx="10" width="38" x="631" y="969"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="629" y="967"></rect>
<text class="terminal" x="639" y="987">TO</text>
<rect height="32" width="132" x="689" y="969"></rect>
<rect class="nonterminal" height="32" width="132" x="687" y="967"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="108" font-size="12" class="nonterminal" x="699" y="987">index_new_name</text><rect height="32" rx="10" width="48" x="555" y="1045"></rect>
<rect class="terminal" height="32" rx="10" width="48" x="553" y="1043"></rect>
<text class="terminal" x="563" y="1063">NOT</text>
<rect height="32" rx="10" width="76" x="643" y="1013"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="641" y="1011"></rect>
<text class="terminal" x="651" y="1031">VISIBLE</text>
<rect height="32" rx="10" width="92" x="535" y="1089"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="533" y="1087"></rect>
<text class="terminal" x="543" y="1107">INVISIBLE</text>
<rect height="32" rx="10" width="98" x="535" y="1133"></rect>
<rect class="terminal" height="32" rx="10" width="98" x="533" y="1131"></rect>
<text class="terminal" x="543" y="1151">VISIBILITY</text>
<rect height="32" rx="10" width="74" x="653" y="1133"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="651" y="1131"></rect>
<text class="terminal" x="661" y="1151">FCONST</text>
<path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m64 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-198 110 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m0 0 h158 m-188 0 h20 m168 0 h20 m-208 0 q10 0 10 10 m188 0 q0 -10 10 -10 m-198 10 v12 m188 0 v-12 m-188 12 q0 10 10 10 m168 0 q10 0 10 -10 m-178 10 h10 m96 0 h10 m0 0 h10 m32 0 h10 m20 -32 h10 m98 0 h10 m40 0 h10 m98 0 h10 m0 0 h10 m38 0 h10 m40 0 h10 m52 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m106 0 h10 m0 0 h34 m-492 0 h20 m472 0 h20 m-512 0 q10 0 10 10 m492 0 q0 -10 10 -10 m-502 10 v24 m492 0 v-24 m-492 24 q0 10 10 10 m472 0 q10 0 10 -10 m-482 10 h10 m66 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m126 0 h10 m20 -44 h10 m26 0 h10 m-578 0 h20 m558 0 h20 m-598 0 q10 0 10 10 m578 0 q0 -10 10 -10 m-588 10 v68 m578 0 v-68 m-578 68 q0 10 10 10 m558 0 q10 0 10 -10 m-568 10 h10 m86 0 h10 m0 0 h452 m-774 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m774 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-774 0 h10 m24 0 h10 m0 0 h730 m20 44 h498 m-1332 0 h20 m1312 0 h20 m-1352 0 q10 0 10 10 m1332 0 q0 -10 10 -10 m-1342 10 v112 m1332 0 v-112 m-1332 112 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m60 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m20 0 h10 m0 0 h278 m-308 0 h20 m288 0 h20 m-328 0 q10 0 10 10 m308 0 q0 -10 10 -10 m-318 10 v12 m308 0 v-12 m-308 12 q0 10 10 10 m288 0 q10 0 10 -10 m-298 10 h10 m58 0 h10 m0 0 h10 m106 0 h10 m0 0 h10 m64 0 h10 m20 -32 h732 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v56 m1332 0 v-56 m-1332 56 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m80 0 h10 m20 0 h10 m38 0 h10 m0 0 h10 m94 0 h10 m-192 0 h20 m172 0 h20 m-212 0 q10 0 10 10 m192 0 q0 -10 10 -10 m-202 10 v24 m192 0 v-24 m-192 24 q0 10 10 10 m172 0 q10 0 10 -10 m-182 10 h10 m44 0 h10 m0 0 h108 m20 -44 h1000 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v68 m1332 0 v-68 m-1332 68 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m132 0 h10 m0 0 h1006 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v46 m1332 0 v-46 m-1332 46 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m102 0 h10 m0 0 h10 m58 0 h10 m20 0 h10 m64 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m54 0 h10 m0 0 h178 m60 -44 h10 m24 0 h10 m0 0 h10 m70 0 h10 m0 0 h10 m30 0 h10 m20 0 h10 m54 0 h10 m0 0 h178 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m58 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m74 0 h10 m-476 -44 l20 0 m-1 0 q-9 0 -9 -10 l0 -12 q0 -10 10 -10 m476 32 l20 0 m-20 0 q10 0 10 -10 l0 -12 q0 -10 -10 -10 m-476 0 h10 m0 0 h466 m-516 32 h20 m516 0 h20 m-556 0 q10 0 10 10 m536 0 q0 -10 10 -10 m-546 10 v58 m536 0 v-58 m-536 58 q0 10 10 10 m516 0 q10 0 10 -10 m-526 10 h10 m0 0 h506 m-1072 -78 h20 m1072 0 h20 m-1112 0 q10 0 10 10 m1092 0 q0 -10 10 -10 m-1102 10 v90 m1092 0 v-90 m-1092 90 q0 10 10 10 m1072 0 q10 0 10 -10 m-1082 10 h10 m82 0 h10 m0 0 h970 m-1302 -120 v20 m1332 0 v-20 m-1332 20 v134 m1332 0 v-134 m-1332 134 q0 10 10 10 m1312 0 q10 0 10 -10 m-1302 10 h10 m0 0 h58 m-88 0 h20 m68 0 h20 m-108 0 q10 0 10 10 m88 0 q0 -10 10 -10 m-98 10 v12 m88 0 v-12 m-88 12 q0 10 10 10 m68 0 q10 0 10 -10 m-78 10 h10 m48 0 h10 m20 -32 h10 m76 0 h10 m0 0 h1108 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v56 m1332 0 v-56 m-1332 56 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m92 0 h10 m0 0 h1200 m-1322 -10 v20 m1332 0 v-20 m-1332 20 v24 m1332 0 v-24 m-1332 24 q0 10 10 10 m1312 0 q10 0 10 -10 m-1322 10 h10 m98 0 h10 m0 0 h10 m74 0 h10 m0 0 h1100 m-1678 -636 h20 m1678 0 h20 m-1718 0 q10 0 10 10 m1698 0 q0 -10 10 -10 m-1708 10 v704 m1698 0 v-704 m-1698 704 q0 10 10 10 m1678 0 q10 0 10 -10 m-1688 10 h10 m34 0 h10 m0 0 h10 m70 0 h10 m20 0 h10 m0 0 h158 m-188 0 h20 m168 0 h20 m-208 0 q10 0 10 10 m188 0 q0 -10 10 -10 m-198 10 v12 m188 0 v-12 m-188 12 q0 10 10 10 m168 0 q10 0 10 -10 m-178 10 h10 m96 0 h10 m0 0 h10 m32 0 h10 m20 -32 h10 m98 0 h10 m40 0 h10 m98 0 h10 m0 0 h10 m38 0 h10 m40 0 h10 m52 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m106 0 h10 m0 0 h34 m-492 0 h20 m472 0 h20 m-512 0 q10 0 10 10 m492 0 q0 -10 10 -10 m-502 10 v24 m492 0 v-24 m-492 24 q0 10 10 10 m472 0 q10 0 10 -10 m-482 10 h10 m66 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m26 0 h10 m0 0 h10 m126 0 h10 m20 -44 h10 m26 0 h10 m-578 0 h20 m558 0 h20 m-598 0 q10 0 10 10 m578 0 q0 -10 10 -10 m-588 10 v68 m578 0 v-68 m-578 68 q0 10 10 10 m558 0 q10 0 10 -10 m-568 10 h10 m86 0 h10 m0 0 h452 m-774 -88 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m774 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-774 0 h10 m24 0 h10 m0 0 h730 m-814 44 h20 m814 0 h20 m-854 0 q10 0 10 10 m834 0 q0 -10 10 -10 m-844 10 v112 m834 0 v-112 m-834 112 q0 10 10 10 m814 0 q10 0 10 -10 m-824 10 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m132 0 h10 m0 0 h508 m-824 -10 v20 m834 0 v-20 m-834 20 v24 m834 0 v-24 m-834 24 q0 10 10 10 m814 0 q10 0 10 -10 m-804 10 h10 m0 0 h58 m-88 0 h20 m68 0 h20 m-108 0 q10 0 10 10 m88 0 q0 -10 10 -10 m-98 10 v12 m88 0 v-12 m-88 12 q0 10 10 10 m68 0 q10 0 10 -10 m-78 10 h10 m48 0 h10 m20 -32 h10 m76 0 h10 m0 0 h610 m-824 -10 v20 m834 0 v-20 m-834 20 v56 m834 0 v-56 m-834 56 q0 10 10 10 m814 0 q10 0 10 -10 m-824 10 h10 m92 0 h10 m0 0 h702 m-824 -10 v20 m834 0 v-20 m-834 20 v24 m834 0 v-24 m-834 24 q0 10 10 10 m814 0 q10 0 10 -10 m-824 10 h10 m98 0 h10 m0 0 h10 m74 0 h10 m0 0 h602 m20 -296 h354 m23 -724 h-3"></path>
<polygon points="1741 127 1749 123 1749 131"></polygon>
<polygon points="1741 127 1733 123 1733 131"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
