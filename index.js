import axios from 'axios'
import { createHeaders, replacePlaceholders, isUrl } from './utils'

/* Library created to simplify making of http requests */
let resources = {}
let jwtToken = null

/**
 * Apis initialization function
 * @param {Object} config Apis configuration object
 * @param {string} config.baseUrl Base URL for all HTTP calls.
 * @param {Object} config.savedUrls URL mapping object.
 * @param {string} [config.jwtTokenName=null] JWT token name to look for in local storage.
 * @param {Object} [config.placeholders=null] Placeholders mapping object.
 */
const init = ({ baseUrl = null, jwtTokenName = null, savedUrls = {}, placeholders = null }) => {
  const updatedUrls = Object.keys(savedUrls).reduce((acc, key) => {
    let currentUrl = isUrl(savedUrls[key]) ? savedUrls[key] : `${baseUrl}${savedUrls[key]}`
    if (placeholders) {
      // Check for placeholders in urls, if some are found, these will be replaced with the actual value
      currentUrl = replacePlaceholders(currentUrl, placeholders)
    }

    acc[key] = currentUrl
    return acc
  }, {})

  resources = updatedUrls
  if (jwtTokenName) {
    jwtToken = jwtTokenName
  }
}

/**
 * Updating placeholders function
 * @param {Object} placeholders Placeholders mapping object.
 */
const updatePlaceholders = (placeholders = null) => {
  if (placeholders) {
    const updatedUrls = Object.keys(resources).reduce((acc, key) => {
      const currentUrl = replacePlaceholders(resources[key], placeholders)
      acc[key] = currentUrl
      return acc
    }, {})

    resources = updatedUrls
  }
}

// function to setup initial parameters for every request
const resourcesBaseOperations = (resource, { responseType = null, params = null, auth = null, disableAuth = null, body = null, path = null, customHeaders = [] }) => {
  // creating request headers
  const headers = createHeaders(params, auth, disableAuth, customHeaders, responseType, jwtToken)
  // base url
  const baseUrl = isUrl(resource) ? resource : resources[resource]
  // complete url
  const completeUrl = !path ? baseUrl : `${baseUrl}${path}`
  return body ? { url: completeUrl, headers, body } : { url: completeUrl, headers }
}

// Function with HTTP request's HTTP method, url, headers and body passed as arguments, that returns an object with 'data' and 'error' keys
const executeRequest = async ({ fullResponse = false, method = 'get', url, headers, body = null }) => {
  // Corpo di base della risposta
  const baseResponse = { data: null, error: null }
  try {
    const resourceResponse = body ? await axios[method](url, body, headers) : await axios[method](url, headers)
    const { data: response, ...rest } = resourceResponse
    baseResponse.data = fullResponse ? { ...rest, data: response } : response.data ? response.data : response
  } catch (error) {
    baseResponse.error = error
  }

  return baseResponse
}

/**
 * Function to make GET requests
 * @param {Object} config Configuration object for GET requests
 * @returns {Object} Object with response and error for the request
 */
const getResource = async ({ savedUrl, ...options }) => {
  const { url, headers } = resourcesBaseOperations(savedUrl, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'get', url, headers })
  return response
}

/**
 * Function to make POST requests
 * @param {Object} config Configuration object for POST requests
 * @returns {Object} Object with response and error for the request
 */
const postResource = async ({ savedUrl, ...options }) => {
  if (!options.body) {
    options.body = {}
  }
  const { url, headers, body } = resourcesBaseOperations(savedUrl, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'post', url, headers, body })
  return response
}

/**
 * Function to make PUT requests
 * @param {Object} config Configuration object for PUT requests
 * @returns {Object} Object with response and error for the request
 */
const putResource = async ({ savedUrl, ...options }) => {
  if (!options.body) {
    options.body = {}
  }
  const { url, headers, body } = resourcesBaseOperations(savedUrl, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'put', url, headers, body })
  return response
}

/**
 * Function to make DELETE requests
 * @param {Object} config Configuration object for DELETE requests
 * @returns {Object} Object with response and error for the request
 */
const deleteResource = async ({ savedUrl, ...options }) => {
  const { url, headers } = resourcesBaseOperations(savedUrl, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'delete', url, headers })
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
