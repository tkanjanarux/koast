describe('tasks service', function() {
    // Load the angular module. Having smaller modules helps here.
    beforeEach(module('erg.tasks'));
    beforeEach(module(function($provide) {
        // Mock 'koast'.
        $provide.service('koast', function() {
            service = {
                user: {
                    whenAuthenticated: function() {
                        return Q.when();
                    },
                    data: {
                        username: 'alice'
                    }
                }
            }
            return service;

        });
        // mock server
        $provide.service('server', function() {
            var service = {};
            var data = [{
                description: 'Mow the lawn',
                owner: 'alice'
            }, {
                description: 'Fix the car',
                owner: 'bob'
            }];


            service.get = sinon.spy(function() {

                var deferred = Q.defer();
                deferred.resolve(data);
                // deferred.reject(new Error('Some Error'));
                return deferred.promise;
            });

            console.log(service.get)
            return service;
        });

        // Mock $q. More on this later.
        $provide.service('$q', function() {
            return Q;
        });
    }));

    it('should get tasks', function() {
        var tasks = getService('tasks');
        var server = getService('server');
        return tasks.getTasks()
            .then(function(receivedTasks) {
                expect(receivedTasks.length).to.equal(2);
                server.get.should.have.been.calledOnce;
            });
    });

    it('should set can.edit to true if current user is the owner', function() {
        var tasks = getService('tasks');
        return tasks.getTasks().then(function(receivedTasks) {
            expect(receivedTasks[0].can.edit).to.equal(true);
        });
    });

    it('should set can.edit to false if current user is the owner', function() {
        var tasks = getService('tasks');
        return tasks.getTasks().then(function(receivedTasks) {
            expect(receivedTasks[1].can.edit).to.equal(false);
        });
    });

});
