interface NativeApi {
    /**
     * Copy text to clipboard
     *
     * @param {string} text Text to be copied to clipboard
     * @returns {boolean} Result
     */
    copyToClipboard: (text: string) => boolean

    /**
     * Read text from clipboard
     *
     * @returns {string} Result
     */
    readClipboard: () => string

    /**
     * Save file to download directory
     *
     * @param {string} dataBase64 Base64 encoded data
     * @param {string} fileName File name to be saved
     * @returns {boolean} Result
     *
     * @example
     * // From Unit8Array:
     * NativeApi.saveToDownloads(btoa(String.fromCharCode(...data)))
     * // From string:
     * NativeApi.saveToDownloads(btoa(String.fromCharCode(...new TextEncoder().encode(text))))
     */
    saveToDownloads: (dataBase64: string, fileName: string) => boolean
}

declare const NativeApi: NativeApi
