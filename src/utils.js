import axios from 'axios'

// Object that maps the available token authorization types
const authorizationTypesMap = {
  bearer: 'Bearer',
  apikey: ''
}

// Function that creates and sets up the authorization header with local storage token
export function createHeaders(params = null, overrideAuthToken = null, disableAuth = null, customHeaders = [], responseType = null, tokenName = null, authType = 'bearer') {
  const token = tokenName ? window.localStorage.getItem(tokenName) || tokenName : tokenName

  const headers = {
    headers: {}
  }

  if ((overrideAuthToken || token) && !disableAuth) {
    headers.headers.authorization = overrideAuthToken || `${getAuthType(authType)} ${token}`.trim()
  }

  if (customHeaders?.length > 0) {
    customHeaders.forEach(customHeader => {
      const { key, value } = customHeader || {}
      if (key && value) {
        headers.headers[key] = value
      }
    })
  }

  if (params && typeof params === 'object' && !(params instanceof Array)) {
    headers.params = params
  }

  if (responseType && typeof responseType === 'string') {
    headers.responseType = responseType
  }

  return headers
}

// Function that sets up the resources object from the init configuration
export const prepareResources = ({ urlsConfig = {}, baseUrl = '', placeholders = {} }) => {
  const updatedUrls = Object.keys(urlsConfig).reduce((acc, key) => {
    let currentUrl = isUrl(urlsConfig[key]) ? urlsConfig[key] : `${baseUrl}${urlsConfig[key]}`
    if (placeholders) {
      // Check for placeholders in urls, if some are found, these will be replaced with the actual value
      currentUrl = replacePlaceholders(currentUrl, placeholders)
    }

    acc[key] = currentUrl
    return acc
  }, {})

  return updatedUrls
}

// Function with mapping placeholders object passed as argument, that switches placeholders with their actual values
export const replacePlaceholders = (url, placeholders) => {
  if (url && placeholders) {
    const modifiedUrl = Object.keys(placeholders).reduce((acc, placeholder) => {
      if (url.includes(`/:${placeholder}`)) {
        acc = url.replace(`/:${placeholder}`, `${placeholders[placeholder]}`)
      }

      return acc
    }, url)

    return modifiedUrl
  }

  return ''
}

// Function to check if a string is a url
export const isUrl = (text = null) => {
  return text && (text.startsWith('http://') || text.startsWith('https://'))
}

// Function that returns the correct authorization type based on the string passed as parameter
export const getAuthType = (type) => {
  if (authorizationTypesMap[type] === '') {
    return ''
  }

  return authorizationTypesMap[type] || authorizationTypesMap.bearer
}

// function to setup initial parameters for every request
export const resourcesBaseOperations = (resources, jwtToken, resource, authType, { responseType = null, params = null, auth = null, disableAuth = null, body = null, path = null, customHeaders = [] }) => {
  // creating request headers
  const headers = createHeaders(params, auth, disableAuth, customHeaders, responseType, jwtToken, authType)
  // base url
  const baseUrl = isUrl(resource) ? resource : resources ? resources[resource] || '' : ''
  // complete url
  const completeUrl = !path ? baseUrl : `${baseUrl}${path}`
  return body ? { url: completeUrl, headers, body } : { url: completeUrl, headers }
}

// Function with HTTP request's HTTP method, url, headers and body passed as arguments, that returns an object with 'data' and 'error' keys
export const executeRequest = async ({ fullResponse = false, method = 'get', url, headers, body = null }) => {
  // Corpo di base della risposta
  const baseResponse = { data: null, error: null }
  try {
    const resourceResponse = body
      ? method === 'delete'
        ? await axios[method](url, { ...headers, ...body })
        : await axios[method](url, body, headers)
      : await axios[method](url, headers)
    const { data: response, ...rest } = resourceResponse
    if (response) {
      baseResponse.data = fullResponse ? { ...rest, data: response } : response.data ? response.data : response
    }
  } catch (error) {
    baseResponse.error = error
  }

  return baseResponse
}
