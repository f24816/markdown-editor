const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Update the preview with the current content of the editor
function updatePreview() {
    const markdownText = editor.value;
    const html = marked(markdownText, { breaks: true });
    preview.innerHTML = html;
}

// Listen for changes in the textarea and update the preview
editor.addEventListener('input', updatePreview);

// Update the preview initially
updatePreview();