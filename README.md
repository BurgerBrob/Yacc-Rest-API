# Yacc Rest API
Just me trying to figure out how to create a fullstack chat application
- [Yacc Rest API](#yacc-rest-api)
  - [Routes](#routes)
    - [Message](#message)
      - [POST](#post)
        - [Example request body:](#example-request-body)
        - [Parameters:](#parameters)
      - [GET](#get)
        - [Example request body:](#example-request-body-1)
        - [Parameters:](#parameters-1)
    - [Messages](#messages)
      - [GET](#get-1)
        - [Example request body:](#example-request-body-2)
        - [Parameters:](#parameters-2)
    - [token](#token)
      - [POST](#post-1)
        - [Example request body:](#example-request-body-3)
        - [Parameters:](#parameters-3)

## Routes
### Message
#### POST
Sends message to the chat

##### Example request body:
```
{
  "apiToken" : "163b20a9cf4a887f3c3cdb23fe85db96",
  "content" : "Hello World",
  "author" : "854a3cbee03a8efa82b20526ccc6b9a0"
}
```
##### Parameters:
- `apiToken`: The api token
- `content`: The content of the message
- `author`: The author of the message

#### GET
Gets a certain message by id

##### Example request body:
```
{
  "apiToken" : "163b20a9cf4a887f3c3cdb23fe85db96",
  "messageId" : "854a3cbee03a8efa82b20526ccc6b9a0"
}
```
##### Parameters:
- `apiToken`: The api token
- `messageId`: The id of the message

### Messages
#### GET
Gets all messages

##### Example request body:
```
{
  "apiToken" : "163b20a9cf4a887f3c3cdb23fe85db96"
}
```
##### Parameters:
- `apiToken`: The api token

### token
#### POST
Creates a new token
##### Example request body:
```
{
  "apiToken" : "163b20a9cf4a887f3c3cdb23fe85db96",
  "newToken" : "163b20a9cf4a887f3c3cdb23fe85db97",
  "newName" : "Lorem Ipsum",
  "getUser" : "true",
  "getMessages" : "true"
}
```
##### Parameters:
- `apiToken`: The api token
- `newToken`: The new token, must be 32 characters hex string
- `newName` : The name of the new token
- `getUser`(optional): if the new token has the right to get User
- `getUsers`(optional): if the new token has the right to get Users
- `createUser`(optional): if the new token has the right to create User
- `addToken`(optional): if the new token has the right to add token
- `getToken`(optional): if the new token has the right to get token
- `getTokens`(optional): if the new token has the right to get tokens
- `sendMessage`(optional): if the new token has the right to send message
- `getMessage`(optional): if the new token has the right to get message
- `getMessages`(optional): if the new token has the right to get messages
- `admin`(optional): gives the token every right 