// Import necessary modules from tauri
const { open } = window.__TAURI__.dialog;
const { save } = window.__TAURI__.dialog;
const { readTextFile } = window.__TAURI__.fs;
const { writeFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs;
const { resolveResource } = window.__TAURI__.path;
const { invoke } = window.__TAURI__.tauri;
const { tempdir } = window.__TAURI__.os;

// Establsih global variables
var PREVIEW_MODE = false;
var landscape = false;

// Enable hard breaks for the markdown renderer
marked.setOptions({
    breaks: true,
});

// Toggle preview mode
document.getElementById("btn-preview").addEventListener("click", function () {
    if (PREVIEW_MODE) {
        PREVIEW_MODE = false;

        // get all elemetns with class "btn-edit" and remove the class inverted
        const btnIconElements = document.querySelectorAll(".btn-icon");
        for (const element of btnIconElements) {
            element.classList.remove("inverted");
        }

        document.getElementById("btn-preview").classList.remove("btn-edit");
        document.getElementById("preview").style.display = "none";
        editor.getWrapperElement().style.display = "block";
    } else {
        PREVIEW_MODE = true;

        // get all elemetns with class "btn-edit" and add the class inverted
        const btnIconElements = document.querySelectorAll(".btn-icon");
        for (const element of btnIconElements) {
            element.classList.add("inverted");
        }

        document.getElementById("btn-preview").classList.add("btn-edit");

        let renderd = marked(editor.getValue());
        // Replace all <a> tags with target="_blank"
        renderd = renderd.replace(/<a/g, '<a target="_blank"');

        document.getElementById("preview").innerHTML = renderd
        document.getElementById("preview").style.display = "block";
        editor.getWrapperElement().style.display = "none";
    }
});

// Generate HTML to send to the PDF renderer.
document.getElementById("btn-export").addEventListener("click", function () {
    exportMain(landscape);
});

// Create codemirror editor
var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: false,
    lineWrapping: true,
    mode: "markdown",
});

editor.setSize("800", "100%");

// ###### Here is where the magic happens ######

var data = localStorage.getItem("open");

// check if data is true and select file
if (data == "true") {
    selectFileDialog();
}

// Select file
function selectFileDialog() {
    const selection = open({
        multiple: false,
        filters: [
            {
                extensions: ["md"],
                name: "*",
            },
        ],
    });

    // Read selected file
    selection
        .then((result) => {
            const promise = readTextFile(result);
            promise
                .then((response) => {
                    PREVIEW_MODE = false;

                    // File name to title
                    var filename = result.split("\\").pop().split("/").pop();
                    document.getElementById("title").innerHTML = filename;

                    document
                        .getElementById("btn-preview")
                        .classList.remove("btn-edit");
                    document.getElementById("preview").style.display = "none";
                    editor.getWrapperElement().style.display = "block";
                    editor.setValue(response);
                })
                .catch((error) => {
                    console.error(error);
                });
            console.log(result);
        })
        .catch((err) => {
            console.error(err);
        });
}

// Save file
function saveFileDialog() {
    const selection = save({
        filters: [
            {
                extensions: ["md"],
                name: "*",
            },
        ],
    });

    // Read selected file
    selection
        .then((result) => {
            // result is the path chosen by the user
            // Write file to location selected
            const promise = writeTextFile({
                path: result,
                contents: editor.getValue(),
                directory: BaseDirectory.Current,
            });
            promise
                .then((response) => {
                    console.log(response);
                })
                .catch((error) => {
                    console.error(error);
                });
            console.log(result);
        })
        .catch((err) => {
            console.error(err);
        });
}

// -------------------------------------------
// --------- Keybindings for editor ----------
// -------------------------------------------

// Generic formating algorithm for bold, italic, etc.
function genericFormat(editor, string, length) {

    // Initialize variables
    var cursor = editor.getCursor();
    var word = editor.findWordAt(cursor);
    var word_content = editor.getRange(word.anchor, word.head);
    var extendedWord = {
        anchor: { line: word.anchor.line, ch: Math.max(0, word.anchor.ch - length) },
        head: { line: word.head.line, ch: word.head.ch + length },
    };
    var extendedWordText = editor.getRange(
        extendedWord.anchor,
        extendedWord.head
    );

    // Handle on selected
    var selection = editor.getSelection();
    if (selection.length > 1) {
        if (selection.startsWith(string) && selection.endsWith(string)) {
            // Remove bold
            editor.replaceSelection(selection.slice(length, (length - (length*2))));
            return;
        } else {
            // Add bold
            editor.replaceSelection(string + selection + string);
            return;
        }
    }

    // Check if the selection has some formating already applied to avoid adding it twice,
    // esspecially when the cursor is at the end of the word
    if (
        extendedWordText.startsWith(string) == false &&
        extendedWordText.endsWith(string) == true
    ) {

        return;
    }
    if (
        extendedWordText.endsWith(string) == false &&
        extendedWordText.startsWith(string) == true
    ) {
        return;
    }

    // Handle on cursor
    // Add or remove characters
    if (extendedWordText.startsWith(string) && extendedWordText.endsWith(string)) {
        // Remove
        rmv = extendedWordText.slice(length, (length - (length*2)));
        editor.replaceRange(rmv, extendedWord.anchor, extendedWord.head);
        editor.setCursor(cursor.line, cursor.ch - length);
    } else {
        // Add
        editor.replaceRange(string + word_content + string, word.anchor, word.head);
        editor.setCursor(cursor.line, cursor.ch + length);
    }
}

// Bold
document.getElementById("btn-bold").addEventListener("click", function () {
    // Call generic formating algorithm for italic
    genericFormat(editor, "**", 2);
});

