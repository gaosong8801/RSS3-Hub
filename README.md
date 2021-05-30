# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## SDK

-   [RSS3-SDK-for-JavaScript](https://github.com/NaturalSelectionLabs/RSS3-SDK-for-JavaScript)

## API

### Authorization

#### Signature in header

Authentication is required for all requests except GET method, which are authenticated by the `signature` parameter in the request header

`signature` is is calculated from request path, request body and persona's private key: sign `keccak256(requestMethod + requestPath + requestBody)` with persona's private key, then put the result as `signature` parameter to the the request header

```js
import EthCrypto from 'eth-crypto';

const message = ctx.method + ctx.path + ctx.request.body[unparsed];
const signature = EthCrypto.sign(privateKey, EthCrypto.hash.keccak256(message));
```

When creating new persona, the client needs to generate an identity, refer to [here](https://github.com/pubkey/eth-crypto#createidentity)

#### Signature in body

Every file has a `signature`, and the signed message is an alphabetical array of JSON string-keyed property `[key, value]` pairs for the file
When modifying a file, the modified signature should be included in the body as `fileSig`, and if there are multiple file modifications, such as two pages, the two signatures should be separated by a comma

Some objects have their own `signature`, such as `item` `profile` `link`, and the signed message is an alphabetical array of JSON string-keyed property `[key, value]` pairs for the object
When modifying those objects, the modified signature should be included in the body as `signature`

### File

-   GET `/file/:fid` - get a file

### Persona

-   POST `/persona` - add a new persona

Body parameters

| Name    | Optional |
| ------- | -------- |
| fileSig | false    |

-   DELETE `/persona` - delete a persona

### Profile

-   GET `/profile/:pid` - get a profile

-   PATCH `/profile` - change a profile

Body parameters

| Name      | Optional |
| --------- | -------- |
| fileSig   | false    |
| name      | true     |
| avatar    | true     |
| bio       | true     |
| signature | false    |

### Items

-   GET `/items/:iid` - get a item

-   POST `/items` - add a item to a persona

Body parameters

| Name      | Optional | Description        |
| --------- | -------- | ------------------ |
| fileSig   | false    |                    |
| authors   | true     | Default to `[pid]` |
| title     | true     |                    |
| summary   | true     |                    |
| tags      | true     |                    |
| contents  | true     |                    |
| signature | false    |                    |

-   PATCH `/items/:tid` - change a item of a persona

Url parameters

| Name | Optional | Description                                                                                            |
| ---- | -------- | ------------------------------------------------------------------------------------------------------ |
| id   | true     | file id of items file, filling in to speed up search process, empty to search it from the persona file |

Body parameters

| Name      | Optional |
| --------- | -------- |
| fileSig   | false    |
| authors   | true     |
| title     | true     |
| summary   | true     |
| tags      | true     |
| contents  | true     |
| signature | false    |

-   DELETE `/items/:tid` - delete a item of a persona. Indexes of items cannot be deleted, so it is equivalent to changing the item to an object with only id and signature

Url parameters

| Name | Optional | Description   |
| ---- | -------- | ------------- |
| id   | true     | Same as PATCH |

Body parameters

| Name      | Optional |
| --------- | -------- |
| fileSig   | false    |
| signature | false    |

### Links

-   POST `/links` - add a link to a persona

Body parameters

| Name    | Optional |
| ------- | -------- |
| fileSig | false    |
| name    | true     |
| tags    | true     |
| list    | true     |

-   PATCH `/links/:lid` - change a link of a persona

Body parameters

| Name    | Optional |
| ------- | -------- |
| fileSig | false    |
| name    | true     |
| tags    | true     |
| list    | true     |

-   DELETE `/links/:lid` - delete a link of a persona

Body parameters

| Name    | Optional |
| ------- | -------- |
| fileSig | false    |
