// Dummy - tsbean-orm class (auto generated)

"use strict";

import { DataModel, enforceType, TypedRow, DataSource, DataFinder, DataFilter, OrderBy, SelectOptions, DataUpdate } from "../../src/index";

const DATA_SOURCE = DataSource.DEFAULT;
const TABLE = "dummy";
const PRIMARY_KEY = "id";

export class Dummy extends DataModel {

    public static finder = new DataFinder<Dummy>(DATA_SOURCE, TABLE, PRIMARY_KEY, (data: TypedRow<Dummy>) => { return new Dummy(data) });

    public id: string;
    public value1: number;
    public value2: number;
    public value3: string;
    public data: { [key: string]: any };

    constructor(data: TypedRow<Dummy>) {
        // First, we call DataModel constructor 
        super(DATA_SOURCE, TABLE, PRIMARY_KEY);

        // Second, we set the class properties
        // The recommended way is to set one by one to prevent prototype pollution
        // You can also enforce the types if you do not trust the data source
        // In that case you can use the enforceType utility function

        this.id = enforceType(data.id, "string");
        this.value1 = enforceType(data.value1, "int");
        this.value2 = enforceType(data.value2, "number");
        this.value3 = enforceType(data.value3, "string");
        this.data = enforceType(data.data, "object");

        // Finally, we must call init()
        this.init();
    }
}
