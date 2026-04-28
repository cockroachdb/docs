export const AlterVirtualCluster = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="587" width="983" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="80" x="115" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="80" x="113" y="1"></rect>
<text class="terminal" x="123" y="21">VIRTUAL</text>
<rect height="32" rx="10" width="82" x="215" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="213" y="1"></rect>
<text class="terminal" x="223" y="21">CLUSTER</text>
<a xlink:title="virtual_cluster_spec" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="148" x="317" y="3"></rect>
<rect class="nonterminal" height="32" width="148" x="315" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="327" y="21">virtual_cluster_spec</text>
</a>
<rect height="32" rx="10" width="64" x="65" y="69"></rect>
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
<text class="terminal" x="471" y="175">TIME</text>
<a xlink:title="timestamp" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="88" x="537" y="157"></rect>
<rect class="nonterminal" height="32" width="88" x="535" y="155"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="547" y="175">timestamp</text>
</a>
<rect height="32" rx="10" width="70" x="369" y="201"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="367" y="199"></rect>
<text class="terminal" x="377" y="219">LATEST</text>
<rect height="32" rx="10" width="44" x="45" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="43" y="287"></rect>
<text class="terminal" x="53" y="307">SET</text>
<rect height="32" rx="10" width="114" x="109" y="289"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="107" y="287"></rect>
<text class="terminal" x="117" y="307">REPLICATION</text>
<a xlink:title="replication_options" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="142" x="263" y="289"></rect>
<rect class="nonterminal" height="32" width="142" x="261" y="287"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="10" class="nonterminal" x="273" y="307">replication_options</text>
</a>
<rect height="32" rx="10" width="24" x="263" y="245"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="261" y="243"></rect>
<text class="terminal" x="271" y="263">,</text>
<rect height="32" rx="10" width="64" x="45" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="43" y="331"></rect>
<text class="terminal" x="53" y="351">START</text>
<rect height="32" rx="10" width="114" x="149" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="147" y="331"></rect>
<text class="terminal" x="157" y="351">REPLICATION</text>
<rect height="32" rx="10" width="38" x="283" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="281" y="331"></rect>
<text class="terminal" x="291" y="351">OF</text>
<a xlink:title="virtual_cluster_spec" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="148" x="341" y="333"></rect>
<rect class="nonterminal" height="32" width="148" x="339" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="351" y="351">virtual_cluster_spec</text>
</a>
<rect height="32" rx="10" width="40" x="509" y="333"></rect>
<rect class="terminal" height="32" rx="10" width="40" x="507" y="331"></rect>
<text class="terminal" x="517" y="351">ON</text>
<a xlink:title="physical_cluster" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="122" x="569" y="333"></rect>
<rect class="nonterminal" height="32" width="122" x="567" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="98" font-size="10" class="nonterminal" x="579" y="351">physical_cluster</text>
</a>
<a xlink:title="opt_with_replication_options" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="204" x="711" y="333"></rect>
<rect class="nonterminal" height="32" width="204" x="709" y="331"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="180" font-size="10" class="nonterminal" x="721" y="351">opt_with_replication_options</text>
</a>
<rect height="32" rx="10" width="78" x="149" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="147" y="375"></rect>
<text class="terminal" x="157" y="395">SERVICE</text>
<rect height="32" rx="10" width="76" x="247" y="377"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="245" y="375"></rect>
<text class="terminal" x="255" y="395">SHARED</text>
<rect height="32" rx="10" width="66" x="65" y="421"></rect>
<rect class="terminal" height="32" rx="10" width="66" x="63" y="419"></rect>
<text class="terminal" x="73" y="439">GRANT</text>
<rect height="32" rx="10" width="74" x="65" y="465"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="63" y="463"></rect>
<text class="terminal" x="73" y="483">REVOKE</text>
<rect height="32" rx="10" width="44" x="179" y="421"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="177" y="419"></rect>
<text class="terminal" x="187" y="439">ALL</text>
<rect height="32" rx="10" width="118" x="243" y="421"></rect>
<rect class="terminal" height="32" rx="10" width="118" x="241" y="419"></rect>
<text class="terminal" x="251" y="439">CAPABILITIES</text>
<rect height="32" rx="10" width="76" x="45" y="509"></rect>
<rect class="terminal" height="32" rx="10" width="76" x="43" y="507"></rect>
<text class="terminal" x="53" y="527">RENAME</text>
<rect height="32" rx="10" width="38" x="141" y="509"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="139" y="507"></rect>
<text class="terminal" x="149" y="527">TO</text>
<a xlink:title="virtual_cluster_spec" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect height="32" width="148" x="199" y="509"></rect>
<rect class="nonterminal" height="32" width="148" x="197" y="507"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="124" font-size="10" class="nonterminal" x="209" y="527">virtual_cluster_spec</text>
</a>
<rect height="32" rx="10" width="56" x="45" y="553"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="43" y="551"></rect>
<text class="terminal" x="53" y="571">STOP</text>
<rect height="32" rx="10" width="78" x="121" y="553"></rect>
<rect class="terminal" height="32" rx="10" width="78" x="119" y="551"></rect>
<text class="terminal" x="129" y="571">SERVICE</text>
<path class="line" d="m19 17 h2 m0 0 h10 m62 0 h10 m0 0 h10 m80 0 h10 m0 0 h10 m82 0 h10 m0 0 h10 m148 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-484 66 l2 0 m2 0 l2 0 m2 0 l2 0 m42 0 h10 m64 0 h10 m0 0 h12 m-116 0 h20 m96 0 h20 m-136 0 q10 0 10 10 m116 0 q0 -10 10 -10 m-126 10 v24 m116 0 v-24 m-116 24 q0 10 10 10 m96 0 q10 0 10 -10 m-106 10 h10 m76 0 h10 m20 -44 h10 m114 0 h10 m0 0 h640 m-930 0 h20 m910 0 h20 m-950 0 q10 0 10 10 m930 0 q0 -10 10 -10 m-940 10 v68 m930 0 v-68 m-930 68 q0 10 10 10 m910 0 q10 0 10 -10 m-920 10 h10 m92 0 h10 m0 0 h10 m114 0 h10 m0 0 h10 m38 0 h10 m20 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m88 0 h10 m-296 0 h20 m276 0 h20 m-316 0 q10 0 10 10 m296 0 q0 -10 10 -10 m-306 10 v24 m296 0 v-24 m-296 24 q0 10 10 10 m276 0 q10 0 10 -10 m-286 10 h10 m70 0 h10 m0 0 h186 m20 -44 h290 m-920 -10 v20 m930 0 v-20 m-930 20 v112 m930 0 v-112 m-930 112 q0 10 10 10 m910 0 q10 0 10 -10 m-920 10 h10 m44 0 h10 m0 0 h10 m114 0 h10 m20 0 h10 m142 0 h10 m-182 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m162 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-162 0 h10 m24 0 h10 m0 0 h118 m20 44 h510 m-920 -10 v20 m930 0 v-20 m-930 20 v24 m930 0 v-24 m-930 24 q0 10 10 10 m910 0 q10 0 10 -10 m-920 10 h10 m64 0 h10 m20 0 h10 m114 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m148 0 h10 m0 0 h10 m40 0 h10 m0 0 h10 m122 0 h10 m0 0 h10 m204 0 h10 m-806 0 h20 m786 0 h20 m-826 0 q10 0 10 10 m806 0 q0 -10 10 -10 m-816 10 v24 m806 0 v-24 m-806 24 q0 10 10 10 m786 0 q10 0 10 -10 m-796 10 h10 m78 0 h10 m0 0 h10 m76 0 h10 m0 0 h592 m-900 -54 v20 m930 0 v-20 m-930 20 v68 m930 0 v-68 m-930 68 q0 10 10 10 m910 0 q10 0 10 -10 m-900 10 h10 m66 0 h10 m0 0 h8 m-114 0 h20 m94 0 h20 m-134 0 q10 0 10 10 m114 0 q0 -10 10 -10 m-124 10 v24 m114 0 v-24 m-114 24 q0 10 10 10 m94 0 q10 0 10 -10 m-104 10 h10 m74 0 h10 m20 -44 h10 m44 0 h10 m0 0 h10 m118 0 h10 m0 0 h574 m-920 -10 v20 m930 0 v-20 m-930 20 v68 m930 0 v-68 m-930 68 q0 10 10 10 m910 0 q10 0 10 -10 m-920 10 h10 m76 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m148 0 h10 m0 0 h588 m-920 -10 v20 m930 0 v-20 m-930 20 v24 m930 0 v-24 m-930 24 q0 10 10 10 m910 0 q10 0 10 -10 m-920 10 h10 m56 0 h10 m0 0 h10 m78 0 h10 m0 0 h736 m23 -484 h-3"></path>
<polygon points="973 83 981 79 981 87"></polygon>
<polygon points="973 83 965 79 965 87"></polygon>
</svg>`,
        }}
      />
    </Frame>
  );
};
