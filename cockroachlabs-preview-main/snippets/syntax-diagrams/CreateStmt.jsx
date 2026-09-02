export const CreateStmt = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="345" width="371" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<polygon points="17 17 9 13 9 21"></polygon><a xlink:href="#create_role_stmt" xlink:title="create_role_stmt">
<rect height="32" width="128" x="51" y="3"></rect>
<rect class="nonterminal" height="32" width="128" x="49" y="1"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="104" font-size="10" class="nonterminal" x="61" y="21">create_role_stmt</text></a><a xlink:href="#create_ddl_stmt" xlink:title="create_ddl_stmt">
<rect height="32" width="124" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="124" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="10" class="nonterminal" x="61" y="65">create_ddl_stmt</text></a><a xlink:href="#create_stats_stmt" xlink:title="create_stats_stmt">
<rect height="32" width="136" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="136" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="112" font-size="10" class="nonterminal" x="61" y="109">create_stats_stmt</text></a><a xlink:href="#create_changefeed_stmt" xlink:title="create_changefeed_stmt">
<rect height="32" width="178" x="51" y="135"></rect>
<rect class="nonterminal" height="32" width="178" x="49" y="133"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="154" font-size="11" class="nonterminal" x="61" y="153">create_changefeed_stmt</text></a><a xlink:href="#create_extension_stmt" xlink:title="create_extension_stmt">
<rect height="32" width="166" x="51" y="179"></rect>
<rect class="nonterminal" height="32" width="166" x="49" y="177"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="142" font-size="10" class="nonterminal" x="61" y="197">create_extension_stmt</text></a><a xlink:href="#create_external_connection_stmt" xlink:title="create_external_connection_stmt">
<rect height="32" width="234" x="51" y="223"></rect>
<rect class="nonterminal" height="32" width="234" x="49" y="221"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="210" font-size="10" class="nonterminal" x="61" y="241">create_external_connection_stmt</text></a><a xlink:href="#create_logical_replication_stream_stmt" xlink:title="create_logical_replication_stream_stmt">
<rect height="32" width="272" x="51" y="267"></rect>
<rect class="nonterminal" height="32" width="272" x="49" y="265"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="248" font-size="10" class="nonterminal" x="61" y="285">create_logical_replication_stream_stmt</text></a><a xlink:href="#create_schedule_stmt" xlink:title="create_schedule_stmt">
<rect height="32" width="160" x="51" y="311"></rect>
<rect class="nonterminal" height="32" width="160" x="49" y="309"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="136" font-size="10" class="nonterminal" x="61" y="329">create_schedule_stmt</text></a><path class="line" d="m17 17 h2 m20 0 h10 m128 0 h10 m0 0 h144 m-312 0 h20 m292 0 h20 m-332 0 q10 0 10 10 m312 0 q0 -10 10 -10 m-322 10 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m124 0 h10 m0 0 h148 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m136 0 h10 m0 0 h136 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m178 0 h10 m0 0 h94 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m166 0 h10 m0 0 h106 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m234 0 h10 m0 0 h38 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m272 0 h10 m-302 -10 v20 m312 0 v-20 m-312 20 v24 m312 0 v-24 m-312 24 q0 10 10 10 m292 0 q10 0 10 -10 m-302 10 h10 m160 0 h10 m0 0 h112 m23 -308 h-3"></path>
<polygon points="361 17 369 13 369 21"></polygon>
<polygon points="361 17 353 13 353 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
