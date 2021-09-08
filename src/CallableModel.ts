/**
 * Callable class
 */
export default abstract class CallableModel extends Function {
  __call (...args: any[]): any {
    throw new TypeError('Method "__call" must be implemented')
  }

  constructor () {
    super()
    return new Proxy(this, {
      apply: (target, thisArg, args) => target.__call(...args)
    })
  }
}
