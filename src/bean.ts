// Bean
// (Typescript Bean ORM)

"use strict";

import { DataAccessObject, makeCopyOfObject } from "./dao";
import { GenericRow } from "./data-source";
import { DataFilter } from "./filtering";

/**
 * Abstract data model
 */
export class DataModel {
    private dao: DataAccessObject;

    /**
     * Constructor
     * @param source Name of the data source 
     * @param table Name of the table
     * @param primaryKey Name of the primery key
     */
    constructor(source: string, table: string, primaryKey: string) {
        this.dao = new DataAccessObject(source, table, primaryKey, {});
    }

    /**
     * Initializes the data access object.
     */
    public init() {
        this.dao.changeRef(this);
    }

    /**
     * Checks if a property changed
     * @param prop Name of the property
     * @returns true if the property changed
     */
    public _hasChanged(prop: string) {
        return (this.dao.original[prop] !== this.dao.ref[prop]);
    }

    // Persistence

    /**
     * Saves the changes of this model on the database.
     * @param condition Optional. Only saves if a condition is reached.
     */
    public async save(condition?: DataFilter): Promise<boolean> {
        if (this.dao.ref !== this) {
            throw new Error("You must call init() before using persistence methods.");
        }
        return this.dao.save(condition);
    }

    /**
     * Deletes the model from the database
     */
    public async delete(): Promise<boolean> {
        if (this.dao.ref !== this) {
            throw new Error("You must call init() before using persistence methods.");
        }
        return this.dao.delete();
    }

    /**
     * Inserts a new entry in the database.
     */
    public async insert() {
        if (this.dao.ref !== this) {
            throw new Error("You must call init() before using persistence methods.");
        }
        return this.dao.insert();
    }

    /**
     * Atomic increment
     * @param field The field to increment
     * @param inc The amount to increment
     */
    public async increment(field: string, inc: number) {
        if (this.dao.ref !== this) {
            throw new Error("You must call init() before using persistence methods.");
        }
        return this.dao.increment(field, inc);
    }

    /**
     * Turns the bean into a plain object
     * @param options Filtering options for properties
     * @returns The plain object
     */
    public toObject(options?: {whitelist?: string[], blacklist: string[]}): GenericRow {
        const copy = makeCopyOfObject(this);

        if (options) {
            if (options.whitelist) {
                for (const k of Object.keys(copy)) {
                    if (!options.whitelist.includes(k)) {
                        delete copy[k];
                    }
                }
            }

            if (options.blacklist) {
                for (const k of Object.keys(copy)) {
                    if (options.blacklist.includes(k)) {
                        delete copy[k];
                    }
                }
            }
        }

        return copy;
    }

    /**
     * Serializes the bean as JSON
     * @param options Filtering options for properties
     * @returns The JSON string
     */
    public toJSON(options?: {whitelist?: string[], blacklist: string[]}): string {
        return JSON.stringify(this.toObject(options));
    }
}