editor.addKeyMap({
    "Ctrl-B": function (cm) {
        // Call generic formating algorithm for italic
        genericFormat(editor, "**", 2);
    },
});

// Italic
document.getElementById("btn-italic").addEventListener("click", function () {
    // Call generic formating algorithm for italic
    genericFormat(editor, "*", 1);
});

editor.addKeyMap({
    "Ctrl-I": function (editor) {
        // Call generic formating algorithm for italic
        genericFormat(editor, "*", 1);
    },
});

// Code
document.getElementById("btn-code").addEventListener("click", function () {
    // Call generic formating algorithm for italic
    genericFormat(editor, "`", 1);
});

editor.addKeyMap({
    "Ctrl-`": function (editor) {
        // Call generic formating algorithm for italic
        genericFormat(editor, "`", 1);
    },
});

// Strikethrough
document.getElementById("btn-strike").addEventListener("click", function () {
    // Call generic formating algorithm for italic
    genericFormat(editor, "~~", 2);
});

editor.addKeyMap({
    "Ctrl-Alt-S": function (editor) {
        // Call generic formating algorithm for italic
        genericFormat(editor, "~~", 2);
    },
});

// Link
document.getElementById("btn-link").addEventListener("click", function () {
    linkText(editor);
});

function linkText(editor) {
    // Insert link text
    var selection = editor.getSelection();
    if (selection.length < 1) {
        return;
    }

    // Insert link URL
    var link = prompt("Enter link URL", "https://");
    if (link == null) {
        return;
    }

    // Insert link
    editor.replaceSelection("[" + selection + "](" + link + ")");
}

// Image
document.getElementById("btn-image").addEventListener("click", function () {
    insertImage(editor);
});

function insertImage(editor) {
    // Insert link text
    var cursor = editor.getCursor();

    // Insert link URL
    var link = prompt("Enter image URL", "https://");
    if (link == null) {
        return;
    }

    // Insert image
    editor.replaceSelection('<img src="' + link + '" width="400">');
}

// Code block
document.getElementById("btn-code-block").addEventListener("click", function () {
    codeBlock(editor);
});

function codeBlock(editor) {
    // Insert link text
    var selection = editor.getSelection();
    if (selection.length < 1) {
        return;
    }

    // Insert link
    editor.replaceSelection("```\n" + selection + "\n```");
}

// Blockquote
document.getElementById("btn-quote").addEventListener("click", function () {
    blockquote(editor);
});

function blockquote(editor) {
    // Get current line
    var cursor = editor.getCursor();
    var line = editor.getLine(cursor.line);

    // Remove blockquote if it already exists
    if (line.startsWith("> ")) {
        console.log("Remove blockquote");
        // Remove the first two characters of the line
        editor.replaceRange("", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 2 });
        return;
    } else {
        console.log("Add blockquote");
        // Insert blockquote
        editor.replaceRange("> " + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
    }
}

editor.addKeyMap({
    "Ctrl-Q": function (editor) {
        blockquote(editor);
    },
});


// Align center
document.getElementById("btn-align-center").addEventListener("click", function () {
    centerText(editor);
});

function centerText(editor) {
    var selection = editor.getSelection();
    editor.replaceSelection("<center>" + selection + "</center>");
}

// Align right
document.getElementById("btn-align-right").addEventListener("click", function () {
    rightText(editor);
});

function rightText(editor) {
    var selection = editor.getSelection();
    editor.replaceSelection("<right>" + selection + "</right>");
}

// Align left
document.getElementById("btn-align-left").addEventListener("click", function () {
    leftText(editor);
});

function leftText(editor) {
    var selection = editor.getSelection();
    // Check if the selection has <right> at the beginning and </right> at the end
    if (selection.startsWith("<right>") && selection.endsWith("</right>")) {
        // Remove <right> and </right>
        editor.replaceSelection(selection.slice(7, -8));
        return;
    } if (selection.startsWith("<center>") && selection.endsWith("</center>")) {
        // Remove <center> and </center>
        editor.replaceSelection(selection.slice(8, -9));
        return;
    }
}

// Heading 1
function genericHeading(editor, string) {
    var cursor = editor.getCursor();
    var line = editor.getLine(cursor.line);
    // Check if the line already starts with a heading
    if (line.startsWith(string)) {
        console.log("Remove heading");
        // Remove the first characters of the line up to the first space
        editor.replaceRange("", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.indexOf(" ") + 1 });
        return;
    } if (line.startsWith("#")) {
        console.log("Remove heading");
        // Remove the first characters of the line up to the first space
        editor.replaceRange("", { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.indexOf(" ") + 1 });
        // Add level 1 heading to the line
        // Get the line again
        line = editor.getLine(cursor.line);
        editor.replaceRange(string + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        return;
    } else {
        var output = string + line;
        editor.replaceRange(output, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
    }
}

editor.addKeyMap({
    "Ctrl-1": function (editor) {
        genericHeading(editor, "# ");
    },
});

editor.addKeyMap({
    "Ctrl-2": function (cm) {
        genericHeading(editor, "## ");
    },
});

editor.addKeyMap({
    "Ctrl-3": function (cm) {
        genericHeading(editor, "### ");
    },
});

editor.addKeyMap({
    "Ctrl-4": function (cm) {
        genericHeading(editor, "#### ");
    },
});

editor.addKeyMap({
    "Ctrl-5": function (cm) {
        genericHeading(editor, "##### ");
    },
});

editor.addKeyMap({
    "Ctrl-6": function (cm) {
        genericHeading(editor, "###### ");
    },
});

// Word counter update
editor.on("change", function (instance) {
    document.getElementById("word-count").innerHTML = instance
        .getValue()
        .split(/\s+/).length;
});