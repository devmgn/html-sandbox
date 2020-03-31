# HTML SANDBOX

## Requirements
- Node.js
- yarn

## Usage

### Development
```shell
$ yarn dev
```

### Production build
```shell
$ yarn build
```

## Resolving path
The following default values can be changed by editing `config.directory` in `package.json`

### Typescript
```typescript
import foo as bar from '@/baz'
```
Resolved path: `assets/js`  
`@` is the alias of the resolved path

### pug
```pug
img(src= require('assets/images/foo.jpg').default)
```

### sass
```sass
.foo
  background-image: url(~assets/images/foo.jpg)
```
