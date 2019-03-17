//kato 错误基类
export class KatoError extends Error {
  //远程服务器上的堆栈错误
  public remoteStack: string;

  constructor(message: string = "未知错误", public code: number) {
    super(message);
    this.name = "KatoError"
  }
}

//kato 通用错误,错误码为0,这类错误可以直接显示给人类查看
export class KatoCommonError extends KatoError {
  constructor(message: string) {
    if (typeof message !== 'string') {
      console.error(`KatoCommonError用于通用错误的表示,请保证message参数的可阅读性`)
    }
    super(message, 0);
    this.name = 'KatoCommonError';
  }
}

//kato 逻辑错误,错误码>0,这类错误是需要客户端根据code来做不同处理的
export class KatoLogicError extends KatoError {
  constructor(message: string, code: number) {
    if (code <= 0) {
      console.error(`KatoLogicError仅仅使用于特殊的错误处理逻辑,根据规范,请保证错误编码>0`)
    }
    super(message, code)
  }
}

//kato 运行时错误,错误码为-1,这类错误属于框架错误,必须及时处理
export class KatoRuntimeError extends KatoError {
  constructor(message: string = "未知运行时错误") {
    super(message, -1);
    this.name = 'KatoRuntimeError';
  }
}

//权限验证异常
export class KatoAuthError extends KatoError {
  constructor(message: string = "不具备调用权限") {
    super(message, -2);
    this.name = 'KatoAuthError';
  }
}

//参数验证异常
export class KatoValidateError extends KatoError {
  constructor(message: string = "非法的API参数调用") {
    super(message, -3);
    this.name = 'KatoValidateError';
  }
}

