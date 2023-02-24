import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { IKeyStringMap, PrepareResourcesFunction, Headers, CreateHeadersFunction, ResourceBaseOperationsFunction, ExecuteRequestFunction, IBaseResponse, DeleteOptions, ReplacePlaceholdersFunction, GetAxiosRequest } from './types'

// Object that maps the available token authorization types
const authorizationTypesMap: IKeyStringMap = {
  bearer: 'Bearer',
  apikey: ''
}

// Function that creates and sets up the authorization header with local storage token
export const createHeaders: CreateHeadersFunction = (params = null, overrideAuthToken = null, disableAuth = false, customHeaders = [], responseType = null, tokenName = null, authType = 'bearer') => {
  const token = tokenName ? window.localStorage.getItem(tokenName) || tokenName : tokenName

  const headers: Headers = {
    headers: {}
  }

  if ((overrideAuthToken || token) && !disableAuth) {
    headers.headers!.authorization = overrideAuthToken || `${getAuthType(authType)} ${token}`.trim()
  }

  if (customHeaders && customHeaders.length > 0) {
    customHeaders.forEach(customHeader => {
      const { key, value } = customHeader || {}
      if (key && value) {
        headers.headers![key] = value
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
export const prepareResources: PrepareResourcesFunction = ({ urlsConfig = {}, baseUrl = '', placeholders = {} }) => {
  const updatedUrls = Object.keys(urlsConfig).reduce((acc: IKeyStringMap, key) => {
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
export const replacePlaceholders: ReplacePlaceholdersFunction = (url, placeholders) => {
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
export const isUrl = (text: string | null = null) => {
  return text && (text.startsWith('http://') || text.startsWith('https://'))
}

// Function that returns the correct authorization type based on the string passed as parameter
export const getAuthType = (type: string | null | undefined) => {

  if (!type) return authorizationTypesMap.bearer

  else if (authorizationTypesMap[type] === '') return ''

  return authorizationTypesMap[type] || authorizationTypesMap.bearer
}

// function to setup initial parameters for every request
export const resourcesBaseOperations: ResourceBaseOperationsFunction = (resources, jwtToken, resource, authType, { responseType = null, params = null, auth = null, disableAuth = false, body = null, path = null, customHeaders = [] }) => {
  // creating request headers
  const headers = createHeaders(params, auth, disableAuth, customHeaders, responseType, jwtToken, authType)
  // base url
  const baseUrl = resource ? isUrl(resource) ? resource : resources ? resources[resource] || '' : '' : ''
  // complete url
  const completeUrl = !path ? baseUrl : `${baseUrl}${path}`
  return body ? { url: completeUrl, headers, body } : { url: completeUrl, headers }
}

// Function to determine the axios method
const getAxiosRequest: GetAxiosRequest = async (method, url, headers, body) => {
  let response = null
  switch (method) {
    case 'delete':
      // Axios delete options
      const deleteOptions: AxiosRequestConfig<DeleteOptions> = { ...headers, ...body }
      response = await axios.delete(url, deleteOptions)
      return response
    case 'get':
      response = await axios.get(url, headers)
      return response
    case 'post':
      response = await axios.post(url, body, headers)
      return response
    case 'put':
      response = await axios.put(url, body, headers)
      return response
    default:
      return response
  }
}

// Function with HTTP request's HTTP method, url, headers and body passed as arguments, that returns an object with 'data' and 'error' keys
export const executeRequest: ExecuteRequestFunction = async ({ fullResponse = false, method = 'get', url, headers, body = null, errorInterceptor = null }) => {
  // Base response object
  const baseResponse: IBaseResponse = { data: null, error: null }

  // Axios expects to have a body with a 'data' key for DELETE requests with the actual data to pass, so we need to add it if it's not there
  // const normalizedBody: string | IKeyStringMap | null = body ? body.data ? body.data : { ...body } : null

  try {
    const resourceResponse = await getAxiosRequest(method, url, headers, body)

    if(resourceResponse) {
      const { data: response, ...rest } = resourceResponse
      if (response) {
        baseResponse.data = fullResponse ? { ...rest, data: response } : response.data ? response.data : response
      }
    }
  } catch (error) {
    if (errorInterceptor && typeof errorInterceptor === 'function') {
      errorInterceptor(error as AxiosError)
    }
    baseResponse.error = error as AxiosError
  }

  return baseResponse
}
