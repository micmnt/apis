import { InitFunction, InterceptorFunction, IKeyStringMap, ResourceFunction } from './types'
import { resourcesBaseOperations, executeRequest, prepareResources } from './utils'


/* Library created to simplify making of http requests */
let resources: IKeyStringMap = {}
let rawUrlsConfig: IKeyStringMap = {}
let domain: string | null = ''
let jwtToken: string | null = null
let authorizationType: string = 'bearer'
let errorInterceptorFunc: InterceptorFunction | null = null

/**
 * Apis initialization function
 * @param {Object} config Apis configuration object
 * @param {string} config.baseUrl Base URL for all HTTP calls.
 * @param {Object} config.savedUrls URL mapping object.
 * @param {(string|null)} [config.jwtTokenName=null] JWT token name to look for in local storage.
 * @param {(string)} [config.authType=bearer] Authentication type.
 * @param {(string|null)} [config.authToken=null] Authentication token.
 * @param {(Object|null)} [config.placeholders=null] Placeholders mapping object.
 * @param {(Function|null)} [config.errorInterceptor=null] Function to trigger on request error.
 */
const init: InitFunction = ({ baseUrl = null, jwtTokenName = null, authType = 'bearer', authToken = null, savedUrls = {}, placeholders = null, errorInterceptor = null }) => {
  rawUrlsConfig = savedUrls
  domain = baseUrl
  authorizationType = authType
  errorInterceptorFunc = typeof errorInterceptor === 'function' ? errorInterceptor : null
  const updatedUrls = prepareResources({ urlsConfig: savedUrls, baseUrl, placeholders })

  resources = updatedUrls
  if (authToken) {
    jwtToken = authToken
  } else if (jwtTokenName && !authToken) {
    jwtToken = jwtTokenName
  }
}

/**
 * Updating placeholders function
 * @param {Object} placeholders Placeholders mapping object.
 */
const updatePlaceholders = (placeholders: IKeyStringMap | null = null) => {
  if (placeholders) {
    const updatedUrls = prepareResources({ urlsConfig: rawUrlsConfig, baseUrl: domain, placeholders })
    resources = updatedUrls
  }
}

/**
 * Function to make GET requests
 * @param {Object} config Configuration object for GET requests
 * @returns {Object} Object with response and error for the request
 */
const getResource: ResourceFunction = async ({ savedUrl, ...options }) => {
  const { url, headers } = resourcesBaseOperations(resources, jwtToken, savedUrl, authorizationType, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'get', url, headers, errorInterceptor: errorInterceptorFunc })
  return response
}

/**
 * Function to make POST requests
 * @param {Object} config Configuration object for POST requests
 * @returns {Object} Object with response and error for the request
 */
const postResource: ResourceFunction = async ({ savedUrl, ...options }) => {
  if (!options.body) {
    options.body = {}
  }
  const { url, headers, body } = resourcesBaseOperations(resources, jwtToken, savedUrl, authorizationType, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'post', url, headers, body, errorInterceptor: errorInterceptorFunc })
  return response
}

/**
 * Function to make PUT requests
 * @param {Object} config Configuration object for PUT requests
 * @returns {Object} Object with response and error for the request
 */
const putResource: ResourceFunction = async ({ savedUrl, ...options }) => {
  if (!options.body) {
    options.body = {}
  }
  const { url, headers, body } = resourcesBaseOperations(resources, jwtToken, savedUrl, authorizationType, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'put', url, headers, body, errorInterceptor: errorInterceptorFunc })
  return response
}

/**
 * Function to make DELETE requests
 * @param {Object} config Configuration object for DELETE requests
 * @returns {Object} Object with response and error for the request
 */
const deleteResource: ResourceFunction = async ({ savedUrl, ...options }) => {
  const { url, headers, body = null } = resourcesBaseOperations(resources, jwtToken, savedUrl, authorizationType, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'delete', url, headers, body, errorInterceptor: errorInterceptorFunc })
  return response
}

export default {
  init,
  updatePlaceholders,
  get: getResource,
  post: postResource,
  delete: deleteResource,
  put: putResource
}
