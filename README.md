# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## API

### Authorization

Authentication is required for all requests except GET method, which are authenticated by the `sign` parameter in the request header

`sign` is is calculated from request path, request body and persona's private key: sign `md5(requestPath + requestBody)` with persona's private key, then put the result as `signature` parameter to the the request header

```js
import secp256k1 from 'secp256k1';
import hash from 'object-hash';

function Hex2Uint8Array(hex) {
    const integers = hex.match(/[\dA-F]{2}/gi).map((s) => parseInt(s, 16));
    return new Uint8Array(integers);
}
function Uint8Array2Hex(u8a) {
    return [...new Uint8Array(u8a.buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function getSignature() {
    const message = hash(requestPath + requestBody, {
        algorithm: 'md5',
    });
    const sign = secp256k1.ecdsaSign((new TextEncoder()).encode(message), Hex2Uint8Array(privatekey));
    return Uint8Array2Hex(sign.signature);
}
```

When creating new persona, there is no public key and private key, so the client needs to generate a pair of them, refer to [here](https://github.com/cryptocoinjs/secp256k1-node#private-key-generation-public-key-creation-signature-creation-signature-verification)

### Personas

- GET `/personas/:pid` - get a persona

- POST `/personas` - add a new persona

Body parameters

| Name   | Optional |
| ------ | -------- |
| id     | false    |
| name   | true     |
| avatar | true     |
| bio    | true     |

- PATCH `/personas/:pid` - change a persona

Body parameters

| Name   | Optional |
| ------ | -------- |
| name   | true     |
| avatar | true     |
| bio    | true     |

- DELETE `/personas/:pid` - delete a persona

### Items

- GET `/personas/:pid/items` - get items of a persona

Url parameters

| Name | Optional | Description                                                               |
| ---- | -------- | ------------------------------------------------------------------------- |
| id   | true     | file id of items file, empty for returning the data from the persona file |

- POST `/personas/:pid/items` - add a item to a persona

Body parameters

| Name     | Optional | Description        |
| -------- | -------- | ------------------ |
| authors  | true     | Default to `[pid]` |
| title    | true     |                    |
| summary  | true     |                    |
| tags     | true     |                    |
| contents | true     |                    |

- PATCH `/personas/:pid/items/:tid` - change a item of a persona

Url parameters

| Name | Optional | Description                                                                                            |
| ---- | -------- | ------------------------------------------------------------------------------------------------------ |
| id   | true     | file id of items file, filling in to speed up search process, empty to search it from the persona file |

Body parameters

| Name     | Optional |
| -------- | -------- |
| authors  | true     |
| title    | true     |
| summary  | true     |
| tags     | true     |
| contents | true     |

- DELETE `/personas/:pid/items/:tid` - delete a item of a persona

Url parameters

| Name | Optional | Description   |
| ---- | -------- | ------------- |
| id   | true     | Same as PATCH |

### Links

- POST `/personas/:pid/links` - add a link to a persona

Body parameters

| Name     | Optional |
| -------- | -------- |
| name     | true     |
| tags     | true     |
| list     | true     |

- PATCH `/personas/:pid/links/:lid` - change a link of a persona

Body parameters

| Name     | Optional |
| -------- | -------- |
| name     | true     |
| tags     | true     |
| list     | true     |

- DELETE `/personas/:pid/links/:lid` - delete a link of a persona
