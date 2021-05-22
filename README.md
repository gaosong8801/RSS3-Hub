# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## SDK

-   [RSS3-SDK-for-JavaScript](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

## API

-   GET `/files/:fid` - get a file

-   PUT `/files` - change a file

Body parameters

| Name     | Optional | Description                |
| -------- | -------- | -------------------------- |
| contents | false    | array of contents' objects |

-   DELETE `/files` - delete a file

Body parameters

| Name      | Optional | Description                  |
| --------- | -------- | ---------------------------- |
| signature | false    | signature of string `delete` |
