import axios from 'axios'
import { createHeaders, replacePlaceholders, isUrl } from './utils'

/* Util che si occupa di creare una interfaccia semplificata per effettuare chiamate http */
let resources = {}
let jwtToken = null

/**
 * Funzione che si occupa di inizializzare il servizio di libreria API
 * @param {Object} config La configurazione di base del servizio di API.
 * @param {string} config.baseUrl L'URL di base da cui partono tutte le chiamate HTTP.
 * @param {Object} config.savedUrls Oggetto in cui i vari URL sono indicizzati mediante un nome.
 * @param {string} [config.jwtTokenName=null] Il nome del token JWT da prendere nel local-storage.
 * @param {Object} [config.placeholders=null] Oggetto in cui i vari placeholders presenti negli URL registrati sono indicizzati mediante un nome.
 */
const init = ({ baseUrl = null, jwtTokenName = null, savedUrls = {}, placeholders = null }) => {
  const updatedUrls = Object.keys(savedUrls).reduce((acc, key) => {
    let currentUrl = isUrl(savedUrls[key]) ? savedUrls[key] : `${baseUrl}${savedUrls[key]}`
    if (placeholders) {
      // Controllo che per quella chiave ci sia il parametro, se viene trovato, viene sostituito con il valore passato
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
 * Funzione che permette l'aggiornamento dei placeholders negli url
 * @param {Object} placeholders Oggetto in cui i vari placeholders presenti negli URL registrati sono indicizzati mediante un nome.
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

// funzione che si occupa di settare i parametri iniziali di ogni chiamata
const resourcesBaseOperations = (resource, { responseType = null, params = null, auth = null, disableAuth = null, body = null, path = null, customHeaders = [] }) => {
  // creo gli headers per la chiamata
  const headers = createHeaders(params, auth, disableAuth, customHeaders, responseType, jwtToken)
  // url di base
  const baseUrl = isUrl(resource) ? resource : resources[resource]
  // url completo
  const completeUrl = !path ? baseUrl : `${baseUrl}${path}`
  return body ? { url: completeUrl, headers, body } : { url: completeUrl, headers }
}

// Funzione che prende in ingresso metodo HTTP, url, headers ed eventuale body della chiamata HTTP e restituisce un oggetto formato da data e error in base all'esito della chiamata
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
 * funzione che si occupa di fare chiamate GET
 * @param {Object} config Oggetto di configurazione per eseguire la chiamata GET
 * @returns {Object} Oggetto contenente la risposta o l'eventuale errore della chiamata
 */
const getResource = async ({ savedUrl, ...options }) => {
  const { url, headers } = resourcesBaseOperations(savedUrl, options)
  const response = await executeRequest({ fullResponse: options.fullResponse, method: 'get', url, headers })
  return response
}

/**
 * funzione che si occupa di fare chiamate POST
 * @param {Object} config Oggetto di configurazione per eseguire la chiamata POST
 * @returns {Object} Oggetto contenente la risposta o l'eventuale errore della chiamata
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
 * funzione che si occupa di fare chiamate PUT
 * @param {Object} config Oggetto di configurazione per eseguire la chiamata PUT
 * @returns {Object} Oggetto contenente la risposta o l'eventuale errore della chiamata
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
 * funzione che si occupa di fare chiamate DELETE
 * @param {Object} config Oggetto di configurazione per eseguire la chiamata DELETE
 * @returns {Object} Oggetto contenente la risposta o l'eventuale errore della chiamata
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
