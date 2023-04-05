// Test

"use strict";

import { expect } from 'chai';
import { DataFilter, DataSource, DataUpdate, OrderBy, SelectOptions } from '../src/index';
import { Person } from './models/person';
import { Dummy } from './models/dummy';
import { TestDriver } from './driver/test-driver';

const dataSource: DataSource = TestDriver.createDataSource();

DataSource.set(DataSource.DEFAULT, dataSource);

interface PersonData {
    id: number;
    name: string;
    surname: string;
    age: number;
    hasDriverLicense: boolean;
    preferences: string[] | null;
    birthDate: Date;
}

describe("tsbean-orm testing", () => {

    it("Insert (Person) and FindByKey", async () => {
        const person = new Person({
            id: 1,
            name: "foo",
            surname: "bar",
            age: 18,
            hasDriverLicense: true,
            preferences: ["pref1", "pref2"],
            birthDate: new Date("2000-01-01T00:00:00.000Z"),
        });

        await person.insert();

        // Find the person
        const personFound = await Person.finder.findByKey(person.id);

        expect(personFound).not.to.be.null;

        expect(personFound.toObject()).to.be.eql(person.toObject());
    });

    it("Update (Person)", async () => {
        const person = await Person.finder.findByKey(1);

        expect(person).not.to.be.null;

        person.name = "Carlos";
        person.surname = "Evans";
        person.age = 60;
        person.birthDate = new Date("1960-09-01");
        person.preferences.push("salt");
        person.hasDriverLicense = false;

        await person.save();

        // Find the person
        const personFound = await Person.finder.findByKey(person.id);

        expect(personFound).not.to.be.null;

        expect(personFound.toObject()).to.be.eql(person.toObject());
    });

    it("Update with condition", async () => {
        const person = await Person.finder.findByKey(1);

        expect(person).not.to.be.null;

        person.name = "Albert";

        await person.save(DataFilter.equals("age", 10));

        // Find the person
        const personFound = await Person.finder.findByKey(person.id);

        expect(personFound).not.to.be.null;

        expect(personFound.name).to.be.equals("Carlos");

        await person.save(DataFilter.equals("age", person.age));

        // Find the person
        const personFound2 = await Person.finder.findByKey(person.id);

        expect(personFound2).not.to.be.null;

        expect(personFound2.name).to.be.equals("Albert");
    });

    it("Increment and Decrement", async () => {
        const person = await Person.finder.findByKey(1);

        expect(person).not.to.be.null;

        await person.increment("age", 10);

        // Find the person
        const personFound = await Person.finder.findByKey(person.id);

        expect(personFound).not.to.be.null;

        expect(personFound.age).to.be.equals(70);

        await person.increment("age", -20);

        // Find the person
        const personFound2 = await Person.finder.findByKey(person.id);

        expect(personFound2).not.to.be.null;

        expect(personFound2.age).to.be.equals(50);
    });


    it("Delete (Person)", async () => {
        const person = await Person.finder.findByKey(1);

        expect(person).not.to.be.null;

        await person.delete();

        // Find the person
        const personFound = await Person.finder.findByKey(person.id);

        expect(personFound).to.be.null;
    });

    it("Insert (Dummy) and FindByKey", async () => {
        const dummy = new Dummy({
            id: "dummy-0001",
            value1: 10,
            value2: 2.1,
            value3: "test",
            data: {
                a: 1,
                b: 2,
                c: "x"
            },
        });

        await dummy.insert();

        // Find the dummy
        const dummyFound = await Dummy.finder.findByKey(dummy.id);

        expect(dummyFound).not.to.be.null;

        expect(dummyFound.toObject()).to.be.eql(dummy.toObject());
    });

    it("Update (Dummy)", async () => {
        const dummy = await Dummy.finder.findByKey("dummy-0001");

        dummy.value1 = 40;
        dummy.value2 = 9.6;
        dummy.value3 = "test3";
        dummy.data.o = {
            b: 8,
            l: "h"
        };

        await dummy.save();

        // Find the dummy
        const dummyFound = await Dummy.finder.findByKey(dummy.id);

        expect(dummyFound).not.to.be.null;

        expect(dummyFound.toObject()).to.be.eql(dummy.toObject());
    });

    it("Update primary key (Dummy)", async () => {
        const dummy = await Dummy.finder.findByKey("dummy-0001");

        dummy.id = "dummy-other";

        await dummy.save();

        // Find the dummy
        const dummyFound = await Dummy.finder.findByKey(dummy.id);

        expect(dummyFound).not.to.be.null;

        expect(dummyFound.toObject()).to.be.eql(dummy.toObject());

        // The old ID must not exists
        const oldDummy = await Dummy.finder.findByKey("dummy-0001");

        expect(oldDummy).to.be.null;
    });

    it("Delete all dummys", async () => {
        await Dummy.finder.delete(DataFilter.any());
        expect(await Dummy.finder.count(DataFilter.any())).to.be.equal(0);
    });

    let rows: PersonData[] = [
        { id: 1, name: "Aidan", surname: "Sanders", birthDate: new Date("2000-03-01"), age: 10, hasDriverLicense: true, preferences: [] },
        { id: 2, name: "Carlos", surname: "Ward", birthDate: new Date("1990-03-01"), age: 20, hasDriverLicense: true, preferences: null },
        { id: 3, name: "Charlie", surname: "Cox", birthDate: new Date("1980-03-01"), age: 30, hasDriverLicense: true, preferences: [] },
        { id: 4, name: "Alice", surname: "Evans", birthDate: new Date("1970-03-01"), age: 40, hasDriverLicense: true, preferences: [] },
        { id: 5, name: "Luisa", surname: "Bryant", birthDate: new Date("1960-03-01"), age: 50, hasDriverLicense: true, preferences: [] },
        { id: 6, name: "Martin", surname: "Evans", birthDate: new Date("1950-03-01"), age: 60, hasDriverLicense: true, preferences: [] },
        { id: 7, name: "Rose", surname: "Jenkins", birthDate: new Date("1940-03-01"), age: 70, hasDriverLicense: true, preferences: [] },
        { id: 8, name: "Scott", surname: "Murray", birthDate: new Date("1930-03-01"), age: 80, hasDriverLicense: true, preferences: [] },
        { id: 9, name: "Teresa", surname: "Peterson", birthDate: new Date("1930-03-01"), age: 90, hasDriverLicense: true, preferences: null },
        { id: 10, name: "Hector", surname: "Tucker", birthDate: new Date("1910-03-01"), age: 100, hasDriverLicense: true, preferences: [] }
    ];

    it("Batch Insert and Find All", async () => {
        await dataSource.driver.batchInsert("person", rows);

        expect(await Person.finder.count(DataFilter.any())).to.be.equal(10);

        const results = await Person.finder.find(DataFilter.any(), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows);
    });

    it("Find (Reverse Order)", async () => {
        const results = await Person.finder.find(DataFilter.any(), OrderBy.desc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.slice().reverse());
    });

    it("Find (Stream)", async () => {
        const results: Person[] = [];
        await Person.finder.findStream(DataFilter.any(), OrderBy.asc("id"), SelectOptions.default(), async (person: Person) => {
            results.push(person);
        });

        expect(results.map(a => a.toObject())).to.be.eql(rows.slice());
    });

    it("Find (Stream Sync)", async () => {
        const results: Person[] = [];
        await Person.finder.findStreamSync(DataFilter.any(), OrderBy.asc("id"), SelectOptions.default(), async (person: Person) => {
            results.push(person);
        });

        expect(results.map(a => a.toObject())).to.be.eql(rows.slice());
    });

    it("Find (EQ)", async () => {
        const results = await Person.finder.find(DataFilter.equals("name", "Aidan"), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name === "Aidan"));
    });

    it("Find (NE)", async () => {
        const results = await Person.finder.find(DataFilter.notEquals("surname", "Evans"), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.surname !== "Evans"));
    });

    it("Find (NOT NULL)", async () => {
        const results = await Person.finder.find(DataFilter.isNotNull("preferences"), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.preferences !== null));
    });

    it("Find (NULL)", async () => {
        const results = await Person.finder.find(DataFilter.isNull("preferences"), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.preferences === null));
    });

    it("Find (GT)", async () => {
        const results = await Person.finder.find(DataFilter.greaterThan("age", 20), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age > 20));
    });

    it("Find (GTE)", async () => {
        const results = await Person.finder.find(DataFilter.greaterOrEquals("age", 20), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age >= 20));
    });

    it("Find (LT)", async () => {
        const results = await Person.finder.find(DataFilter.lessThan("age", 20), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age < 20));
    });

    it("Find (LTE)", async () => {
        const results = await Person.finder.find(DataFilter.lessOrEquals("age", 20), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age <= 20));
    });

    it("Find (AND)", async () => {
        const results = await Person.finder.find(DataFilter.and(DataFilter.greaterOrEquals("age", 20), DataFilter.lessThan("age", 60)), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age >= 20 && a.age < 60));
    });

    it("Find (OR)", async () => {
        const results = await Person.finder.find(DataFilter.or(DataFilter.equals("age", 20), DataFilter.equals("age", 60)), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.age === 20 || a.age === 60));
    });

    it("Find (NOT)", async () => {
        const results = await Person.finder.find(DataFilter.not(DataFilter.or(DataFilter.equals("age", 20), DataFilter.equals("age", 60))), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => !(a.age === 20 || a.age === 60)));
    });

    it("Find (STARTS WITH)", async () => {
        const results = await Person.finder.find(DataFilter.startsWith("name", "a", false), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.startsWith("a")));
    });

    it("Find (STARTS WITH IGNORE CASE)", async () => {
        const results = await Person.finder.find(DataFilter.startsWith("name", "a", true), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.toLowerCase().startsWith("a")));
    });

    it("Find (ENDS WITH)", async () => {
        const results = await Person.finder.find(DataFilter.endsWith("name", "a", false), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.endsWith("a")));
    });

    it("Find (ENDS WITH IGNORE CASE)", async () => {
        const results = await Person.finder.find(DataFilter.endsWith("name", "a", true), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.toLowerCase().endsWith("a")));
    });

    it("Find (CONTAINS)", async () => {
        const results = await Person.finder.find(DataFilter.contains("name", "a", false), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.includes("a")));
    });

    it("Find (CONTAINS IGNORE CASE)", async () => {
        const results = await Person.finder.find(DataFilter.contains("name", "a", true), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows.filter(a => a.name.toLowerCase().includes("a")));
    });

    it("PROJECTION", async () => {
        const results = await Person.finder.find(DataFilter.any(), OrderBy.asc("id"), SelectOptions.configure().fetchOnly(["id", "name"]));

        expect(results.map(a => a.toObject())).to.be.eql(rows.map(a => {
            return {
                id: a.id,
                name: a.name,
                surname: null,
                age: null,
                hasDriverLicense: null,
                preferences: null,
                birthDate: null
            };
        }));
    });

    it("LIMIT", async () => {
        const results = await Person.finder.find(DataFilter.any(), OrderBy.asc("id"), SelectOptions.configure().setMaxRows(2));

        expect(results.map(a => a.toObject())).to.be.eql(rows.slice(0, 2));
    });

    it("SKIP + LIMIT", async () => {
        const results = await Person.finder.find(DataFilter.any(), OrderBy.asc("id"), SelectOptions.configure().setFirstRow(2).setMaxRows(2));

        expect(results.map(a => a.toObject())).to.be.eql(rows.slice(2).slice(0, 2));
    });


    it("UPDATE MANY", async () => {
        rows = rows.map(row => {
            if (row.age > 50) {
                row.hasDriverLicense = false;
                row.age++;
            }
            return row;
        });

        await Person.finder.update({ hasDriverLicense: DataUpdate.set(false), age: DataUpdate.increment(1) }, DataFilter.greaterThan("age", 50));

        const results = await Person.finder.find(DataFilter.any(), OrderBy.asc("id"));

        expect(results.map(a => a.toObject())).to.be.eql(rows);
    });

    it("AGGREGATION (SUM)", async () => {
        const value = await Person.finder.sum("age", DataFilter.any());

        let expectedValue = 0;
        rows.forEach(element => {
            expectedValue += element.age;
        });

        expect(value).to.be.equals(expectedValue);
    });

    it("AGGREGATION (SUM WITH FILTER)", async () => {
        const value = await Person.finder.sum("age", DataFilter.equals("surname", "Evans"));

        let expectedValue = 0;
        rows.filter(a => a.surname === "Evans").forEach(element => {
            expectedValue += element.age;
        });

        expect(value).to.be.equals(expectedValue);
    });
});
