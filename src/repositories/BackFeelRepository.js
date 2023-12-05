import {BaseRepository} from "./BaseRepository";

export class BackFeelRepository extends BaseRepository {
    constructor() {
        super('element');

        this._url = 'https://kraton.ru/local/rest';
    }

    /**
     * @return Object
     */
    async add(payload, options) {
        const result = await this._query({
            payload,
            options,
            nestedEndpoint : 'add/'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }


}
