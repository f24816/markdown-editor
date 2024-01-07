// Import lib from tauri api
const { open } = window.__TAURI__.dialog
const { save } = window.__TAURI__.dialog
const { readTextFile } = window.__TAURI__.fs
const { writeFile, writeTextFile, BaseDirectory } = window.__TAURI__.fs
const { resolveResource } = window.__TAURI__.path
const { invoke } = window.__TAURI__.tauri

const { tempdir } = window.__TAURI__.os

// Establsih global variables
var preview_mode = false;

// Enable hard breaks for the markdown renderer
marked.setOptions({
  breaks: true,
});

// Toggle preview mode
document.getElementById('btn-preview').addEventListener('click', function() {
  if (preview_mode) {
    preview_mode = false;
    document.getElementById('btn-preview').innerHTML = 'Previzualizează';
    document.getElementById('preview').style.display = 'none';
    editor.getWrapperElement().style.display = 'block';
  } else {
    preview_mode = true;
    document.getElementById('btn-preview').innerHTML = 'Editează';
    document.getElementById('preview').innerHTML = marked(editor.getValue());
    document.getElementById('preview').style.display = 'block';
    editor.getWrapperElement().style.display = 'none';
  }
});

// BUG Sometimes it doesn't export the file

// Get HTML from preview to send to the PDF renderer.
document.getElementById('btn-export').addEventListener('click', function() {
  document.getElementById('preview').innerHTML = marked(editor.getValue());
  var element = document.getElementById('preview');

  begining = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
  body {
    font-family: "Arial", sans-serif;
  }
  </style>
</head>
<body>
  `

  end = `
</body>
</html>
  `

  var html = begining + element.outerHTML + end;
  console.log(html);

  async function getTempDir() {
    try {
      const tempDirPath = await tempdir();
      let tempFilePath = `${tempDirPath}file.html`;
      console.log(tempFilePath);

      // Open file save dialog
      const selection = save({
        filters: [{
          extensions: ['pdf'], name: "*"
        }]
      })
      console.log(await selection); // Comes as a promise

      // Save .html file
      const createDataFile = async () => {
        try {
          await writeFile(
            {
              contents: html,
              path: tempFilePath
            },
            {
              dir: BaseDirectory.Temp
            }
          );
        } catch (e) { console.log(e); }}; // Some boring error handling.
      createDataFile();

      // Invoke the command
      invoke('generate_pdf', { input: tempFilePath, output: await selection })
        .then((res) => {
          console.log(res);
          document.getElementById('popup').style.opacity = '1';
          document.getElementById('popup').style.transition = 'none';

          // Wait 1 second
          setTimeout(function()
          {
            document.getElementById('popup').style.transition = 'opacity 1s ease-out';
            document.getElementById('popup').style.opacity = '0';
          }, 2000);
        })
        .catch((err) => {
          console.error(err);
        });

    } catch (error) {
      console.error('Error:', error);
    }
  }

  getTempDir();

});

// Create codemirror editor
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: false,
  lineWrapping: true,
  mode: 'markdown'

});

editor.setSize("800", "100%")

// ###### Here is where the magic happens ######

var data = localStorage.getItem('open');

console.log(data); // Output: value

// check if data is true and select file
if (data == 'true') {
  selectFileDialog();
}

// Select file
function selectFileDialog() {
  const selection = open({
    multiple: false,
    filters: [{
      extensions: ['md', 'mdx'], name: "*"
    }]
  })

  // Read selected file
  selection.then(result => {
      const promise = readTextFile(result);
      promise.then((response) => {
        preview_mode = false;
        document.getElementById('btn-preview').innerHTML = 'Preview';
        document.getElementById('preview').style.display = 'none';
        editor.getWrapperElement().style.display = 'block';
        editor.setValue(response);
      }).catch((error) => {
        console.error(error);
      });
      console.log(result)
  }).catch(err => {
      console.error(err)
  })
}

// Save file
function saveFileDialog() {

const selection = save({
  filters: [{
  extensions: ['md', 'mdx'], name: "*"
  }]
})

// Read selected file
selection.then(result => { // result is the path chosen by the user
  // Write file to location selected
  const promise = writeTextFile({
  path: result,
  contents: editor.getValue(),
  directory: BaseDirectory.Current
  });
  promise.then((response) => {
  console.log(response);
  }).catch((error) => {
  console.error(error);
  });
  console.log(result)
}).catch(err => {
  console.error(err)
})
}

// Bold
document.getElementById('btn-bold').addEventListener('click', function() {
  boldText(editor )
});

function boldText(editor) {
  var selection = editor.getSelection();
  if (selection.length < 1) {
    return;
  }
  var cursor = editor.getCursor();
  if (selection.startsWith('**') && selection.endsWith('**')) {
      // Remove bold
      editor.replaceSelection(selection.slice(2, -2));
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch - 2});
  } else {
      // Add bold
      editor.replaceSelection('**' + selection + '**');
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch + 2});
  }
}

editor.addKeyMap({
  'Ctrl-B': function(cm) {
    boldText(cm)
  }
});

// Italic
document.getElementById('btn-italic').addEventListener('click', function() {
  italicText(editor)
});

function italicText(editor) {
  var selection = editor.getSelection();
  if (selection.length < 1) {
    return;
  }
  var cursor = editor.getCursor();
  if (selection.startsWith('*') && selection.endsWith('*')) {
      // Remove bold
      editor.replaceSelection(selection.slice(1, -1));
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch - 1});
  } else {
      // Add bold
      editor.replaceSelection('*' + selection + '*');
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch + 1});
  }
}

editor.addKeyMap({
  'Ctrl-I': function(cm) {
    italicText(cm)
  }
});

// Code
document.getElementById('btn-code').addEventListener('click', function() {
  codeText(editor)
});

function codeText(editor) {
  var selection = editor.getSelection();
  if (selection.length < 1) {
    return;
  }
  var cursor = editor.getCursor();
  if (selection.startsWith('`') && selection.endsWith('`')) {
      // Remove bold
      editor.replaceSelection(selection.slice(1, -1));
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch - 1});
  } else {
      // Add bold
      editor.replaceSelection('`' + selection + '`');
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch + 1});
  }
}

editor.addKeyMap({
  '`': function(cm) {
    codeText(cm)
  }
});

