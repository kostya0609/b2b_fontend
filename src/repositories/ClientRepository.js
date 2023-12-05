import {BaseRepository} from "./BaseRepository";

export class ClientRepository extends BaseRepository {
    constructor() {
        super('client');
       // this._url = 'https://bitrix.bsi.local/api/accesses';
    }

    /**
     * @return Object
     */
    async refresh() {
        const result = await this._query({
            nestedEndpoint : 'refresh'
        });

        if (result.status != 200 && result.status != 401)
           throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async login(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'login'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async register(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'register'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async get(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'get'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

}
