// Finder
// (Typescript Bean ORM)

"use strict";

import { GenericFilter, ModelKeyName, GenericKeyValue, SortDirection, GenericValue, TypedRow, StrictRowUpdate } from "./common";
import { DataAccessObject } from "./dao";
import { QueryExtraOptions } from "./data-source-driver";
import { escapeRegExp } from "./util";

/**
 * Data filter generator
 */
export class DataFilter<T = any> {

    /**
     * Require all conditions to match
     * @param args conditions
     */
    public static and<T = any>(...args: DataFilter<T>[]): DataFilter<T> {
        const res: GenericFilter = {
            operation: "and",
            children: [],
        };

        for (const arg of args) {
            res.children.push(arg.query);
        }

        return new DataFilter(res);
    }

    /**
     * Require one of the conditions to match
     * @param args conditions
     */
    public static or<T = any>(...args: DataFilter<T>[]): DataFilter<T> {
        const res: GenericFilter = {
            operation: "or",
            children: [],
        };

        for (const arg of args) {
            res.children.push(arg.query);
        }

        return new DataFilter(res);
    }

    /**
     * Negates the condition
     * @param arg condition
     */
    public static not<T = any>(arg: DataFilter<T>): DataFilter<T> {
        return new DataFilter({ operation: "not", child: arg.query });
    }

    /**
     * Requires key == value
     * @param key The key
     * @param value The value
     */
    public static equals<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "eq", key: key, value: value });
    }


    /**
     * Requires key != value
     * @param key The key
     * @param value The value
     */
    public static notEquals<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "ne", key: key, value: value });
    }

    /**
     * Requires key > value
     * @param key The key
     * @param value The value
     */
    public static greaterThan<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "gt", key: key, value: value });
    }

    /**
     * Requires key >= value
     * @param key The key
     * @param value The value
     */
    public static greaterOrEquals<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "gte", key: key, value: value });
    }

    /**
     * Requires key < value
     * @param key The key
     * @param value The value
     */
    public static lessThan<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "lt", key: key, value: value });
    }

    /**
     * Requires key <= value
     * @param key The key
     * @param value The value
     */
    public static lessOrEquals<T = any>(key: ModelKeyName<T>, value: GenericKeyValue): DataFilter<T> {
        return new DataFilter({ operation: "lte", key: key, value: value });
    }

    /**
     * Requires key in values
     * @param key The key
     * @param values The values
     */
    public static into<T = any>(key: ModelKeyName<T>, values: GenericKeyValue[]): DataFilter<T> {
        return new DataFilter({ operation: "in", key: key, values: values });
    }

    /**
     * Requires key == null
     * @param key The key
     * @param value The value
     */
    public static isNull<T = any>(key: ModelKeyName<T>): DataFilter<T> {
        return new DataFilter({ operation: "exists", key: key, exists: false });
    }

    /**
     * Requires key != null
     * @param key The key
     * @param value The value
     */
    public static isNotNull<T = any>(key: ModelKeyName<T>): DataFilter<T> {
        return new DataFilter({ operation: "exists", key: key, exists: true });
    }

    /**
     * Requires key.startsWith(value)
     * @param key The key
     * @param value The value
     * @param ignoreCase true to ignore case
     */
    public static startsWith<T = any>(key: ModelKeyName<T>, value: string, ignoreCase?: boolean): DataFilter<T> {
        let regex: RegExp;

        if (ignoreCase) {
            regex = new RegExp("^" + escapeRegExp(value) + "", "i");
        } else {
            regex = new RegExp("^" + escapeRegExp(value) + "", "");
        }

        return new DataFilter({ operation: "regex", key: key, regexp: regex });
    }

    /**
     * Requires key.endsWith(value)
     * @param key The key
     * @param value The value
     * @param ignoreCase true to ignore case
     */
    public static endsWith<T = any>(key: ModelKeyName<T>, value: string, ignoreCase?: boolean): DataFilter<T> {
        let regex: RegExp;

        if (ignoreCase) {
            regex = new RegExp("" + escapeRegExp(value) + "$", "i");
        } else {
            regex = new RegExp("" + escapeRegExp(value) + "$", "");
        }

        return new DataFilter({ operation: "regex", key: key, regexp: regex });
    }

    /**
     * Requires key.contains(value)
     * @param key The key
     * @param value The value
     * @param ignoreCase true to ignore case
     */
    public static contains<T = any>(key: ModelKeyName<T>, value: string, ignoreCase?: boolean): DataFilter<T> {
        let regex: RegExp;

        if (ignoreCase) {
            regex = new RegExp("" + escapeRegExp(value) + "", "i");
        } else {
            regex = new RegExp("" + escapeRegExp(value) + "", "");
        }

        return new DataFilter({ operation: "regex", key: key, regexp: regex });
    }

    /**
     * Finds anything (no conditions)
     */
    public static any(): DataFilter {
        return new DataFilter(null);
    }

    /**
     * Custom query
     * @param query The query
     */
    public static custom(query: GenericFilter): DataFilter {
        return new DataFilter(query);
    }

    public query: GenericFilter<ModelKeyName<T>>;

    constructor(query: GenericFilter<ModelKeyName<T>>) {
        this.query = query || null;
    }
}

