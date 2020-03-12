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
img(src= require(foo.jpg).default)
```
Resolved path: `assets/images`  

### sass
```sass
.foo
  background-image: url(~bar.jpg)
```
Resolved path: `assets/images`  
`~` is the alias of the resolved path