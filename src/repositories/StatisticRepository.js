import {BaseRepository} from "./BaseRepository";

export class StatisticRepository extends BaseRepository {
    constructor() {
        super('statistic');
    }

    /**
     * @return Object
     */
    async update(payload) {
        const result = await this._query({
            payload,
            nestedEndpoint : 'update'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }

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
