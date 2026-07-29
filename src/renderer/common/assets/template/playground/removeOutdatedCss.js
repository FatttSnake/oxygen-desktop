;(() => {
    document.querySelectorAll('style[id$=".css"]').forEach((el) => {
        el.remove()
    })
})()
