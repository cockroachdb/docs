export const ShowRegions2 = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg height="233" width="723" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style>svg {
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
<rect height="32" rx="10" width="64" x="31" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="29" y="1"></rect>
<text class="terminal" x="39" y="21">SHOW</text>
<rect height="32" rx="10" width="84" x="135" y="3"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="133" y="1"></rect>
<text class="terminal" x="143" y="21">REGIONS</text>
<rect height="32" rx="10" width="60" x="259" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="257" y="33"></rect>
<text class="terminal" x="267" y="53">FROM</text>
<rect height="32" rx="10" width="82" x="359" y="35"></rect>
<rect class="terminal" height="32" rx="10" width="82" x="357" y="33"></rect>
<text class="terminal" x="367" y="53">CLUSTER</text>
<rect height="32" rx="10" width="92" x="359" y="79"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="357" y="77"></rect>
<text class="terminal" x="367" y="97">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="491" y="111"></rect>
<rect class="nonterminal" height="32" width="124" x="489" y="109"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="501" y="129">database_name</text></a><rect height="32" rx="10" width="44" x="359" y="155"></rect>
<rect class="terminal" height="32" rx="10" width="44" x="357" y="153"></rect>
<text class="terminal" x="367" y="173">ALL</text>
<rect height="32" rx="10" width="100" x="423" y="155"></rect>
<rect class="terminal" height="32" rx="10" width="100" x="421" y="153"></rect>
<text class="terminal" x="431" y="173">DATABASES</text>
<rect height="32" rx="10" width="64" x="135" y="199"></rect>
<rect class="terminal" height="32" rx="10" width="64" x="133" y="197"></rect>
<text class="terminal" x="143" y="217">SUPER</text>
<rect height="32" rx="10" width="84" x="219" y="199"></rect>
<rect class="terminal" height="32" rx="10" width="84" x="217" y="197"></rect>
<text class="terminal" x="227" y="217">REGIONS</text>
<rect height="32" rx="10" width="60" x="323" y="199"></rect>
<rect class="terminal" height="32" rx="10" width="60" x="321" y="197"></rect>
<text class="terminal" x="331" y="217">FROM</text>
<rect height="32" rx="10" width="92" x="403" y="199"></rect>
<rect class="terminal" height="32" rx="10" width="92" x="401" y="197"></rect>
<text class="terminal" x="411" y="217">DATABASE</text><a xlink:href="/docs/v23.2/sql-grammar#database_name" xlink:title="database_name">
<rect height="32" width="124" x="515" y="199"></rect>
<rect class="nonterminal" height="32" width="124" x="513" y="197"></rect>
<text lengthAdjust="spacingAndGlyphs" textLength="100" font-size="12" class="nonterminal" x="525" y="217">database_name</text></a><path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m84 0 h10 m20 0 h10 m0 0 h406 m-436 0 h20 m416 0 h20 m-456 0 q10 0 10 10 m436 0 q0 -10 10 -10 m-446 10 v12 m436 0 v-12 m-436 12 q0 10 10 10 m416 0 q10 0 10 -10 m-426 10 h10 m60 0 h10 m20 0 h10 m82 0 h10 m0 0 h194 m-316 0 h20 m296 0 h20 m-336 0 q10 0 10 10 m316 0 q0 -10 10 -10 m-326 10 v24 m316 0 v-24 m-316 24 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m92 0 h10 m20 0 h10 m0 0 h134 m-164 0 h20 m144 0 h20 m-184 0 q10 0 10 10 m164 0 q0 -10 10 -10 m-174 10 v12 m164 0 v-12 m-164 12 q0 10 10 10 m144 0 q10 0 10 -10 m-154 10 h10 m124 0 h10 m-286 -42 v20 m316 0 v-20 m-316 20 v56 m316 0 v-56 m-316 56 q0 10 10 10 m296 0 q10 0 10 -10 m-306 10 h10 m44 0 h10 m0 0 h10 m100 0 h10 m0 0 h112 m-540 -152 h20 m560 0 h20 m-600 0 q10 0 10 10 m580 0 q0 -10 10 -10 m-590 10 v176 m580 0 v-176 m-580 176 q0 10 10 10 m560 0 q10 0 10 -10 m-570 10 h10 m64 0 h10 m0 0 h10 m84 0 h10 m0 0 h10 m60 0 h10 m0 0 h10 m92 0 h10 m0 0 h10 m124 0 h10 m0 0 h36 m23 -196 h-3"></path>
<polygon points="713 17 721 13 721 21"></polygon>
<polygon points="713 17 705 13 705 21"></polygon></svg>`,
        }}
      />
    </Frame>
  );
};
