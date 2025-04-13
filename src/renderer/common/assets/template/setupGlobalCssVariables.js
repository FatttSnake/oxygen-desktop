;(() => {
    document.querySelector('#global-css-variables').textContent = '${replace_with_code}'

    window.dispatchEvent(new Event('globalCssVariablesChange'))
})()
