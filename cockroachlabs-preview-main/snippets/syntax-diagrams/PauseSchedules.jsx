export const PauseSchedules = () => {
  return (
    <Frame>
      <div
        className="not-prose"
        style={{ overflowX: "auto" }}
        dangerouslySetInnerHTML={{
          __html: `<svg width="397" height="81" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    svg {
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
    }
  </style>
  <polygon points="9 17 1 13 1 21"></polygon>
  <polygon points="17 17 9 13 9 21"></polygon>
  <rect x="31" y="3" width="64" height="32" rx="10"></rect>
  <rect x="29" y="1" width="64" height="32" class="terminal" rx="10"></rect>
  <text class="terminal" x="39" y="21">PAUSE</text>
  <rect x="135" y="3" width="92" height="32" rx="10"></rect>
  <rect x="133" y="1" width="92" height="32" class="terminal" rx="10"></rect>
  <text class="terminal" x="143" y="21">SCHEDULE</text>
  <rect x="247" y="3" width="96" height="32"></rect>
  <rect x="245" y="1" width="96" height="32" class="nonterminal"></rect>
  <text class="nonterminal" x="257" y="21" font-size="10" textLength="72" lengthAdjust="spacingAndGlyphs">schedule_id</text>
  <rect x="135" y="47" width="100" height="32" rx="10"></rect>
  <rect x="133" y="45" width="100" height="32" class="terminal" rx="10"></rect>
  <text class="terminal" x="143" y="65">SCHEDULES</text>
  <a xlink:href="/docs/stable/sql-grammar#select_stmt" xlink:title="select_stmt">
    <rect x="255" y="47" width="94" height="32"></rect>
    <rect x="253" y="45" width="94" height="32" class="nonterminal"></rect>
    <text class="nonterminal" x="265" y="65" font-size="10" textLength="70" lengthAdjust="spacingAndGlyphs">select_stmt</text>
  </a>
  <path class="line" d="m17 17 h2 m0 0 h10 m64 0 h10 m20 0 h10 m92 0 h10 m0 0 h10 m96 0 h10 m0 0 h6 m-254 0 h20 m234 0 h20 m-274 0 q10 0 10 10 m254 0 q0 -10 10 -10 m-264 10 v24 m254 0 v-24 m-254 24 q0 10 10 10 m234 0 q10 0 10 -10 m-244 10 h10 m100 0 h10 m0 0 h10 m94 0 h10 m23 -44 h-3"></path>
  <polygon points="387 17 395 13 395 21"></polygon>
  <polygon points="387 17 379 13 379 21"></polygon>
</svg>`,
        }}
      />
    </Frame>
  );
};
