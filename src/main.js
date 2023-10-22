const { open } = window.__TAURI__.dialog
const { readTextFile } = window.__TAURI__.fs

marked.setOptions({
  breaks: true,
});

var preview_mode = false;

document.getElementById('preview').addEventListener('click', function() {
  if (preview_mode) {
    preview_mode = false;
    document.getElementById('preview').innerHTML = '<b>Preview</b>';
    document.getElementById('preview-box').style.display = 'none';
    editor.getWrapperElement().style.display = 'block';
  } else {
    preview_mode = true;
    document.getElementById('preview').innerHTML = '<b>Edit</b>';
    document.getElementById('preview-box').innerHTML = marked(editor.getValue());
    document.getElementById('preview-box').style.display = 'block';
    editor.getWrapperElement().style.display = 'none';

  }
});

var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: false,
  mode: 'markdown'
});


function fileDialog() {

    const selection = open({
        multiple: false,
        filters: [{
            extensions: ['md', 'mdx'], name: "*"
        }]
    })

    // get promise result as text
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

document.getElementById('bold').addEventListener('click', function() {
  var selection = editor.getSelection();
  var cursor = editor.getCursor();
  if (selection.startsWith('**') && selection.endsWith('**')) {
      // Remove bold
      editor.replaceSelection(selection.slice(2, -2));
  } else {
      // Add bold
      editor.replaceSelection('**' + selection + '**');
  }
});

editor.addKeyMap({
  'Ctrl-B': function(cm) {
      var selection = cm.getSelection();
      var cursor = cm.getCursor();
      if (selection.startsWith('**') && selection.endsWith('**')) {
          // Remove bold
          cm.replaceSelection(selection.slice(2, -2));
          // Adjust cursor position
          cm.setCursor({line: cursor.line, ch: cursor.ch - 2});
      } else {
          // Add bold
          cm.replaceSelection('**' + selection + '**');
          // Adjust cursor position
          cm.setCursor({line: cursor.line, ch: cursor.ch + 2});
      }
  }
});
