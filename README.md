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

-   GET `/profile/:personaID`

-   GET `/item/:itemID`