// Strikethrough
document.getElementById('btn-strike').addEventListener('click', function() {
  strikethroughText(editor)
});

function strikethroughText(editor) {
  var selection = editor.getSelection();
  if (selection.length < 1) {
    return;
  }
  var cursor = editor.getCursor();
  if (selection.startsWith('~~') && selection.endsWith('~~')) {
      // Remove bold
      editor.replaceSelection(selection.slice(2, -2));
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch - 2});
  } else {
      // Add bold
      editor.replaceSelection('~~' + selection + '~~');
      // Adjust cursor position
      editor.setCursor({line: cursor.line, ch: cursor.ch + 2});
  }
}

editor.addKeyMap({
  'Ctrl-Alt-S': function(cm) {
    strikethroughText(cm)
  }
});

// Link
document.getElementById('btn-link').addEventListener('click', function() {
  linkText(editor)
});

function linkText(editor) {
  // Insert link text
  var selection = editor.getSelection();
  if (selection.length < 1) {
    return;
  }
  var cursor = editor.getCursor();

  // Insert link URL
  var link = prompt('Enter link URL', 'https://');
  if (link == null) {
    return;
  }

  // Insert link
  editor.replaceSelection('[' + selection + '](' + link + ')');
  // Adjust cursor position
  editor.setCursor({line: cursor.line, ch: cursor.ch + 1});
}

// Image
document.getElementById('btn-image').addEventListener('click', function() {
  imageText(editor)
});

function imageText(editor) {
  // Insert link text
  var selection = editor.getSelection();
  var cursor = editor.getCursor();

  // Insert link URL
  var link = prompt('Enter image URL', 'https://');
  if (link == null) {
    return;
  }

  // Insert link
  editor.replaceSelection('![' + selection + '](' + link + ')');
  // Adjust cursor position
  editor.setCursor({line: cursor.line, ch: cursor.ch + 1});
}

// Heading 1
function h1Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '# ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-1': function(cm) {
    h1Text(cm)
  }
});

// Heading 2
function h2Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '## ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-2': function(cm) {
    h2Text(cm)
  }
});

// Heading 3
function h3Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '### ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-3': function(cm) {
    h3Text(cm)
  }
});

// Heading 4
function h4Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '#### ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-4': function(cm) {
    h4Text(cm)
  }
});

// Heading 5
function h5Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '##### ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-5': function(cm) {
    h5Text(cm)
  }
});

// Heading 6
function h6Text(editor) {
  var cursor = editor.getCursor();
  var line = editor.getLine(cursor.line);
  var output = '###### ' + line;
  editor.replaceRange(output, {line: cursor.line, ch: 0}, {line: cursor.line, ch: line.length});
}

editor.addKeyMap({
  'Ctrl-6': function(cm) {
    h6Text(cm)
  }
});

// Word counter update
editor.on('change', function(instance) {
  document.getElementById('word-count').innerHTML = instance.getValue().split(/\s+/).length;
});