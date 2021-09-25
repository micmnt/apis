# Apis

Apis is a small library based on [Axios](https://axios-http.com/) to facilitate making HTTP calls, using a configuration object that maps the URLs to make requests and automatically adding a Bearer Token, straight from local-storage, in the request auth headers.

## Index

- [Usage](#usage)
- [Auth Token override](#auth-token-override)
- [URL placeholders update](#url-placeholders-update)
- [Passing GET parameters](#passing-get-parameters)
- [Reference](#reference)


## Usage

In this usage example, Apis is used to create a todo list app

```javascript
  import api from '../api'

  const baseApiUrl = 'https://mytodo.app'
  // URL mapping object to make requests
  // All the object items values are concatenated to the baseUrl
  const urls = {
    'todo': '/todo' 
    'all': 'todo/all'
  }

  // Apis Initialization
  api.init({
    baseUrl: baseApiUrl,
    savedUrls: urls,
    jwtTokenName: 'jwt-token-name'
  })

  // Function that makes a GET request to retrieve all todos
  const getAllTodos = async () => {
    const {data: todos, error} = await api.get({savedUrl: 'all'})

    if(error) {
      return null
    }

    return todos
  }

  // Function that makes a GET request to retrieve a single todo
  const getSingleTodo = async (todoId) => {
    const {data: todoItem, error} = await api.get({savedUrl: 'todo', path: `/${todoId}`})

    if(error) {
      return null
    }

    return todoItem
  }

  // Function that makes a POST request to create a new todo
  const createTodo = async (todo) => {
    const {data: createdTodo, error} = await api.post({savedUrl: 'todo', body: todo})

    if(error) {
      return null
    }

    return createdTodo
  }

  // Function that makes a PUT request to edit a todo
  const editTodo = async (todo, todoId) => {
    const {data: modifiedTodo, error} = await api.put({savedUrl: 'todo', path: `/${todoId}`, body: todo})

    if(error) {
      return null
    }

    return modifiedTodo
  }

  // Function that makes a DELETE request to delete a todo
  const deleteTodo = async (todoId) => {
    const {data: deletedTodo, error} = await api.delete({savedUrl: 'todo', path: `${todoId}`})

    if(error) {
      return null
    }

    return deletedTodo
  }
```

## Auth Token override

Apis allows for every request, when necessary, to override the automatically added token, with a new one

There are two ways to do it

1. using the `auth` parameter, passing the new token manually
2. using the `disableAuth` parameter, completely ignoring the `authorization` header in the HTTP request

```javascript
  // Manually overriding auth token
  const otherUserToken = 'Bearer <JWT_TOKEN>'
  
  // Function that retrieves other user's todos, using his JWT token
  const getOtherUserTodos = async () => {
    const {data: todos, error} = await api.get({savedUrl: 'all', auth: otherUserToken})

    if(error) {
      return null
    }

    return todos
  }

  // Completely disabling the HTTP request authorization header
  // Function that retrieves all public todos, that do not need authorization
  const getPublicTodos = async () => {
    const {data: publicTodos, error} = await api.get({savedUrl: 'all', disableAuth: true, path: '/public'})
  }
```

## URL placeholders update

Apis allows to have `placeholders` like `/:listId` in the mapped URLs object, and these can be updated dinamically in case these are computed later in the code

`placeholders` update can be done in two ways:

1. At initialization stage, using the `placeholders` key in the configuration object

2. using the `updatePlaceholders` function

In this example every user can have multiple todo lists

```javascript
  const baseApiUrl = 'https://mytodo.app'
  const baseList = '/list/defaultList'

  const urls = {
    'myLists': '/lists'
    'todo': '/:listId/todo',
    'all': '/:listId/all'
  }

  // Initializing Apis with configuration object
  api.init({
    baseUrl: baseApiUrl,
    savedUrls: urls,
    jwtTokenName: 'jwt-token-name',
    placeholders: {listId: baseList}
  })

  // Function that retrieves all todo lists belonging to the current user
  const getAllLists = async () => {
    const {data: lists, error} = await api.get({savedUrl: 'myList'})
    if(error) {
      return null
    }

    return lists
  }

  // Function that sets the list that the user wants to see
  const changeList = async (listId) => {
    // Take all lists
    const lists = await getAllLists()

    if(lists) {
      const currentList = lists.find(list => list.id === listId)
      if(currentList) {
        // Updating URLs with the new placeholder value for the selected list
        api.updatePlaceholders({listId: currentList.id})
      }
    }
  }

```

## Passing GET parameters


It's possible to pass GET parameters in two ways:

1. Writing them directly in the `path` key. Ex: `(?param1=value1&param2=value2)`

2. Using the `params` key

```javascript

  // Retrieving first 10 todos writing the 'skip' and 'limit' params directly in `path` key
  const getFirstTenTodos = async () => {
    const {data: todos, error} = await api.get({savedUrl: 'all', path: '/?skip=0&limit=10'})

    if(error) {
      return null
    }

    return todos
  }
  
  // Retrieving first 20 todos using 'params' key
  const getFirstTwentyTodos = async () => {
    const queryParams = {
      skip: 0,
      limit: 20
    }

    const {data: todos, error} = await api.get({savedUrl: 'all', params: queryParams})

    if(error) {
      return null
    }

    return todos
  }

```

## Reference

Apis parameters and functions documentation


> `api.init({ baseUrl = null, jwtTokenName = null, savedUrls = {}, placeholders = null })`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | ----------- | ---- | --- |
| baseUrl   |  `null`        | `https://api.mytodos.com` | Base URL for all the requests | :white_check_mark: |
| jwtTokenName | `null`      | `my-todos-accessToken` | JWT token name to look for in local storage | :x: |
| savedUrls | `{}`           | `{todo: '/:listId/todo'}` | Configuration Object containing the URL mapping to make HTTP requests | :white_check_mark: |
| placeholders | `null`      | `{listId: '/lists/1'}` | Object containing the placeholders values to switch in URLs | :x: |


> `api.updatePlaceholders(placeholders = null)`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | -------------------- | ----------- | -------- |
| placeholders | `null` | `{listId: '/lists/1'}` | Object containing the placeholders values to switch in URLs | :white_check_mark: |


> `api.get({savedUrl, fullResponse = false, responseType = null, params = null, auth = null, disableAuth = null, path = null, customHeaders = []})`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | -------------------- | ----------- | -------- |
| savedUrl  |  | `'todos'` | Name to identify a specific URL | :white_check_mark: |
| fullResponse | `false` | `true` &#124; `false` | Parameter to choose the complete response of the HTTP request or the data-unwrapped one | :x: |
| responseType | `null` | `blob` | Parameter to choose the response type | :x: |
| params | `null` | `{skip: 0,limit: 20}` | Object containing all GET parameters for the request | :x: |
| auth | `null` | `'Bearer 123-e45f33-authToken'` | Parameter to override the `authentication` header | :x: |
| disableAuth | `null` | `true` &#124; `false` | Parameter to skip the `authorization` header | :x: |
| path | `null` | `'/public'` | Parameter used to append path to the `baseUrl` | :x: |
| customHeaders | `[]` | `[{key: 'x-use-public-link',value: true}]` | Parameter to add custom headers | :x: |


> `api.post({savedUrl, fullResponse = false, responseType = null, params = null, auth = null, disableAuth = null, body = null, path = null, customHeaders = []})`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | -------------------- | ----------- | -------- |
| savedUrl  |  | `'todos'` | Name to identify a specific URL | :white_check_mark: |
| fullResponse | `false` | `true` &#124; `false` | Parameter to choose the complete response of the HTTP request or the data-unwrapped one | :x: |
| responseType | `null` | `blob` | Parameter to choose the response type | :x: |
| params | `null` | `{skip: 0,limit: 20}` | Object containing all GET parameters for the request | :x: |
| auth | `null` | `'Bearer 123-e45f33-authToken'` | Parameter to override the `authentication` header | :x: |
| disableAuth | `null` | `true` &#124; `false` | Parameter to skip the `authorization` header | :x: |
| body | `null` | `{id: 1, text: 'Fare la lavatrice'}` | Parameter to set the request's body to send to the server | :x: |
| path | `null` | `'/public'` | Parameter used to append path to the `baseUrl` | :x: |
| customHeaders | `[]` | `[{key: 'x-use-public-link',value: true}]` | Parameter used to append path to the `baseUrl` | :x: |

> `api.put({savedUrl, fullResponse = false, responseType = null, params = null, auth = null, disableAuth = null, body = null, path = null, customHeaders = []})`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | -------------------- | ----------- | -------- |
| savedUrl  |  | `'todos'` | Name to identify a specific URL | :white_check_mark: |
| fullResponse | `false` | `true` &#124; `false` | Parameter to choose the complete response of the HTTP request or the data-unwrapped one | :x: |
| responseType | `null` | `blob` | Parameter to choose the response type | :x: |
| params | `null` | `{skip: 0,limit: 20}` | Object containing all GET parameters for the request | :x: |
| auth | `null` | `'Bearer 123-e45f33-authToken'` | Parameter to override the `authentication` header | :x: |
| disableAuth | `null` | `true` &#124; `false` | Parameter to skip the `authorization` header | :x: |
| body | `null` | `{id: 1, text: 'Fare la lavatrice'}` | Parameter to set the request's body to send to the server| :x: |
| path | `null` | `'/public'` | Parameter used to append path to the `baseUrl` | :x: |
| customHeaders | `[]` | `[{key: 'x-use-public-link',value: true}]` | Parameter used to append path to the `baseUrl` | :x: |

> `api.delete({savedUrl, fullResponse = false, responseType = null, params = null, auth = null, disableAuth = null, path = null, customHeaders = []})`

| Parameter | Default Value | Structure example | Description | Required |
| --------- | -------------- | -------------------- | ----------- | -------- |
| savedUrl  |  | `'todos'` | Name to identify a specific URL | :white_check_mark: |
| fullResponse | `false` | `true` &#124; `false` | Parameter to choose the complete response of the HTTP request or the data-unwrapped one | :x: |
| responseType | `null` | `blob` | Parameter to choose the response type | :x: |
| params | `null` | `{skip: 0,limit: 20}` | Object containing all GET parameters for the request | :x: |
| auth | `null` | `'Bearer 123-e45f33-authToken'` | Parameter to override the `authentication` header | :x: |
| disableAuth | `null` | `true` &#124; `false` | Parameter to skip the `authorization` header | :x: |
| path | `null` | `'/public'` | Parameter used to append path to the `baseUrl` | :x: |
| customHeaders | `[]` | `[{key: 'x-use-public-link',value: true}]` | Parameter used to append path to the `baseUrl` | :x: |