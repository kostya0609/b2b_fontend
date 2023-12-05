/**
 * Базовый класс для всех репозиториев
 */
export class BaseRepository {
    /** @var {string} _url адрес api */
    _url = 'https://api.kraton.ru/b2b';
    //'production' ? `${window.location.origin}/api/process-test` : 'http://192.168.25.227/process-test';


    /** @var {string} _version версия api на бэке */
    _version = '';


    /** @var {string} _endpoint сущность, над которой будем работать */
    _endpoint = '';

    /**
     * @param {string} endpoint
     * @param {string} version
     */
    constructor(endpoint, version = '') {
        this._endpoint = endpoint;
        this._version = version;
    }

    /**
     * nestedEndpoint?: string
     * @returns {module:url.URL}
     */
    _buildUrl(nestedEndpoint){
        return new URL(`${this._url}/${this._endpoint}` + (nestedEndpoint ? `/${nestedEndpoint}` : ''));
    }

    /**
     * @param {{
     * 	method?: 'GET'|'POST'|'PATCH'|'DELETE'
     * 	nestedEndpoint?: string
     * 	payload?: object
     * 	options?: object
     * }} param0
     * @returns {any}
     */
    async _query({
                     method= 'POST',
                     nestedEndpoint= '',
                     payload= null,
                     options= {download_file : false, kraton : false},
                     params= {}
                 } = {}) {

        const url = this._buildUrl(nestedEndpoint);

        let init = { method };

        if (params) {
            Object
                .entries(params)
                .forEach(([name, value]) => {
                    if (value) {
                        url.searchParams.append(name, value);
                    }
                });
        }
        let headers = {
                'Content-Type'  : 'application/json;charset=utf-8',
            };

        if(!options.kraton) {
            headers['Authorization'] = `Bearer ${window.localStorage.getItem('b2b_client_token')}`;
        } else {
            headers['HTTP_HASH'] = 'f6ffc64fa51d4bfa9952f27983733f37';
        }

        if (payload) {
            let isFormData = payload instanceof FormData;

            init = {
                ...init,
                body    : isFormData ? payload : JSON.stringify(payload),
                headers : isFormData ? {} : headers
            };
        } else {
            init = {
                ...init,
                headers,
            };
        }

        const response = await fetch(url.href, init);

        if (response.status == 401) {
            window.localStorage.removeItem('b2b_client_token');
            window.localStorage.removeItem('b2b_client_id');
            window.localStorage.removeItem('b2b_discount');
        }

        if(options.download_file) return response;
            else {
                let status = response.status;
                let body   = await response.json();
                return {body, status}
            }

    }

}
