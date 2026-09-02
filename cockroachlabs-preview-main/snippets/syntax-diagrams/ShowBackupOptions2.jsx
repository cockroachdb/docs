export const ShowBackupOptions2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="433" width="623" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="84" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">AS_JSON</text>
<rect height="32" rx="10" width="114" x="51" y="47"></rect>
<rect class="terminal" height="32" rx="10" width="114" x="49" y="45"></rect>
<text class="terminal" x="59" y="65">CHECK_FILES</text>
<rect height="32" rx="10" width="54" x="51" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="54" x="49" y="89"></rect>
<text class="terminal" x="59" y="109">SKIP</text>
<rect height="32" rx="10" width="52" x="125" y="91"></rect>
<rect class="terminal" height="32" rx="10" width="52" x="123" y="89"></rect>
<text class="terminal" x="133" y="109">SIZE</text>
<rect height="32" rx="10" width="100" x="51" y="135"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="49" y="133"></rect>
<text class="terminal" x="59" y="153">DEBUG_IDS</text>
<rect height="32" rx="10" width="200" x="71" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="200" x="69" y="177"></rect>
<text class="terminal" x="79" y="197">INCREMENTAL_LOCATION</text>
<rect height="32" rx="10" width="50" x="71" y="223"></rect>
<rect class="terminal" height="32" rx="10" width="50" x="69" y="221"></rect>
<text class="terminal" x="79" y="241">KMS</text>
<rect height="32" rx="10" width="30" x="311" y="179"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="309" y="177"></rect>
<text class="terminal" x="319" y="197">=</text><a xlink:href="#string_or_placeholder_opt_list" xlink:title="string_or_placeholder_opt_list">
<rect height="32" width="214" x="361" y="179"></rect>
<rect class="nonterminal" height="32" width="214" x="359" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="190" font-size="10" class="nonterminal" x="371" y="197">string_or_placeholder_opt_list</text></a><rect height="32" rx="10" width="210" x="71" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="210" x="69" y="265"></rect>
<text class="terminal" x="79" y="285">ENCRYPTION_PASSPHRASE</text>
<rect height="32" rx="10" width="190" x="71" y="311"></rect>
<rect class="terminal" height="32" rx="10" width="190" x="69" y="309"></rect>
<text class="terminal" x="79" y="329">ENCRYPTION_INFO_DIR</text>
<rect height="32" rx="10" width="30" x="321" y="267"></rect>
<rect class="terminal" height="32" rx="10" width="30" x="319" y="265"></rect>
<text class="terminal" x="329" y="285">=</text><a xlink:href="#string_or_placeholder" xlink:title="string_or_placeholder">
<rect height="32" width="158" x="371" y="267"></rect>
<rect class="nonterminal" height="32" width="158" x="369" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="134" font-size="10" class="nonterminal" x="381" y="285">string_or_placeholder</text></a><rect height="32" rx="10" width="104" x="51" y="355"></rect>
<rect class="terminal" height="32" rx="10" width="104" x="49" y="353"></rect>
<text class="terminal" x="59" y="373">PRIVILEGES</text>
<rect height="32" rx="10" width="234" x="51" y="399"></rect>
<rect class="terminal" height="32" rx="10" width="234" x="49" y="397"></rect>
<text class="terminal" x="59" y="417">DEBUG_DUMP_METADATA_SST</text>
<path class="line" d="m17 17 h2 m20 0 h10 m84 0 h10 m0 0 h440 m-564 0 h20 m544 0 h20 m-584 0 q10 0 10 10 m564 0 q0 -10 10 -10 m-574 10 v24 m564 0 v-24 m-564 24 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m114 0 h10 m0 0 h410 m-554 -10 v20 m564 0 v-20 m-564 20 v24 m564 0 v-24 m-564 24 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m54 0 h10 m0 0 h10 m52 0 h10 m0 0 h398 m-554 -10 v20 m564 0 v-20 m-564 20 v24 m564 0 v-24 m-564 24 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m100 0 h10 m0 0 h424 m-554 -10 v20 m564 0 v-20 m-564 20 v24 m564 0 v-24 m-564 24 q0 10 10 10 m544 0 q10 0 10 -10 m-534 10 h10 m200 0 h10 m-240 0 h20 m220 0 h20 m-260 0 q10 0 10 10 m240 0 q0 -10 10 -10 m-250 10 v24 m240 0 v-24 m-240 24 q0 10 10 10 m220 0 q10 0 10 -10 m-230 10 h10 m50 0 h10 m0 0 h150 m20 -44 h10 m30 0 h10 m0 0 h10 m214 0 h10 m-554 -10 v20 m564 0 v-20 m-564 20 v68 m564 0 v-68 m-564 68 q0 10 10 10 m544 0 q10 0 10 -10 m-534 10 h10 m210 0 h10 m-250 0 h20 m230 0 h20 m-270 0 q10 0 10 10 m250 0 q0 -10 10 -10 m-260 10 v24 m250 0 v-24 m-250 24 q0 10 10 10 m230 0 q10 0 10 -10 m-240 10 h10 m190 0 h10 m0 0 h20 m20 -44 h10 m30 0 h10 m0 0 h10 m158 0 h10 m0 0 h46 m-554 -10 v20 m564 0 v-20 m-564 20 v68 m564 0 v-68 m-564 68 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m104 0 h10 m0 0 h420 m-554 -10 v20 m564 0 v-20 m-564 20 v24 m564 0 v-24 m-564 24 q0 10 10 10 m544 0 q10 0 10 -10 m-554 10 h10 m234 0 h10 m0 0 h290 m23 -396 h-3"></path>
<polygon points="613 17 621 13 621 21"></polygon>
<polygon points="613 17 605 13 605 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
