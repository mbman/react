import callable from './callable'

const combineArrayOfCallables = (target: any[], params) => {
  return target.reduce((acc, next) => {
    return Object.assign(acc, ...callable(next)(params))
  }, {})
}

export default combineArrayOfCallables
