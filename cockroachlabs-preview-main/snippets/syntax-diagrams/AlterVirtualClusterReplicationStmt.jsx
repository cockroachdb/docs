export const AlterVirtualClusterReplicationStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="367" width="801" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<text class="terminal" x="41" y="21">ALTER</text><a xlink:href="#virtual_cluster" xlink:title="virtual_cluster">
<rect height="32" width="110" x="115" y="3"></rect>
<rect class="nonterminal" height="32" width="110" x="113" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="86" font-size="10" class="nonterminal" x="125" y="21">virtual_cluster</text></a><a xlink:href="#virtual_cluster_spec" xlink:title="virtual_cluster_spec">
<rect height="32" width="148" x="245" y="3"></rect>
<rect class="nonterminal" height="32" width="148" x="243" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="255" y="21">virtual_cluster_spec</text></a><rect height="32" rx="10" width="64" x="65" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="63" y="67"></rect>
<text class="terminal" x="73" y="87">PAUSE</text>
<rect height="32" rx="10" width="76" x="65" y="113"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="63" y="111"></rect>
<text class="terminal" x="73" y="131">RESUME</text>
<rect height="32" rx="10" width="114" x="181" y="69"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="179" y="67"></rect>
<text class="terminal" x="189" y="87">REPLICATION</text>
<rect height="32" rx="10" width="92" x="45" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="43" y="155"></rect>
<text class="terminal" x="53" y="175">COMPLETE</text>
<rect height="32" rx="10" width="114" x="157" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="155" y="155"></rect>
<text class="terminal" x="165" y="175">REPLICATION</text>
<rect height="32" rx="10" width="38" x="291" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="289" y="155"></rect>
<text class="terminal" x="299" y="175">TO</text>
<rect height="32" rx="10" width="74" x="369" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="367" y="155"></rect>
<text class="terminal" x="377" y="175">SYSTEM</text>
<rect height="32" rx="10" width="54" x="463" y="157"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="461" y="155"></rect>
<text class="terminal" x="471" y="175">TIME</text><a xlink:href="#a_expr" xlink:title="a_expr">
<rect height="32" width="64" x="537" y="157"></rect>
<rect class="nonterminal" height="32" width="64" x="535" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="547" y="175">a_expr</text></a><rect height="32" rx="10" width="70" x="369" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="367" y="199"></rect>
<text class="terminal" x="377" y="219">LATEST</text>
<rect height="32" rx="10" width="44" x="45" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="243"></rect>
<text class="terminal" x="53" y="263">SET</text>
<rect height="32" rx="10" width="114" x="109" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="107" y="243"></rect>
<text class="terminal" x="117" y="263">REPLICATION</text><a xlink:href="#replication_options_list" xlink:title="replication_options_list">
<rect height="32" width="168" x="263" y="245"></rect>
<rect class="nonterminal" height="32" width="168" x="261" y="243"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="144" font-size="10" class="nonterminal" x="273" y="263">replication_options_list</text></a><rect height="32" rx="10" width="76" x="263" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="261" y="287"></rect>
<text class="terminal" x="271" y="307">SOURCE</text><a xlink:href="#source_replication_options_list" xlink:title="source_replication_options_list">
<rect height="32" width="218" x="359" y="289"></rect>
<rect class="nonterminal" height="32" width="218" x="357" y="287"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="194" font-size="10" class="nonterminal" x="369" y="307">source_replication_options_list</text></a><rect height="32" rx="10" width="64" x="45" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="43" y="331"></rect>
<text class="terminal" x="53" y="351">START</text>
<rect height="32" rx="10" width="114" x="129" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="127" y="331"></rect>
<text class="terminal" x="137" y="351">REPLICATION</text>
<rect height="32" rx="10" width="38" x="263" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="261" y="331"></rect>
<text class="terminal" x="271" y="351">OF</text><a xlink:href="#d_expr" xlink:title="d_expr">
<rect height="32" width="64" x="321" y="333"></rect>
<rect class="nonterminal" height="32" width="64" x="319" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="331" y="351">d_expr</text></a><rect height="32" rx="10" width="40" x="405" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="403" y="331"></rect>
<text class="terminal" x="413" y="351">ON</text><a xlink:href="#d_expr" xlink:title="d_expr">
<rect height="32" width="64" x="465" y="333"></rect>
<rect class="nonterminal" height="32" width="64" x="463" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="40" font-size="10" class="nonterminal" x="475" y="351">d_expr</text></a><a xlink:href="#opt_with_replication_options" xlink:title="opt_with_replication_options">
<rect height="32" width="204" x="549" y="333"></rect>
<rect class="nonterminal" height="32" width="204" x="547" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="180" font-size="10" class="nonterminal" x="559" y="351">opt_with_replication_options</text></a><path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m110 0 h10 m0 0 h10 m148 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-412 66 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m64 0 h10 m0 0 h12 m-116 0 h20 m96 0 h20 m-136 0 q10 0 10 10 m116 0 q0 -10 10 -10 m-126 10 v24 m116 0 v-24 m-116 24 q0 10 10 10 m96 0 q10 0 10 -10 m-106 10 h10 m76 0 h10 m20 -44 h10 m114 0 h10 m0 0 h458 m-748 0 h20 m728 0 h20 m-768 0 q10 0 10 10 m748 0 q0 -10 10 -10 m-758 10 v68 m748 0 v-68 m-748 68 q0 10 10 10 m728 0 q10 0 10 -10 m-738 10 h10 m92 0 h10 m0 0 h10 m114 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m64 0 h10 m-272 0 h20 m252 0 h20 m-292 0 q10 0 10 10 m272 0 q0 -10 10 -10 m-282 10 v24 m272 0 v-24 m-272 24 q0 10 10 10 m252 0 q10 0 10 -10 m-262 10 h10 m70 0 h10 m0 0 h162 m20 -44 h132 m-738 -10 v20 m748 0 v-20 m-748 20 v68 m748 0 v-68 m-748 68 q0 10 10 10 m728 0 q10 0 10 -10 m-738 10 h10 m44 0 h10 m0 0 h10 m114 0 h10 m20 0 h10 m168 0 h10 m0 0 h146 m-354 0 h20 m334 0 h20 m-374 0 q10 0 10 10 m354 0 q0 -10 10 -10 m-364 10 v24 m354 0 v-24 m-354 24 q0 10 10 10 m334 0 q10 0 10 -10 m-344 10 h10 m76 0 h10 m0 0 h10 m218 0 h10 m20 -44 h156 m-738 -10 v20 m748 0 v-20 m-748 20 v68 m748 0 v-68 m-748 68 q0 10 10 10 m728 0 q10 0 10 -10 m-738 10 h10 m64 0 h10 m0 0 h10 m114 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m64 0 h10 m0 0 h10 m204 0 h10 m23 -264 h-3"></path>
<polygon points="791 83 799 79 799 87"></polygon>
<polygon points="791 83 783 79 783 87"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
