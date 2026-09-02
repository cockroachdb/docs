export const Name = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="125" width="251" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="82" x="51" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="49" y="1"></rect>
<text class="terminal" x="59" y="21">identifier</text><a xlink:href="#unreserved_keyword" xlink:title="unreserved_keyword">
<rect height="32" width="152" x="51" y="47"></rect>
<rect class="nonterminal" height="32" width="152" x="49" y="45"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="128" font-size="11" class="nonterminal" x="61" y="65">unreserved_keyword</text></a><a xlink:href="#col_name_keyword" xlink:title="col_name_keyword">
<rect height="32" width="142" x="51" y="91"></rect>
<rect class="nonterminal" height="32" width="142" x="49" y="89"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="118" font-size="11" class="nonterminal" x="61" y="109">col_name_keyword</text></a><path class="line" d="m17 17 h2 m20 0 h10 m82 0 h10 m0 0 h70 m-192 0 h20 m172 0 h20 m-212 0 q10 0 10 10 m192 0 q0 -10 10 -10 m-202 10 v24 m192 0 v-24 m-192 24 q0 10 10 10 m172 0 q10 0 10 -10 m-182 10 h10 m152 0 h10 m-182 -10 v20 m192 0 v-20 m-192 20 v24 m192 0 v-24 m-192 24 q0 10 10 10 m172 0 q10 0 10 -10 m-182 10 h10 m142 0 h10 m0 0 h10 m23 -88 h-3"></path>
<polygon points="241 17 249 13 249 21"></polygon>
<polygon points="241 17 233 13 233 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
