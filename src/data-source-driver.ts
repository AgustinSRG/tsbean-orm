// Data source driver
// (Typescript Bean ORM)

"use strict";

import { GenericValue, GenericRow, GenericFilter, SortDirection, GenericKeyValue, GenericRowUpdate } from "./common";

/**
 * Extra options for a query
 */
export interface QueryExtraOptions {
    /**
     * Name of the index to use. Leave it undefined for the database to figure out automatically.
     */
    indexName?: string;
}


/**
 * Represents a driver to connect to a data source,
 * for example a database (MYSQL, Mongo, etc)
 */
export interface DataSourceDriver {
    /* Find */

    /**
     * Finds a row by primary key
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     */
    findByKey(table: string, keyName: string, keyValue: GenericValue): Promise<GenericRow>;

    /**
     * Finds rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to fetch from the table. Leave as null to fetch them all.
     * @param queryExtraOptions Additional query options
     */
    find(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, queryExtraOptions: QueryExtraOptions): Promise<GenericRow[]>;

    /**
     * Counts the number of rows matching a condition
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param queryExtraOptions Additional query options
     */
    count(table: string, filter: GenericFilter, queryExtraOptions: QueryExtraOptions): Promise<number>;

    /**
     * Finds rows (stream mode). You can parse each row with an ASYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to fetch from the table. Leave as null to fetch them all. 
     * @param queryExtraOptions Additional query options
     * @param each Function to parse each row
     */
    findStream(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, queryExtraOptions: QueryExtraOptions, each: (row: GenericRow) => Promise<void>): Promise<void>;

    /**
     * Finds rows (stream mode). You can parse each row with a SYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to fetch from the table. Leave as null to fetch them all. 
     * @param queryExtraOptions Additional query options
     * @param each Function to parse each row
     */
    findStreamSync(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, queryExtraOptions: QueryExtraOptions, each: (row: any) => void): Promise<void>;

    /* Insert */

    /**
     * Inserts a row
     * @param table Table or collection name
     * @param row Row to insert
     * @param key The name of the primary key (if any)
     * @param callback Callback to set the value of the primary key after inserting (Optional, only if auto-generated key)
     */
    insert(table: string, row: GenericRow, key: string, callback?: (value: GenericKeyValue) => void): Promise<void>;

    /**
     * Inserts many rows
     * @param table Table or collection name
     * @param rows List of rows to insert
     */
    batchInsert(table: string, rows: GenericRow[]): Promise<void>;

    /* Update */

    /**
     * Updates a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @param updated Updated row
     */
    update(table: string, keyName: string, keyValue: GenericKeyValue, updated: GenericRow): Promise<void>;

    /**
     * Updates many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param updated Updates to apply to each row
     * @returns The number of affected rows
     */
    updateMany(table: string, filter: GenericFilter, updated: GenericRowUpdate): Promise<number>;

    /* Delete */

    /**
     * Deletes a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @returns true if the row was deleted, false if the row didn't exists
     */
    delete(table: string, keyName: string, keyValue: GenericKeyValue): Promise<boolean>;

    /**
     * Deletes many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @returns The number of affected rows
     */
    deleteMany(table: string, filter: GenericFilter): Promise<number>;

    /* Aggregations */

    /**
     * Summation of many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param id Name of the primary key
     * @param field Name of the field to aggregate
     */
    sum(table: string, filter: GenericFilter, id: string, field: string): Promise<number>;

    /**
     * Atomic increment
     * @param table Table or collection name
     * @param keyName The name of the key
     * @param keyValue The value of the key
     * @param prop The field to increment
     * @param inc The amount to increment
     */
    increment(table: string, keyName: string, keyValue: GenericKeyValue, prop: string, inc: number): Promise<void>;
}