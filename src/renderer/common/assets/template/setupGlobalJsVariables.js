;(() => {
    const globalJsVariables = '${replace_with_code}'

    for (let key in globalJsVariables) {
        globalThis[key] = globalJsVariables[key]
    }

    window.dispatchEvent(new Event('globalJsVariablesChange'))
})()
