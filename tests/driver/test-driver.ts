// Driver implementation

"use strict";

import { DataSourceDriver, DataSource, GenericKeyValue, GenericRow, SortDirection, GenericFilter, GenericRowUpdate } from "../../src/index";

function matchesFilter(row: any, filter: GenericFilter): boolean {
    if (!filter) {
        return true;
    }

    switch (filter.operation) {
        case "and":
            for (const subCondition of filter.children) {
                if (!matchesFilter(row, subCondition)) {
                    return false;
                }
            }
            return true;
        case "or":
            for (const subCondition of filter.children) {
                if (matchesFilter(row, subCondition)) {
                    return true;
                }
            }
            return false;
        case "not":
            return !matchesFilter(row, filter.child);
        case "regex":
            return filter.regexp.test(row[filter.key]);
        case "in":
            return filter.values.includes(row[filter.key]);
        case "exists":
            if (filter.exists) {
                return row[filter.key] !== null && row[filter.key] !== undefined;
            } else {
                return row[filter.key] === null || row[filter.key] === undefined;
            }
        case "eq":
            return row[filter.key] === filter.value;
        case "ne":
            return row[filter.key] !== filter.value;
        case "gt":
            return row[filter.key] > filter.value;
        case "lt":
            return row[filter.key] < filter.value;
        case "gte":
            return row[filter.key] >= filter.value;
        case "lte":
            return row[filter.key] <= filter.value;
    }
}

/**
 * Driver class
 */
export class TestDriver implements DataSourceDriver {

    /**
     * Creates a data source for this driver
     * @returns The data source
     */
    public static createDataSource(/* Pass here the options */): DataSource {
        const driver = new TestDriver();

        return new DataSource("tsbean.driver.test", driver);
    }

    private data: Map<string, any[]>;

    constructor(/* Pass here the connection object */) {
        this.data = new Map();
    }

    private getTable(table: string): any[] {
        if (!this.data.has(table)) {
            this.data.set(table, []);
        }
        return <any[]>this.data.get(table);
    }

    /**
     * Finds a row by primary key
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     */
    public async findByKey(table: string, keyName: string, keyValue: any): Promise<GenericRow> {
        const data = this.getTable(table);
        const filteredData = data.filter(d => {
            return d[keyName] === keyValue;
        });
        return filteredData[0] || null;
    }