/**
 * Order By
 */
export class OrderBy<T = any> {

    /**
     * Ascendant ordering
     * @param by Field to order by
     */
    public static asc<T = any>(by: ModelKeyName<T>): OrderBy<T> {
        return new OrderBy(by, "asc");
    }

    /**
     * Descendant ordering
     * @param by Field to order by
     */
    public static desc<T = any>(by: ModelKeyName<T>): OrderBy<T> {
        return new OrderBy(by, "desc");
    }

    /**
     * Do not sort
     */
    public static nothing(): OrderBy {
        return new OrderBy("", null);
    }

    public by: ModelKeyName<T> | "";
    public dir: SortDirection;

    constructor(by: ModelKeyName<T> | "", dir: SortDirection) {
        this.by = by;
        this.dir = dir;
    }
}

/**
 * Options for SELECT
 */
export class SelectOptions<T = any> {

    /**
     * @returns Configurable options 
     */
    public static configure<T = any>(): SelectOptions<T> {
        return new SelectOptions();
    }

    /**
     * @returns Default options 
     */
    public static default<T = any>(): SelectOptions<T> {
        return new SelectOptions();
    }

    public projection: Set<ModelKeyName<T>>;
    public skip: number;
    public limit: number;
    public queryExtraOptions: QueryExtraOptions;

    constructor() {
        this.projection = null;
        this.skip = -1;
        this.limit = -1;
        this.queryExtraOptions = {};
    }

    /**
     * Set first row (SKIP)
     * @param skip The first row (first index 0)
     */
    public setFirstRow(skip: number): this {
        this.skip = skip;
        return this;
    }

    /**
     * Set the max number of rows to fetch
     * @param limit The rows limit
     */
    public setMaxRows(limit: number): this {
        this.limit = limit;
        return this;
    }

    /**
     * Select only a few fields (SELECT a,b,...)
     * @param cols The cols to select
     */
    public fetchOnly(cols: ModelKeyName<T>[]): this {
        this.projection = new Set(cols);
        return this;
    }

    /**
     * Sets the name of the index to use
     * @param indexName Name of the index to use
     */
    public useIndex(indexName: string): this {
        this.queryExtraOptions.indexName = indexName;
        return this;
    }
}

/**
 * Strict data update
 * Pass to DataFinder.update
 */
export class DataUpdate {

    /**
     * Set value
     * @param value Value to set
     */
    public static set(value: GenericValue): DataUpdate {
        return new DataUpdate("set", value);
    }

    /**
     * Increment value
     * @param inc Increment to apply
     */
    public static increment(inc: number): DataUpdate {
        return new DataUpdate("inc", inc);
    }

    public update: "set" | "inc";
    public value: GenericValue;

    constructor(update: "set" | "inc", value: GenericValue) {
        this.update = update;
        this.value = value;
    }
}

/**
 * Data finder
 */
