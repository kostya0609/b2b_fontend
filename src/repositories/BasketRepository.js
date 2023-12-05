import {BaseRepository} from "./BaseRepository";

export class BasketRepository extends BaseRepository {
    constructor() {
        super('basket');
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

    /**
     * @return Object
     */
    async edit(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'edit'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

}
