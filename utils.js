// Function that creates and sets up the authorization header with local storage token
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

// Function with mapping placeholders object passed as argument, that switches placeholders with their actual values
export const replacePlaceholders = (url, placeholders) => {
  const modifiedUrl = Object.keys(placeholders).reduce((acc, placeholder) => {
    if (url.includes(`/:${placeholder}/`)) {
      acc = url.replace(`/:${placeholder}/`, `${placeholders[placeholder]}/`)
    }

    return acc
  }, url)

  return modifiedUrl
}

// Function to check if a string is a url
export const isUrl = (text = null) => {
  return text && (text.startsWith('http://') || text.startsWith('https://'))
}
