Note: macOS users may need to manually enable Alt-based shortcuts in their terminal configuration. See the section [macOS terminal configuration](#macos-terminal-configuration) below for details.

| Shortcut                | Description                                                                        |
|-------------------------|------------------------------------------------------------------------------------|
| Tab                     | Use [context-sensitive command completion](#tab-completion).                                          |
| Ctrl+C                  | Clear / Cancel the input.                                                          |
| Ctrl+M, Enter           | New line / enter.                                                                  |
| Ctrl+F, Right arrow     | Forward one character.                                                             |
| Ctrl+B, Left arrow      | Backward one character.                                                            |
| Alt+F, Ctrl+Right arrow | Forward one word.                                                                  |
| Alt+B, Ctrl+Left arrow  | Backward one word.                                                                 |
| Ctrl+L                  | Refresh the display.                                                               |
| Delete                  | Delete the next character.                                                         |
| Ctrl+H, Backspace       | Delete the previous character.                                                     |
| Ctrl+D                  | Delete the next character, or terminate the input if the input is currently empty. |
| Alt+D, Alt+Delete       | Delete next word.                                                                  |
| Ctrl+W, Alt+Backspace   | Delete previous word.                                                              |
| Ctrl+E, End             | End of line.                                                                       |
| Ctrl+A, Home            | Beginning of line.                                                                 |
| Ctrl+T                  | Transpose current and next characters.                                             |
| Ctrl+K                  | Delete from cursor position until end of line.                                     |
| Ctrl+U                  | Delete from beginning of line to cursor position.                                  |
| Alt+L                   | Convert the current word to lowercase.                                             |
| Alt+U                   | Convert the current word to uppercase.                                             |
| Alt+P, Up arrow         | Recall previous history entry.                                                     |
| Alt+N, Down arrow       | Recall next history entry.                                                         |
| Ctrl+R                  | Start searching through input history.                                             |

When searching for history entries, the following shortcuts are active:

| Shortcut       | Description                                        |
|----------------|----------------------------------------------------|
| Ctrl+C, Ctrl+G | Cancel the search, return to normal mode.          |
| Ctrl+R         | Recall next entry matching current search pattern. |
| Enter          | Accept the current recalled entry.                 |
| Backspace      | Delete previous character in search pattern.       |
| Other          | Add character to search pattern.                   |

#### Tab completion

The SQL client offers context-sensitive tab completion when entering commands. Use the **Tab** key on your keyboard when entering a command to initiate the command completion interface. You can then navigate to database objects, keywords, and functions using the arrow keys. Press the **Tab** key again to select the object, function, or keyword from the command completion interface and return to the console.