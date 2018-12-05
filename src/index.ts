import {InterceptorContainer} from "./interceptor";
import {getOptions, KatoClientOptions} from "./options";
import {Dispatcher} from "./dispatcher";

type API = {
  [methodName: string]: {
    [methodName: string]: Function
  }
}

export type Parameter = {
  name: string,
  type: string
}
export type Method = {
  name: string,
  parameters: Parameter[]
}
export type Module = {
  name: string,
  methods: Method[]
}
export type Stub = {
  modules: Module[]
}

//存根缓存
const stubCache = {};

export class KatoClient {
  private readonly interceptorContainer = new InterceptorContainer();
  use = this.interceptorContainer.use.bind(this.interceptorContainer);

  public readonly baseUrl: string;
  public readonly options: KatoClientOptions;
  public readonly dispatcher: Dispatcher;

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
  async init(): Promise<API> {
    //获取存根信息
    const stub = await this.fetchStub();
    const apis = {};
    for (const moduleStub of stub.modules) {
      const module = {};
      for (const methodStub of moduleStub.methods) {
        module[methodStub.name] = this.generateInvoker(moduleStub.name, methodStub.name, methodStub.parameters);
      }
      apis[moduleStub.name] = module;
    }
    return apis;
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
}
