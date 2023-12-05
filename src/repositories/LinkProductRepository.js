import {BaseRepository} from "./BaseRepository";

export class LinkProductRepository extends BaseRepository {
    constructor() {
        super('rest');

        this._url = 'https://kraton.ru/local';
    }

    /**
     * @return Object
     */
    async linkProduct(payload, options) {
        const result = await this._query({
            payload,
            options,
            nestedEndpoint : 'link_product/'
        });

        if (result.status != 200 && result.status != 401)
            throw new Error(result.message);

        return result;
    }


}
