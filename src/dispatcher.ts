import axios from 'axios';

export type HttpRequest = {
  url: string,
  data?: {
    [key: string]: any
  },
  headers?: {
    [header: string]: string | string[] | undefined
  }
}

export type HttpResponse = {
  type?: string,
  statusCode: number,
  data: string,
  headers: {
    [header: string]: string | string[] | undefined
  }
}

export type Dispatcher = (req: HttpRequest) => Promise<HttpResponse>;

//默认分发器
export async function defaultDispatcher(req: HttpRequest): Promise<HttpResponse> {
  let res = await axios({
    method: "post",
    url: req.url,
    data: req.data,
    transformResponse: data => data
  });

  return {
    data: res.data,
    statusCode: res.status,
    type: res.headers['content-type'],
    headers: res.headers,
  }
}
