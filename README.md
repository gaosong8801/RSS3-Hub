# RSS3 Hub

A centralized implementation of [RSS3](https://github.com/NaturalSelectionLabs/RSS3)

## API

### Personas

- GET `/personas` - get all personas

- GET `/personas/:pid` - get a persona

- POST `/personas` - add a new persona

- PATCH `/personas/:pid`

- DELETE `/personas/:pid`

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
