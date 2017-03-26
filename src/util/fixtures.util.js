const EJSON = require('mongodb-extended-json');
const models = ['user'];

export class FixturesUtil {
  constructor(_connection) {
    if (!_connection) {
      throw new Error('Requires mongodb connection');
    }
    this.db = _connection;
    this.cacheBson();
  }

  async refresh() {
    await this.remove();
    await this.seed();
  }

  cacheBson() {
    this.cachedBson = {};
    for (const model of models) {
      const data = this.grabFixtureData(model);
      this.cachedBson[model] = EJSON.parse(JSON.stringify(data));
    }
  }

  async remove() {
    const removePromises = [];
    for (const model of models) {
      removePromises.push(this.genFixtureRemovePromise(model));
    }
    await Promise.all(removePromises);
  }

  async seed() {
    const seedPromises = [];
    for (const model of models) {
      seedPromises.push(this.genFixturePromise(model));
    }
    await Promise.all(seedPromises);
  }

  genFixturePromise(model) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.createPlural(model)).insertMany(this.cachedBson[model], {}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  genFixtureRemovePromise(model) {
    return new Promise((resolve, reject) => {
      this.db.collection(this.createPlural(model)).remove(err => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  grabFixtureData(model) {
    return require(`../fixtures/${this.createPlural(model)}.json`);
  }

  createPlural(model) {
    // model = `${model.charAt(0).toLowerCase()}${model.slice(1)}`;
    const lastChar = model.slice(-1);
    if (lastChar === 'y') {
      model = `${model.slice(0, -1)}ies`;
    } else {
      model = `${model}s`;
    }
    return model;
  }
}
