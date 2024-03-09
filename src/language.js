// The default language is 'en' English
var currentlanguage = 'ro';

// BUG: This function needs to be called once to work
changelang();

// Get the value of selected language from <select> element
document.getElementById('language-select-option').addEventListener('change', function() {
    console.log(this.value);
    currentlanguage = this.value;
    changelang();
});

function changelang() {
    var styleTag = document.getElementById('language-style');
        if (styleTag) {
            styleTag.textContent = '.bilanguage::after {content: ' + getContent() + '!important;}';
        } else {
            var newStyle = document.createElement('style');
            newStyle.textContent = '.bilanguage::after {content: ' + getContent() + '!important;}';
            newStyle.id = 'language-style';
            document.head.appendChild(newStyle);
        }
    currentlanguage = currentlanguage === 'en' ? 'ro' : 'en';
}

function getContent() {
    return currentlanguage === 'en' ? 'attr(data-ro)' : 'attr(data-en)';
}