export class DataFinder<T, PK_Type = GenericKeyValue> {
    private source: string;
    private table: string;
    private key: ModelKeyName<T>;
    private dataParse: (data: TypedRow<T>) => T;

    /**
     * Constructor
     * @param source Name of the source 
     * @param table Name of the table
     * @param key Name of the primary key
     * @param dataParse Function to create DatModel from GenericRow
     */
    constructor(source: string, table: string, key: ModelKeyName<T>, dataParse: (data: TypedRow<T>) => T) {
        this.source = source;
        this.table = table;
        this.key = key;
        this.dataParse = dataParse;
    }

    /**
     * Find instance by key
     * @param keyValue The value of the primary key
     */
    public async findByKey(keyValue: PK_Type): Promise<T> {
        const data = await DataAccessObject.findByKey(this.source, this.table, this.key, keyValue);
        if (data) {
            return this.dataParse(data);
        } else {
            return null;
        }
    }

    /**
     * Find instances
     * @param where Conditions for the instances to match
     * @param orderBy Order of the results
     * @param options Additional options
     */
    public async find(where: DataFilter<T>, orderBy?: OrderBy<T>, options?: SelectOptions<T>): Promise<T[]> {
        const opts = options || (new SelectOptions());
        orderBy = orderBy || OrderBy.nothing();
        const data = await DataAccessObject.find(this.source, this.table, where.query, orderBy.by, orderBy.dir, opts.skip, opts.limit, opts.projection, opts.queryExtraOptions);
        if (data) {
            const result: T[] = [];
            for (const doc of data) {
                result.push(this.dataParse(doc));
            }
            return Promise.resolve(result);
        } else {
            return [];
        }
    }

    /**
     * Find instances (stream) / Async callback
     * @param where Conditions for the instances to match
     * @param orderBy Order of the results
     * @param options Additional options
     * @param each Callback for each row
     */
    public async findStream(where: DataFilter<T>, orderBy: OrderBy<T>, options: SelectOptions<T>, each: (row: T) => Promise<void>): Promise<void> {
        await DataAccessObject.findStream(this.source, this.table, where.query, orderBy.by, orderBy.dir, options.skip, options.limit, options.projection, options.queryExtraOptions, async function (doc) {
            await each(this.dataParse(doc))
        }.bind(this));
    }

    /**
     * Find instances (stream) / Sync callback
     * @param where Conditions for the instances to match
     * @param orderBy Order of the results
     * @param options Additional options
     * @param each Callback for each row
     */
    public async findStreamSync(where: DataFilter<T>, orderBy: OrderBy<T>, options: SelectOptions<T>, each: (row: T) => void): Promise<void> {
        await DataAccessObject.findStreamSync(this.source, this.table, where.query, orderBy.by, orderBy.dir, options.skip, options.limit, options.projection, options.queryExtraOptions, function (doc) {
            each(this.dataParse(doc))
        }.bind(this));
    }

    /**
     * Counts instances
     * @param where Conditions for the instances to match
     * @param useIndex Name of the index to use. Leave as null for the database to figure out automatically.
     */
    public async count(where: DataFilter<T>, queryExtraOptions?: QueryExtraOptions): Promise<number> {
        return DataAccessObject.count(this.source, this.table, where.query, queryExtraOptions || {});
    }

    /**
     * Summation for instances
     * @param field Field to compute summation
     * @param where Conditions for the instances to match
     */
    public async sum(field: ModelKeyName<T>, where: DataFilter<T>): Promise<number> {
        return DataAccessObject.sum(this.source, this.table, where.query, this.key, field);
    }

    /**
     * Delete instances
     * @param where Conditions for the instances to match
     */
    public async delete(where: DataFilter<T>): Promise<number> {
        return DataAccessObject.deleteMany(this.source, this.table, where.query);
    }

    /**
     * Update instances
     * @param set Changes to make
     * @param where Conditions for the instances to match
     */
    public async update(set: StrictRowUpdate<T>, where: DataFilter<T>): Promise<number> {
        return DataAccessObject.updateMany(this.source, this.table, where.query, set);
    }
}
