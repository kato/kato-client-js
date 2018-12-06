import {InterceptorContainer} from "./interceptor";
import {getOptions, KatoClientOptions} from "./options";
import {Dispatcher} from "./dispatcher";
import {Parameter, Stub} from "./stub";

//存根缓存
const stubCache = {};

export class KatoClient {
  private readonly interceptors = new InterceptorContainer();
  use = this.interceptors.use.bind(this.interceptors);

  public readonly baseUrl: string;
  public readonly options: KatoClientOptions;
  public readonly dispatcher: Dispatcher;

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
      const stub = await this.fetchStub();
      for (const moduleStub of stub.modules) {
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
    return async function () {

    }
  }

  private async fetchStub(): Promise<Stub> {
    const stubUrl = this.baseUrl + 'stub.json';

    if (!stubCache[stubUrl]) {
      const res = await this.dispatcher({url: stubUrl});
      const stubJson = JSON.parse(res.data);
      stubCache[stubUrl] = stubJson;
    }

    return stubCache[stubUrl];
  }

  [methodName: string]: {
    [methodName: string]: Function
  } | any
}
