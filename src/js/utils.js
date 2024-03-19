dark_mode = false
// Change Theme
var theme = document.getElementById("change-theme");
theme.onclick = function(e) {
    if (dark_mode == true) {
        dark_mode = false
        theme.src = "icons/light_mode.svg";
    } else {
        dark_mode = true
        theme.src = "icons/dark_mode.svg";
    }
}

// Open file dialog
document.getElementById('interact-file').addEventListener('click', function() {
    document.getElementById('file-dropdown').style.display = 'block';
});

document.addEventListener('click', function(event) {
    var fileDropdown = document.getElementById('file-dropdown');
    var target = event.target;
    if (!fileDropdown.contains(target) && target !== document.getElementById('interact-file')) {
        fileDropdown.style.display = 'none';
    }
});
// Open format dialog
document.getElementById('interact-format').addEventListener('click', function() {
    document.getElementById('format-dropdown').style.display = 'block';
});

document.addEventListener('click', function(event) {
    var fileDropdown = document.getElementById('format-dropdown');
    var target = event.target;
    if (!fileDropdown.contains(target) && target !== document.getElementById('interact-format')) {
        fileDropdown.style.display = 'none';
    }
});

// Open about dialog
document.getElementById('interact-about').addEventListener('click', function() {
    document.getElementById('about').style.display = 'block';
});

document.getElementById('close-button').addEventListener('click', function() {
    document.getElementById('about').style.display = 'none';
});