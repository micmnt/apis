import { AxiosError, AxiosResponse, ResponseType } from 'axios'

export type InterceptorFunction = (err: AxiosError) => {}

export interface IKeyStringMap {
  [key: string]: string
}

export interface IBaseResponse {
  data: null | object,
  error: null | AxiosError
}

export interface IResourceOptions {
  body?: IKeyStringMap | null,
  responseType?: ResponseType | null,
  params?: IKeyStringMap | null,
  auth?: string | null,
  disableAuth?: boolean | null,
  path?: string | null,
  customHeaders?: IKeyStringMap[] | null,
  fullResponse?: boolean
}

export type Headers = {
  headers?: IKeyStringMap,
  params?: IKeyStringMap,
  responseType?: ResponseType
}

export type ResourceBaseResponse = {
  url: string,
  headers: Headers,
  body?: IKeyStringMap | null
}

export type InitFunction = (config: {
  baseUrl: null | string,
  jwtTokenName?: null | string,
  authType?: string,
  authToken?: string,
  savedUrls?: IKeyStringMap,
  placeholders?: IKeyStringMap | null,
  errorInterceptor?: null | InterceptorFunction
}) => void

export type PrepareResourcesFunction = (config: {
  urlsConfig: IKeyStringMap,
  baseUrl: null | string,
  placeholders: IKeyStringMap | null
}) => IKeyStringMap

export type CreateHeadersFunction = (
  params?: null | IKeyStringMap,
  overrideAuthToken?: null | string,
  disableAuth?: boolean | null,
  customHeaders?: IKeyStringMap[] | null,
  responseType?: ResponseType | null,
  tokenName?: null | string,
  authType?: string | null
) => Headers

export type ResourceBaseOperationsFunction = (
  resources: IKeyStringMap | null,
  jwtToken: string | null,
  resource: string | null,
  authType: string | null | undefined,
  options: IResourceOptions
) => ResourceBaseResponse

export type ExecuteRequestFunction = (config: {
  fullResponse?: boolean,
  method?: string,
  url: string,
  headers: Headers,
  body?: IKeyStringMap | null,
  errorInterceptor?: InterceptorFunction | null
}) => Promise<IBaseResponse>

export type ReplacePlaceholdersFunction = (url: string | null, placeholders: IKeyStringMap | null) => string

export type DeleteOptions = {
  headers: IKeyStringMap,
  params?: IKeyStringMap,
  responseType?: ResponseType,
  data: string | IKeyStringMap | null
}

export type GetAxiosRequest = (method: string, url: string, headers: Headers, body: IKeyStringMap | null) => Promise<AxiosResponse | null>

export type ResourceFunction = (config: {
  savedUrl: string,
} & IResourceOptions) => Promise<IBaseResponse>