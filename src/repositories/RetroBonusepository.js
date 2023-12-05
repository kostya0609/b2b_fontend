import {BaseRepository} from "./BaseRepository";

export class RetroBonusRepository extends BaseRepository {
    constructor() {
        super('retro-bonus');
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
    async get(payload) {
        const result = await this._query({
            nestedEndpoint : 'get',
            payload
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

}
