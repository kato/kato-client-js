import * as queryString from 'query-string'
import {Context, InterceptorContainer} from "./interceptor";
import {getOptions, KatoClientOptions} from "./options";
import {Dispatcher} from "./dispatcher";
import {Parameter, Stub} from "./stub";
import {jsonParse, jsonStringify} from "./json";
import {KatoAuthError, KatoCommonError, KatoError, KatoLogicError, KatoRuntimeError, KatoValidateError} from "./error";


//存根缓存
const stubCache = {};

export class KatoClient {
  private readonly interceptors = new InterceptorContainer();
  use = this.interceptors.use.bind(this.interceptors);

  public readonly baseUrl: string;
  public readonly options: KatoClientOptions;
  public readonly dispatcher: Dispatcher;
  public stub: Stub;

  //是否已经初始化过了
  private inited = false;

  constructor()
  constructor(baseUrl: string)
  constructor(baseUrl: string, options: KatoClientOptions)
  constructor() {
    let baseUrl = "";
    let options = {};
    if (arguments.length === 1) {
      if (typeof arguments[0] === 'string') {
        baseUrl = arguments[0]
      } else {
        options = arguments[0]
      }
    } else if (arguments.length > 1) {
      baseUrl = arguments[0];
      options = arguments[1];
    }

    if (baseUrl !== '' && !baseUrl.endsWith('/'))
      baseUrl += '/';
    this.baseUrl = baseUrl;
    this.options = getOptions(options);
    this.dispatcher = this.options.dispatcher;
  }

  //初始化客户端,并返回一个api集合
  async init(): Promise<void> {
    if (!this.inited) {
      //获取存根信息
      this.stub = await this.fetchStub();
      for (const moduleStub of this.stub.modules) {
        const module = {};
        for (const methodStub of moduleStub.methods) {
          module[methodStub.name] = this.generateInvoker(moduleStub.name, methodStub.name, methodStub.parameters);
        }
        this[moduleStub.name] = module;
      }
      this.inited = true
    }
  }

  private generateInvoker(moduleName: string, methodName: string, parameters: Parameter[]): Function {
    const that = this;
    return async function (...args: any[]) {
      let resJson;
      try {
        //获取到所有的参数
        const data = {};
        //针对参数做映射
        args.forEach((it, index) => {
          if (parameters[index]) {
            data[parameters[index].name] = jsonStringify(it);
          }
        });
        const ctx: Context = {
          client: that,
          req: {
            url: `${that.baseUrl}${moduleName}/${methodName}.ac`,
            data: queryString.stringify(data),
            headers: {
              'content-type': 'application/x-www-form-urlencoded'
            }
          },
          res: null
        };

        //交给拦截器去处理
        await that.interceptors.do(ctx);

        //快速处理掉通用的错误
        if (ctx.res.statusCode !== 200)
          throw new KatoRuntimeError(`错误的HTTP状态码: ${ctx.res.statusCode}`);

        //如果返回的是空'',则直接返回未定义
        if (ctx.res.data === '')
          return undefined;

        //解析服务器上过来的结果
        resJson = jsonParse(ctx.res.data)
      } catch (e) {
        let err = e;
        if (!(e instanceof KatoError)) {
          //如果不是一个KatoError,可以将它转化为KatoError
          err = new KatoRuntimeError(e.message);
          err.stack = e.stack || '';
        }
        throw err
      }

      //将json做解析
      if (
        resJson &&
        resJson.hasOwnProperty('_KatoErrorCode_') &&
        resJson.hasOwnProperty('_KatoErrorMessage_') &&
        resJson.hasOwnProperty('_KatoErrorStack_')
      ) {
        //构造kato异常
        const code = resJson['_KatoErrorCode_'];
        const message = resJson['_KatoErrorMessage_'];
        const remoteStack = resJson['_KatoErrorStack_'];
        let err: KatoError;
        switch (code) {
          case -3:
            err = new KatoValidateError(message);
            break;
          case -2:
            err = new KatoAuthError(message);
            break;
          case -1:
            err = new KatoRuntimeError(message);
            break;
          case 0:
            err = new KatoCommonError(message);
            break;
          default:
            err = new KatoLogicError(message, code);
        }
        err.remoteStack = remoteStack;

        //抛出
        throw err
      } else {
        return resJson
      }
    }
  }

  private async fetchStub(): Promise<Stub> {
    const stubUrl = this.baseUrl + 'stub.json';

    if (!stubCache[stubUrl] || !this.options.cacheStub) {
      const res = await this.dispatcher({url: stubUrl});
      stubCache[stubUrl] = JSON.parse(res.data);
    }

    return stubCache[stubUrl];
  }

  [methodName: string]: {
    [methodName: string]: Function
  } | any
}


export * from './error'
