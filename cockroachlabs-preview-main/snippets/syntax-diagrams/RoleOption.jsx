export const RoleOption = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="1401" width="317" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="108" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="108" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">CREATEROLE</text>
<rect height="32" rx="10" width="130" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="130" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">NOCREATEROLE</text>
<rect height="32" rx="10" width="64" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">LOGIN</text>
<rect height="32" rx="10" width="86" x="51" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="86" x="49" y="133"></rect>
<text class="terminal" x="59" y="153">NOLOGIN</text>
<rect height="32" rx="10" width="114" x="51" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="49" y="177"></rect>
<text class="terminal" x="59" y="197">CONTROLJOB</text>
<rect height="32" rx="10" width="134" x="51" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="134" x="49" y="221"></rect>
<text class="terminal" x="59" y="241">NOCONTROLJOB</text>
<rect height="32" rx="10" width="176" x="51" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="176" x="49" y="265"></rect>
<text class="terminal" x="59" y="285">CONTROLCHANGEFEED</text>
<rect height="32" rx="10" width="198" x="51" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="198" x="49" y="309"></rect>
<text class="terminal" x="59" y="329">NOCONTROLCHANGEFEED</text>
<rect height="32" rx="10" width="90" x="51" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="90" x="49" y="353"></rect>
<text class="terminal" x="59" y="373">CREATEDB</text>
<rect height="32" rx="10" width="112" x="51" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="112" x="49" y="397"></rect>
<text class="terminal" x="59" y="417">NOCREATEDB</text>
<rect height="32" rx="10" width="118" x="51" y="443"></rect>
<rect class="terminal" height="32" rx="10" width="118" x="49" y="441"></rect>
<text class="terminal" x="59" y="461">CREATELOGIN</text>
<rect height="32" rx="10" width="138" x="51" y="487"></rect>
<rect class="terminal" height="32" rx="10" width="138" x="49" y="485"></rect>
<text class="terminal" x="59" y="505">NOCREATELOGIN</text>
<rect height="32" rx="10" width="122" x="51" y="531"></rect>
<rect class="terminal" height="32" rx="10" width="122" x="49" y="529"></rect>
<text class="terminal" x="59" y="549">VIEWACTIVITY</text>
<rect height="32" rx="10" width="144" x="51" y="575"></rect>
<rect class="terminal" height="32" rx="10" width="144" x="49" y="573"></rect>
<text class="terminal" x="59" y="593">NOVIEWACTIVITY</text>
<rect height="32" rx="10" width="196" x="51" y="619"></rect>
<rect class="terminal" height="32" rx="10" width="196" x="49" y="617"></rect>
<text class="terminal" x="59" y="637">VIEWACTIVITYREDACTED</text>
<rect height="32" rx="10" width="216" x="51" y="663"></rect>
<rect class="terminal" height="32" rx="10" width="216" x="49" y="661"></rect>
<text class="terminal" x="59" y="681">NOVIEWACTIVITYREDACTED</text>
<rect height="32" rx="10" width="120" x="51" y="707"></rect>
<rect class="terminal" height="32" rx="10" width="120" x="49" y="705"></rect>
<text class="terminal" x="59" y="725">CANCELQUERY</text>
<rect height="32" rx="10" width="142" x="51" y="751"></rect>
<rect class="terminal" height="32" rx="10" width="142" x="49" y="749"></rect>
<text class="terminal" x="59" y="769">NOCANCELQUERY</text>
<rect height="32" rx="10" width="196" x="51" y="795"></rect>
<rect class="terminal" height="32" rx="10" width="196" x="49" y="793"></rect>
<text class="terminal" x="59" y="813">MODIFYCLUSTERSETTING</text>
<rect height="32" rx="10" width="218" x="51" y="839"></rect>
<rect class="terminal" height="32" rx="10" width="218" x="49" y="837"></rect>
<text class="terminal" x="59" y="857">NOMODIFYCLUSTERSETTING</text>
<rect height="32" rx="10" width="92" x="51" y="883"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="49" y="881"></rect>
<text class="terminal" x="59" y="901">SQLLOGIN</text>
<rect height="32" rx="10" width="114" x="51" y="927"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="49" y="925"></rect>
<text class="terminal" x="59" y="945">NOSQLLOGIN</text>
<rect height="32" rx="10" width="178" x="51" y="971"></rect>
<rect class="terminal" height="32" rx="10" width="178" x="49" y="969"></rect>
<text class="terminal" x="59" y="989">VIEWCLUSTERSETTING</text>
<rect height="32" rx="10" width="200" x="51" y="1015"></rect>
<rect class="terminal" height="32" rx="10" width="200" x="49" y="1013"></rect>
<text class="terminal" x="59" y="1033">NOVIEWCLUSTERSETTING</text><a xlink:href="#password_clause" xlink:title="password_clause">
<rect height="32" width="128" x="51" y="1059"></rect>
<rect class="nonterminal" height="32" width="128" x="49" y="1057"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="11" class="nonterminal" x="61" y="1077">password_clause</text></a><a xlink:href="#valid_until_clause" xlink:title="valid_until_clause">
<rect height="32" width="134" x="51" y="1103"></rect>
<rect class="nonterminal" height="32" width="134" x="49" y="1101"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="110" font-size="10" class="nonterminal" x="61" y="1121">valid_until_clause</text></a><a xlink:href="#subject_clause" xlink:title="subject_clause">
<rect height="32" width="114" x="51" y="1147"></rect>
<rect class="nonterminal" height="32" width="114" x="49" y="1145"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="90" font-size="10" class="nonterminal" x="61" y="1165">subject_clause</text></a><a xlink:href="#provisionsrc_clause" xlink:title="provisionsrc_clause">
<rect height="32" width="144" x="51" y="1191"></rect>
<rect class="nonterminal" height="32" width="144" x="49" y="1189"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="120" font-size="10" class="nonterminal" x="61" y="1209">provisionsrc_clause</text></a><rect height="32" rx="10" width="114" x="51" y="1235"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="49" y="1233"></rect>
<text class="terminal" x="59" y="1253">REPLICATION</text>
<rect height="32" rx="10" width="136" x="51" y="1279"></rect>
<rect class="terminal" height="32" rx="10" width="136" x="49" y="1277"></rect>
<text class="terminal" x="59" y="1297">NOREPLICATION</text>
<rect height="32" rx="10" width="100" x="51" y="1323"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="49" y="1321"></rect>
<text class="terminal" x="59" y="1341">BYPASSRLS</text>
<rect height="32" rx="10" width="122" x="51" y="1367"></rect>
<rect class="terminal" height="32" rx="10" width="122" x="49" y="1365"></rect>
<text class="terminal" x="59" y="1385">NOBYPASSRLS</text>
<path class="line" d="m17 17 h2 m20 0 h10 m108 0 h10 m0 0 h110 m-258 0 h20 m238 0 h20 m-278 0 q10 0 10 10 m258 0 q0 -10 10 -10 m-268 10 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m130 0 h10 m0 0 h88 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m64 0 h10 m0 0 h154 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m86 0 h10 m0 0 h132 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m114 0 h10 m0 0 h104 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m134 0 h10 m0 0 h84 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m176 0 h10 m0 0 h42 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m198 0 h10 m0 0 h20 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m90 0 h10 m0 0 h128 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m112 0 h10 m0 0 h106 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m118 0 h10 m0 0 h100 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m138 0 h10 m0 0 h80 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m122 0 h10 m0 0 h96 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m144 0 h10 m0 0 h74 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m196 0 h10 m0 0 h22 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m216 0 h10 m0 0 h2 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m120 0 h10 m0 0 h98 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m142 0 h10 m0 0 h76 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m196 0 h10 m0 0 h22 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m218 0 h10 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m92 0 h10 m0 0 h126 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m114 0 h10 m0 0 h104 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m178 0 h10 m0 0 h40 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m200 0 h10 m0 0 h18 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m128 0 h10 m0 0 h90 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m134 0 h10 m0 0 h84 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m114 0 h10 m0 0 h104 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m144 0 h10 m0 0 h74 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m114 0 h10 m0 0 h104 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m136 0 h10 m0 0 h82 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m100 0 h10 m0 0 h118 m-248 -10 v20 m258 0 v-20 m-258 20 v24 m258 0 v-24 m-258 24 q0 10 10 10 m238 0 q10 0 10 -10 m-248 10 h10 m122 0 h10 m0 0 h96 m23 -1364 h-3"></path>
<polygon points="307 17 315 13 315 21"></polygon>
<polygon points="307 17 299 13 299 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
