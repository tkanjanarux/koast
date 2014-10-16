var expect = chai.expect;
describe('tasks', function() {

    it('2*2 should equal 4', function() {

        var x = 2 * 2;
        var y = 4;
        // Assert that x is defined.
        expect(x).to.not.be.undefined;
        // Assert that x equals to specific value.
        expect(x).to.equal(4);
        // Assert that x equals to y.
        expect(x).to.equal(y);
        // See http://chaijs.com/api/bdd/ for more assertion options.
    });
});
