export const Backup6 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="635" width="567" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="11 61 3 57 3 65"></polygon>
<polygon points="19 61 11 57 11 65"></polygon>
<rect height="32" rx="10" width="74" x="33" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="31" y="45"></rect>
<text class="terminal" x="41" y="65">BACKUP</text>
<rect height="32" rx="10" width="62" x="147" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="62" x="145" y="45"></rect>
<text class="terminal" x="155" y="65">TABLE</text><a xlink:href="/docs/v25.4/sql-grammar#table_pattern" xlink:title="table_pattern">
<rect height="32" width="106" x="249" y="47"></rect>
<rect class="nonterminal" height="32" width="106" x="247" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="82" font-size="10" class="nonterminal" x="259" y="65">table_pattern</text></a><rect height="32" rx="10" width="24" x="249" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="247" y="1"></rect>
<text class="terminal" x="257" y="21">,</text>
<rect height="32" rx="10" width="92" x="147" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="145" y="133"></rect>
<text class="terminal" x="155" y="153">DATABASE</text><a xlink:href="/docs/v25.4/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="279" y="135"></rect>
<rect class="nonterminal" height="32" width="124" x="277" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="289" y="153">database_name</text></a><rect height="32" rx="10" width="24" x="279" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="277" y="89"></rect>
<text class="terminal" x="287" y="109">,</text>
<rect height="32" rx="10" width="56" x="463" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="56" x="461" y="45"></rect>
<text class="terminal" x="471" y="65">INTO</text>
<rect height="32" width="98" x="70" y="249"></rect>
<rect class="nonterminal" height="32" width="98" x="68" y="247"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="74" font-size="10" class="nonterminal" x="80" y="267">subdirectory</text><rect height="32" rx="10" width="70" x="70" y="293"></rect>
<rect class="terminal" height="32" rx="10" width="70" x="68" y="291"></rect>
<text class="terminal" x="78" y="311">LATEST</text>
<rect height="32" rx="10" width="36" x="208" y="249"></rect>
<rect class="terminal" height="32" rx="10" width="36" x="206" y="247"></rect>
<text class="terminal" x="216" y="267">IN</text>
<rect height="32" width="102" x="304" y="217"></rect>
<rect class="nonterminal" height="32" width="102" x="302" y="215"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="78" font-size="10" class="nonterminal" x="314" y="235">collectionURI</text><rect height="32" rx="10" width="26" x="304" y="305"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="302" y="303"></rect>
<text class="terminal" x="312" y="323">(</text>
<rect height="32" width="86" x="370" y="305"></rect>
<rect class="nonterminal" height="32" width="86" x="368" y="303"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="62" font-size="10" class="nonterminal" x="380" y="323">localityURI</text><rect height="32" rx="10" width="24" x="370" y="261"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="368" y="259"></rect>
<text class="terminal" x="378" y="279">,</text>
<rect height="32" rx="10" width="26" x="496" y="305"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="494" y="303"></rect>
<text class="terminal" x="504" y="323">)</text>
<rect height="32" rx="10" width="38" x="100" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="98" y="385"></rect>
<text class="terminal" x="108" y="405">AS</text>
<rect height="32" rx="10" width="38" x="158" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="38" x="156" y="385"></rect>
<text class="terminal" x="166" y="405">OF</text>
<rect height="32" rx="10" width="74" x="216" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="74" x="214" y="385"></rect>
<text class="terminal" x="224" y="405">SYSTEM</text>
<rect height="32" rx="10" width="54" x="310" y="387"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="308" y="385"></rect>
<text class="terminal" x="318" y="405">TIME</text>
<rect height="32" width="88" x="384" y="387"></rect>
<rect class="nonterminal" height="32" width="88" x="382" y="385"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="64" font-size="11" class="nonterminal" x="394" y="405">timestamp</text><rect height="32" rx="10" width="58" x="45" y="497"></rect>
<rect class="terminal" height="32" rx="10" width="58" x="43" y="495"></rect>
<text class="terminal" x="53" y="515">WITH</text><a xlink:href="/docs/v25.4/sql-grammar#backup_options" xlink:title="backup_options">
<rect height="32" width="120" x="163" y="497"></rect>
<rect class="nonterminal" height="32" width="120" x="161" y="495"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="11" class="nonterminal" x="173" y="515">backup_options</text></a><rect height="32" rx="10" width="24" x="163" y="453"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="161" y="451"></rect>
<text class="terminal" x="171" y="471">,</text>
<rect height="32" rx="10" width="84" x="143" y="585"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="141" y="583"></rect>
<text class="terminal" x="151" y="603">OPTIONS</text>
<rect height="32" rx="10" width="26" x="247" y="585"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="245" y="583"></rect>
<text class="terminal" x="255" y="603">(</text><a xlink:href="/docs/v25.4/sql-grammar#backup_options" xlink:title="backup_options">
<rect height="32" width="120" x="313" y="585"></rect>
<rect class="nonterminal" height="32" width="120" x="311" y="583"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="96" font-size="11" class="nonterminal" x="323" y="603">backup_options</text></a><rect height="32" rx="10" width="24" x="313" y="541"></rect>
<rect class="terminal" height="32" rx="10" width="24" x="311" y="539"></rect>
<text class="terminal" x="321" y="559">,</text>
<rect height="32" rx="10" width="26" x="473" y="585"></rect>
<rect class="terminal" height="32" rx="10" width="26" x="471" y="583"></rect>
<text class="terminal" x="481" y="603">)</text>
<path class="line" d="m19 61 h2 m0 0 h10 m74 0 h10 m20 0 h10 m62 0 h10 m20 0 h10 m106 0 h10 m-146 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m126 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-126 0 h10 m24 0 h10 m0 0 h82 m20 44 h48 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v68 m316 0 v-68 m-316 68 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m92 0 h10 m20 0 h10 m124 0 h10 m-164 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m144 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-144 0 h10 m24 0 h10 m0 0 h100 m-286 34 v20 m316 0 v-20 m-316 20 v14 m316 0 v-14 m-316 14 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m0 0 h286 m20 -122 h10 m56 0 h10 m2 0 l2 0 m2 0 l2 0 m2 0 l2 0 m-533 170 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h204 m-234 0 h20 m214 0 h20 m-254 0 q10 0 10 10 m234 0 q0 -10 10 -10 m-244 10 v12 m234 0 v-12 m-234 12 q0 10 10 10 m214 0 q10 0 10 -10 m-204 10 h10 m98 0 h10 m-138 0 h20 m118 0 h20 m-158 0 q10 0 10 10 m138 0 q0 -10 10 -10 m-148 10 v24 m138 0 v-24 m-138 24 q0 10 10 10 m118 0 q10 0 10 -10 m-128 10 h10 m70 0 h10 m0 0 h28 m20 -44 h10 m36 0 h10 m40 -32 h10 m102 0 h10 m0 0 h116 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v68 m258 0 v-68 m-258 68 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m26 0 h10 m20 0 h10 m86 0 h10 m-126 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m106 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-106 0 h10 m24 0 h10 m0 0 h62 m20 44 h10 m26 0 h10 m22 -88 l2 0 m2 0 l2 0 m2 0 l2 0 m-506 138 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m0 0 h382 m-412 0 h20 m392 0 h20 m-432 0 q10 0 10 10 m412 0 q0 -10 10 -10 m-422 10 v12 m412 0 v-12 m-412 12 q0 10 10 10 m392 0 q10 0 10 -10 m-402 10 h10 m38 0 h10 m0 0 h10 m38 0 h10 m0 0 h10 m74 0 h10 m0 0 h10 m54 0 h10 m0 0 h10 m88 0 h10 m22 -32 l2 0 m2 0 l2 0 m2 0 l2 0 m-511 142 l2 0 m2 0 l2 0 m2 0 l2 0 m22 0 h10 m58 0 h10 m40 0 h10 m120 0 h10 m-160 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m140 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-140 0 h10 m24 0 h10 m0 0 h96 m20 44 h196 m-396 0 h20 m376 0 h20 m-416 0 q10 0 10 10 m396 0 q0 -10 10 -10 m-406 10 v68 m396 0 v-68 m-396 68 q0 10 10 10 m376 0 q10 0 10 -10 m-386 10 h10 m84 0 h10 m0 0 h10 m26 0 h10 m20 0 h10 m120 0 h10 m-160 0 l20 0 m-1 0 q-9 0 -9 -10 l0 -24 q0 -10 10 -10 m140 44 l20 0 m-20 0 q10 0 10 -10 l0 -24 q0 -10 -10 -10 m-140 0 h10 m24 0 h10 m0 0 h96 m20 44 h10 m26 0 h10 m-494 -88 h20 m494 0 h20 m-534 0 q10 0 10 10 m514 0 q0 -10 10 -10 m-524 10 v102 m514 0 v-102 m-514 102 q0 10 10 10 m494 0 q10 0 10 -10 m-504 10 h10 m0 0 h484 m23 -122 h-3"></path>
<polygon points="557 511 565 507 565 515"></polygon>
<polygon points="557 511 549 507 549 515"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
