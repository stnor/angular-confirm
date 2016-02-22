describe('angularConfirmModal', function() {

    var $rootScope, $uibModal;

    beforeEach(angular.mock.module('angularConfirmModal', function ($provide) {

        $provide.decorator('$uibModal', function($delegate) {
            $uibModal = {
                open: jasmine.createSpy('$uibModal.open', function(settings) {
                    return {result: settings};
                })
            };
            return $uibModal;
        });

        $provide.decorator('$confirmModal', function($delegate) {
            return jasmine.createSpy('$confirmModal', $delegate);
        });

    }));

    beforeEach(angular.mock.inject(function (_$rootScope_) {
        $rootScope = _$rootScope_;
    }));

    describe('ConfirmModalController', function() {
        var $scope, controller, data = {testVal: 1}, $uibModalInstance;

        beforeEach(angular.mock.inject(function($controller) {
            $scope = $rootScope.$new();
            $uibModalInstance = {
                close: jasmine.createSpy('$uibModalInstance.close'),
                dismiss: jasmine.createSpy('$uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('$uibModalInstance.result.then')
                }
            };
            controller = $controller('ConfirmModalController', {"$scope": $scope, "$uibModalInstance": $uibModalInstance, "data": data});
        }));

        it("should copy the data, not use it as a reference", function() {
            data.testVal = 2;
            expect($scope.data.testVal).toEqual(1);
        });

        it("should call close when $scope.ok is invoked", function() {
            $scope.ok();
            expect($uibModalInstance.close).toHaveBeenCalled();
        });

        it("should call dismiss when $scope.cancel is invoked", function() {
            $scope.cancel();
            expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

    });

    describe('$confirmModal factory', function() {

        var $confirmModal, $confirmModalDefaults;

        beforeEach(angular.mock.inject(function(_$confirmModal_, _$confirmModalDefaults_) {
            $confirmModal = _$confirmModal_;
            $confirmModal.and.callThrough();
            $confirmModalDefaults = _$confirmModalDefaults_;
            $uibModal.open.and.callThrough();
        }));

        it("should call $uibModal.open", function() {
            $confirmModal();
            expect($uibModal.open).toHaveBeenCalled();
        });

        it("should override the defaults with settings passed in", function() {
            var settings = $confirmModal({}, {"template": "hello"});
            expect(settings.template).toEqual("hello");
        });
		
		it("should not change the defaults", function() {
            var settings = $confirmModal({}, {"templateUrl": "hello"});
            expect(settings.templateUrl).toEqual("hello");
			expect(settings.template).not.toBeDefined();
			expect($confirmModalDefaults.template).toBeDefined();
			expect($confirmModalDefaults.templateUrl).not.toBeDefined();
        });

        it("should override the default labels with the data passed in", function() {
            var settings = $confirmModal({title: "Title"});
            var data = settings.resolve.data();
            expect(data.title).toEqual("Title");
            expect(data.ok).toEqual('OK');
        });

        it("should remove template if templateUrl is passed in", function() {
            var settings = $confirmModal({}, {templateUrl: "abc.txt"});
            expect(settings.template).not.toBeDefined();
        });

    });

    describe('confirm directive', function() {
        var $scope, element, $confirmModal, data;

        beforeEach(angular.mock.inject(function (_$confirmModal_, $compile) {
            $confirmModal = _$confirmModal_;

            $confirmModal.and.callFake(function(d) {
                data = d;
                return {then: function() {}}
            });

            $scope = $rootScope.$new();
            $scope.click = jasmine.createSpy('$scope.click');
        }));

        describe('resolve properties in title', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure, {{name}}?">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the name to the text property", function() {
                element.triggerHandler('click');
                expect(data.text).toEqual('Are you sure, Joe?');
            });
        });

        describe('without confirmIf', function() {

            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should call confirm on click and not call the function", function() {
                element.triggerHandler('click');
                expect($scope.click).not.toHaveBeenCalled();
                expect($confirmModal).toHaveBeenCalled();
            });

        });

        describe('with confirmIf option', function() {

            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-if="truthy">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should call confirm on click and not call the function", function() {
                $scope.truthy = true;
                $scope.$apply();
                element.triggerHandler('click');
                expect($scope.click).not.toHaveBeenCalled();
                expect($confirmModal).toHaveBeenCalled();
            });

            it("should call the function", function() {
                $scope.truthy = false;
                $scope.$apply();
                element.triggerHandler('click');
                expect($scope.click).toHaveBeenCalled();
                expect($confirmModal).not.toHaveBeenCalled();
            });

        });

        describe('with confirmTitle option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-title="Hello, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.title).toEqual('Hello, Joe!');
            });

        });

        describe('with confirmOk option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-ok="Okie Dokie, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.ok).toEqual('Okie Dokie, Joe!');
            });
        });

        describe('with confirmCancel option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.name = 'Joe';
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-cancel="No Way, {{name}}!">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should resolve the confirmTitle to the title property", function() {
                element.triggerHandler('click');
                expect(data.cancel).toEqual('No Way, Joe!');
            });
        });

        describe('with confirmSettings option', function() {
            beforeEach(angular.mock.inject(function($compile) {
                $scope.settings = {name: 'Joe'};
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-settings="settings">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should pass the settings to $confirmModal", function() {
                element.triggerHandler('click');
                expect($confirmModal).toHaveBeenCalledWith({text: "Are you sure?"}, $scope.settings)
            });
        });

        describe('with confirmSettings option direct entry', function() {
            beforeEach(angular.mock.inject(function($compile) {
                element = angular.element('<button type="button" ng-click="click()" confirm-modal="Are you sure?" confirm-settings="{name: \'Joe\'}">Delete</button>');
                $compile(element)($scope);
                $scope.$digest();
            }));

            it("should pass the settings to $confirmModal", function() {
                element.triggerHandler('click');
                expect($confirmModal).toHaveBeenCalledWith({text: "Are you sure?"}, {name: "Joe"})
            });
        });

    });

});