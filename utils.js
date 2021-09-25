// Funzione che si occupa di creare l'header di autorizzazione e popolarlo con il token presente nel localStorage
export function createHeaders (params = null, overrideAuthToken = null, disableAuth = null, customHeaders = [], responseType = null, tokenName = null) {
  const token = tokenName ? window.localStorage.getItem(tokenName) : tokenName

  const headers = {
    headers: {}
  }

  if ((overrideAuthToken || token) && !disableAuth) {
    headers.headers.authorization = overrideAuthToken || `Bearer ${token}`
  }

  if (customHeaders.length > 0) {
    customHeaders.forEach(customHeader => {
      const { key, value } = customHeader
      if (key && value) {
        headers.headers[key] = value
      }
    })
  }

  if (params) {
    headers.params = params
  }

  if (responseType) {
    headers.responseType = responseType
  }

  return headers
}

// Funzione che preso in ingresso un url e un oggetto con le chiavi dei placeholder presenti nell'url,
// applica la sostituzione dei placeholder e restituisce l'url modificato
export const replacePlaceholders = (url, placeholders) => {
  const modifiedUrl = Object.keys(placeholders).reduce((acc, placeholder) => {
    if (url.includes(`/:${placeholder}/`)) {
      acc = url.replace(`/:${placeholder}/`, `${placeholders[placeholder]}/`)
    }

    return acc
  }, url)

  return modifiedUrl
}

// Funzione che presa in ingresso una stringa, verifica se si tratta di un url o meno
export const isUrl = (text = null) => {
  return text && (text.startsWith('http://') || text.startsWith('https://'))
}
