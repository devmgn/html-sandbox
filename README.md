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

##### SVG Sprite
Import the target svg file into your script.
```typescript
import 'path/to/file.svg?sprite'
```
The id for xlink:href is file name without extension.
```pug
svg
  use(xlink:href="#file")
```

#### SASS or SCSS
```sass
.foo
  background-image: url(~assets/images/foo.jpg)
```
