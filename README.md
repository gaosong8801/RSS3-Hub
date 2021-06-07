# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## SDK

-   [RSS3-SDK-for-JavaScript](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

## API

-   GET `/:fid` - get a file

-   PUT `/` - change a file

Body parameters

| Name     | Optional | Description                                                                   |
| -------- | -------- | ----------------------------------------------------------------------------- |
| contents | false    | array of contents' objects, must be one file or a series of consecutive files |

-   DELETE `/` - delete a persona

Body parameters

| Name      | Optional | Description                                                       |
| --------- | -------- | ----------------------------------------------------------------- |
| date      | false    | current date in RFC 3339 format, eg: '2021-06-01T00:00:00.000Z'   |
| signature | false    | signature of string `Delete RSS3 Persona ${personaID} at ${date}` |
