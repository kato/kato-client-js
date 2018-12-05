import {HttpRequest, HttpResponse} from "./dispatcher";
import {KatoClient} from "./index";

export type Context = {
  client: KatoClient,
  req: HttpRequest,
  res: HttpResponse
}
export type Interceptor = (ctx?: Context, next?: Interceptor) => Promise<void>

export class InterceptorContainer {
  //存储所有的拦截器
  private readonly interceptors: Interceptor[] = [];

  //添加一个拦截器
  use(interceptor: Interceptor) {
    this.interceptors.push(interceptor)
  }

  //执行所有的拦截器
  async do(ctx: Context) {
    let currentInterceptorIndex = 0;

    const next = async () => {
      const nextInterceptor = this.interceptors[currentInterceptorIndex];

      if (typeof nextInterceptor === "function") {
        await nextInterceptor.call(null, ctx, next);
      } else {
        //所有的interceptors已经进入完,开启进入请求分发器
        ctx.res = await ctx.client.dispatcher(ctx.req)
      }
    };

    await next();
  }
}
