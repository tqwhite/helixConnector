var assert = require("assert");
describe('Testing System', function() {
  describe('Demonstration', function () {
    it('should return -1 since the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
    it('should return correct value when the value is  present', function () {
      assert.equal(2, [1,2,3].indexOf(3));
      assert.equal(1, [1,2,3].indexOf(2));
    });
  });
});