/* global describe, it  */
/* eslint-disable func-names, prefer-arrow-callback*/
const mongoose = require('mongoose');
import * as should from 'should';
import { FixturesUtil } from '../../util/fixtures.util';
import { w } from '../util';
let fixtures;
let connection;
const host = process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost';
const port = process.env.MONGO_PORT_27017_TCP_PORT || 27017;

before('establish mongoose connection', done => {
  mongoose.connect(`mongodb://${host}:${port}/mongo-fixture-loader-test-db`);
  connection = mongoose.connection;
  connection.on('error', function (_err) {
    done(_err);
  });
  connection.once('open', function () {
    done();
  });
});

describe('.constructor()', () => {
  it('should error when there is no connection provided', done => {
    try {
      fixtures = new FixturesUtil(null);
    } catch (e) {
      should.exist(e);
    }
    done();
  });

  it('should connect to the database', w(async () => {
    fixtures = new FixturesUtil(connection);
    await fixtures.refresh();
  }));

  it('should cache objects as extended json on istantiation', done => {
    fixtures.cachedBson.should.be.ok();
    (fixtures.cachedBson.user.length > 0).should.be.ok();
    done();
  });
});

describe('.cacheBson()', () => {
  it('should load data and retain their data types as extended json', done => {
    fixtures.cachedBson.user[0].should.have.property('_id').which.is.a.instanceOf(Object);
    fixtures.cachedBson.user[0].should.have.property('created').which.is.a.instanceOf(Date);
    done();
  });
});

// ~200ms
describe('.refresh()', function () {
  this.timeout(10000);
  it('should reload the data with fresh data', done => {
    connection
      .collection('users')
      .updateOne(
        { _id: fixtures.cachedBson.user[0]._id },
        { $set: { email: 'jaichopra@gmail.com' },
      }, function (err, result) {
        should.not.exist(err);
        result.result.ok.should.equal(1);
        fixtures.refresh().then(() => {
          connection
            .collection('users')
            .find({ email: 'jaichopra@kentandlime.com.au' })
            .toArray(function (_err, users) {
              should.not.exist(_err);
              should.exist(users);
              users.length.should.equal(1);
              done();
            });
        });
      });
  });
});

describe('.remove()', () => {
  it('should remove all fixture data', done => {
    fixtures.remove().then(() => {
      connection
        .collection('users')
        .find({})
        .toArray(function (err, docs) {
          should.not.exist(err);
          docs.length.should.equal(0);
          done();
        });
    });
  });
});

// ~160ms
describe('.seed()', function () {
  this.timeout(10000);
  it('should load fixture data', done => {
    fixtures.seed().then(() => {
      connection
        .collection('users')
        .find({})
        .toArray(function (err, docs) {
          should.not.exist(err);
          docs.length.should.not.equal(0);
          done();
        });
    });
  });
});

