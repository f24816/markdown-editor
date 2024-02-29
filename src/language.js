var currentlanguage = 'en';

function changelang() {
    console.log(currentlanguage);
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
