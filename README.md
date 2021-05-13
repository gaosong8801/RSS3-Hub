# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## API

All request bodies should be the application/x-www-form-urlencoded content type

### Authorization

Authentication is required for all requests except GET method, which are authenticated by the `sign` parameter in the request body

`sign` is is calculated from request path, request body and persona's private key: sign `md5(requestPath + requestBody)` with persona's private key, then put the result as `sign` parameter to the end of the request body

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

Exclusive body parameters

| Name   | Optional |
| ------ | -------- |
| id     | false    |
| name   | true     |
| avatar | true     |
| bio    | true     |

- PATCH `/personas/:pid` - change a persona

| Name   | Optional |
| ------ | -------- |
| name   | true     |
| avatar | true     |
| bio    | true     |

- DELETE `/personas/:pid` - delete a persona

### Items

- GET `/personas/:pid/items`

?page=

- POST `/personas/:pid/items`

- PATCH `/personas/:pid/items/:tid`

?page=

- DELETE `/personas/:pid/items/:tid`

?page=

## Links

- POST `/personas/:pid/links`

- PATCH `/personas/:pid/links/:lid`

- DELETE `/personas/:pid/links/:lid`
