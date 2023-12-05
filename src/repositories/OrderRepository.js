import {BaseRepository} from "./BaseRepository";

export class OrderRepository extends BaseRepository {
    constructor() {
        super('order');
    }

    /**
     * @return Object
     */
    async history(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'history'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async add(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'add'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async discount(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'discount'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

}
