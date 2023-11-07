// Import lib from tauri api
const { open } = window.__TAURI__.dialog
const { save } = window.__TAURI__.dialog
const { readTextFile } = window.__TAURI__.fs
const { writeTextFile, BaseDirectory } = window.__TAURI__.fs


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
    document.getElementById('btn-preview').innerHTML = '<b>Preview</b>';
    document.getElementById('preview').style.display = 'none';
    editor.getWrapperElement().style.display = 'block';
  } else {
    preview_mode = true;
    document.getElementById('btn-preview').innerHTML = '<b>Edit</b>';
    document.getElementById('preview').innerHTML = marked(editor.getValue());
    document.getElementById('preview').style.display = 'block';
    editor.getWrapperElement().style.display = 'none';
  }
});

// Create codemirror editor
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: false,
  mode: 'markdown'

});

editor.setSize("100%", "100%")

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

// Italic
document.getElementById('btn-code').addEventListener('click', function() {
  codeText(editor)
});

function codeText(editor) {
  var selection = editor.getSelection();
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