    /**
     * Finds rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to featch from the table. Leave as null to fetch them all.
     */
    public async find(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>): Promise<GenericRow[]> {
        const data = this.getTable(table);

        let filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        if (sortBy) {
            filteredData = filteredData.sort((a, b) => {
                if (sortDir === "desc") {
                    if (a[sortBy] < b[sortBy]) {
                        return 1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if (a[sortBy] < b[sortBy]) {
                        return -1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
        }

        if (typeof skip === "number" && skip > 0) {
            filteredData = filteredData.slice(skip);
        }

        if (typeof limit === "number" && limit >= 0) {
            filteredData = filteredData.slice(0, limit);
        }

        filteredData = filteredData.map(d => {
            const row = Object.create(null);

            for (let key of Object.keys(d)) {
                if (!projection || projection.has(key)) {
                    row[key] = d[key];
                }
            }

            return row;
        });

        return filteredData;
    }

    /**
     * Counts the number of rows matching a condition
     * @param table Table or collection name
     * @param filter Filter to apply
     */
    public async count(table: string, filter: GenericFilter): Promise<number> {
        const data = this.getTable(table);

        let filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        return filteredData.length;
    }

    /**
     * Finds rows (stream mode). You can parse each row with an ASYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to fetch from the table. Leave as null to fetch them all.
     * @param each Function to parse each row
     */
    public async findStream(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: GenericRow) => Promise<void>): Promise<void> {
        const data = this.getTable(table);

        let filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        if (sortBy) {
            filteredData = filteredData.sort((a, b) => {
                if (sortDir === "desc") {
                    if (a[sortBy] < b[sortBy]) {
                        return 1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if (a[sortBy] < b[sortBy]) {
                        return -1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
        }

        if (typeof skip === "number" && skip > 0) {
            filteredData = filteredData.slice(skip);
        }

        if (typeof limit === "number" && limit >= 0) {
            filteredData = filteredData.slice(0, limit);
        }

        filteredData = filteredData.map(d => {
            const row = Object.create(null);

            for (let key of Object.keys(d)) {
                if (!projection || projection.has(key)) {
                    row[key] = d[key];
                }
            }

            return row;
        });

        for (let row of filteredData) {
            await each(row);
        }
    }


    /**
     * Finds rows (stream mode). You can parse each row with a SYNC function
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param sortBy Sort results by this field. Leave as null for default sorting
     * @param sortDir "asc" or "desc". Leave as null for default sorting
     * @param skip Number of rows to skip. Leave as -1 for no skip
     * @param limit Limit of results. Leave as -1 for no limit
     * @param projection List of fields to fetch from the table. Leave as null to fetch them all.
     * @param each Function to parse each row
     */
    public async findStreamSync(table: string, filter: GenericFilter, sortBy: string, sortDir: SortDirection, skip: number, limit: number, projection: Set<string>, each: (row: any) => void): Promise<void> {
        const data = this.getTable(table);

        let filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        if (sortBy) {
            filteredData = filteredData.sort((a, b) => {
                if (sortDir === "desc") {
                    if (a[sortBy] < b[sortBy]) {
                        return 1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if (a[sortBy] < b[sortBy]) {
                        return -1;
                    } else if (a[sortBy] > b[sortBy]) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
        }

        if (typeof skip === "number" && skip > 0) {
            filteredData = filteredData.slice(skip);
        }

        if (typeof limit === "number" && limit >= 0) {
            filteredData = filteredData.slice(0, limit);
        }

        filteredData = filteredData.map(d => {
            const row = Object.create(null);

            for (let key of Object.keys(d)) {
                if (!projection || projection.has(key)) {
                    row[key] = d[key];
                }
            }

            return row;
        });

        filteredData.forEach(each);
    }

    /**
     * Inserts a row
     * @param table Table or collection name
     * @param row Row to insert
     * @param key The name of the primary key (if any)
     * @param callback Callback to set the value of the primary key after inserting (Optional, only if auto-generated key)
     */
    public async insert(table: string, row: GenericRow, key: string, callback?: (value: GenericKeyValue) => void): Promise<void> {
        const data = this.getTable(table);

        data.push(row);

        if (callback) {
            callback(row[key]);
        }
    }

    /**
     * Inserts many rows
     * @param table Table or collection name
     * @param rows List of rows to insert
     */
    public async batchInsert(table: string, rows: GenericRow[]): Promise<void> {
        const data = this.getTable(table);
        rows.forEach(row => {
            data.push(row);
        });
    }

    /**
     * Updates a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @param updated Updated row
     */
    public async update(table: string, keyName: string, keyValue: GenericKeyValue, updated: GenericRowUpdate): Promise<void> {
        const data = this.getTable(table);
        const filteredData = data.filter(d => {
            return d[keyName] === keyValue;
        });

        filteredData.forEach(d => {
            for (let key of Object.keys(updated)) {
                d[key] = updated[key];
            }
        });
    }

    /**
     * Updates many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param updated Updated row
     * @returns The number of affected rows
     */
    public async updateMany(table: string, filter: GenericFilter, updated: GenericRowUpdate): Promise<number> {
        const data = this.getTable(table);

        const filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        filteredData.forEach(d => {
            for (let key of Object.keys(updated)) {
                if (typeof updated[key] == "object" && updated[key] !== null && updated[key].update === "set") {
                    d[key] = updated[key].value;
                } else if (typeof updated[key] == "object" && updated[key] !== null && updated[key].update === "inc") {
                    d[key] += updated[key].value;
                } else {
                    d[key] = updated[key];
                }
            }
        });

        return filteredData.length;
    }

    /**
     * Deletes a row
     * @param table Table or collection name
     * @param keyName Name of the key
     * @param keyValue Value of the key
     * @returns true if the row was deleted, false if the row didn't exists
     */
    public async delete(table: string, keyName: string, keyValue: GenericKeyValue): Promise<boolean> {
        const data = this.getTable(table);

        const toDelete = data.filter(d => {
            return d[keyName] === keyValue;
        }).length;

        const filteredData = data.filter(d => {
            return d[keyName] !== keyValue;
        });

        this.data.set(table, filteredData);

        return toDelete > 0;
    }

    /**
     * Deletes many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @returns The number of affected rows
     */
    public async deleteMany(table: string, filter: GenericFilter): Promise<number> {
        const data = this.getTable(table);

        const toDelete = data.filter(d => {
            return matchesFilter(d, filter);
        }).length;

        const filteredData = data.filter(d => {
            return !matchesFilter(d, filter);
        });

        this.data.set(table, filteredData);

        return toDelete;
    }

    /**
     * Summation of many rows
     * @param table Table or collection name
     * @param filter Filter to apply
     * @param id Name of the primary key
     * @param field Name of the field to aggregate
     */
    public async sum(table: string, filter: GenericFilter, id: string, field: string): Promise<number> {
        const data = this.getTable(table);

        const filteredData = data.filter(d => {
            return matchesFilter(d, filter);
        });

        return filteredData.reduce((prev: number, row: any) => {
            return prev + row[field];
        }, 0);
    }

    /**
     * Atomic increment
     * @param table Table or collection name
     * @param keyName The name of the key
     * @param keyValue The value of the key
     * @param prop The field to increment
     * @param inc The amount to increment
     */
    public async increment(table: string, keyName: string, keyValue: GenericKeyValue, prop: string, inc: number): Promise<void> {
        const data = this.getTable(table);

        const filteredData = data.filter(d => {
            return d[keyName] === keyValue;
        });

        filteredData.forEach(d => {
            d[prop] += inc;
        });
    }
}
