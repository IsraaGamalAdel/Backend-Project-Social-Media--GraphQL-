import * as dbService from '../../DB/db.service.js';


export const pagination =  async({
    page = process.env.PAGE ,
    size = process.env.SIZE,
    model,
    filter = {},
    populate = [],
    select = ''
} = {}) => {

    page = parseInt(parseInt(page) < 1 ? 1 : page);
    size = parseInt(parseInt(size) < 1 ? 1 : size);

    const skip = (page - 1) * size;

    const count = await model.find(filter).countDocuments();
    const result = await dbService.findAll({
        model,
        populate,
        select,
        filter,
        skip,
        limit: size
    })

    return {
        page,
        size,
        count,
        result
    }
};