# HTML SANDBOX

## Requirements
- Node.js
- yarn

## Usage

### Development
```shell
$ yarn start
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
Default resolved path: `assets/js`
*`@` is the alias of the resolved path

### Images
#### pug
#### Normal image
```pug
img(src= require('assets/images/foo.jpg'))
```

##### inline SVG
```pug
!= require('path/to/file.svg?inline')
```

#### SCSS
```scss
.foo {
  background-image: url(assets/images/foo.jpg)
}
```
