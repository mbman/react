const reduceArrayOfArrays = (target: any[] | {}, search) => {
  if (Array.isArray(target)) {
    return target.reduce((acc, next) => {
      if (next[search]) {
        acc.push(next[search])
      }
      return acc
    }, [])
  }
  return [].concat(target[search])
}

export default reduceArrayOfArrays
