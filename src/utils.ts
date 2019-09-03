import Mock from 'mockjs';

export const getInfo = (req, option, headers) => {
    let url = req._parsedUrl.href.replace(/^\//, '')
    return {
        url,
        data: option.mockData[url],
        method: req.method.toLowerCase(),
        urlKey: (url || '').replace(/\/$/, '').replace(/\//g, '_'),
        params: Object.assign({}, req.body || {}, req.query),
        headConfig: Object.assign(
            Object.assign(
                {
                    // 中文乱码
                    'Content-Type': 'text/html; charset=utf-8'
                },
                // 是否跨域
                option.crossDomain ? headers : {}
            ),
            option.headConfig
        )
    }
}
export const mockResult = (result) => {
    return result instanceof Object ? Mock.mock(result) : result
}
export class Http {
    res = null;
    constructor(res) {
        this.res = res
    }
    writeHead (code, header) {
        this.res.writeHead(code, header)
    }
    end (body) {
        this.res.end(typeof body === 'string' ? body : JSON.stringify(mockResult(body)))
    }
}
export default {
    getInfo,
    mockResult,
    Http
}
