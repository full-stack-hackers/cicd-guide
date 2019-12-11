const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
chai.use(chaiHttp)

describe('API Tests', () => {
  describe('/GET index route', () => {
    it('Should return successfully', (done) => {
      chai.request(server).get('/').end((err, res) => {
        res.should.have.status(200);
        done();
      })
    });
  });
});