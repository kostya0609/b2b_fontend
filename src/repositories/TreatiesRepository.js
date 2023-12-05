import {BaseRepository} from "./BaseRepository";

export class TreatiesRepository extends BaseRepository {
    constructor() {
        super('treaties');
    }

    /**
     * @return Object
     */
    async update(payload) {
        const result = await this._query({
            nestedEndpoint : 'update',
            payload
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

    /**
     * @return Object
     */
    async updateDZ(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'update-dz'
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

    /**
     * @return Object
     */
    async getDZ(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'get-dz'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

}
